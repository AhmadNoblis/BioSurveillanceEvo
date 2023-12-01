import React, { useState, useEffect } from "react";

import { InMemoryFile } from "@nerfzael/memory-fs";
import cl100k_base from "gpt-tokenizer/esm/encoding/cl100k_base";
import clsx from "clsx";
import AccountConfig from "../src/components/AccountConfig";
import DojoError from "../src/components/DojoError";
import Sidebar from "../src/components/Sidebar";
import Chat, { ChatMessage } from "../src/components/Chat";
import { updateWorkspaceFiles } from "../src/updateWorkspaceFiles";
import {
  AgentContext,
  Evo,
  SubWorkspace,
  InMemoryWorkspace,
  Logger,
  ConsoleLogger,
  Scripts,
  Env,
  OpenAILlmApi,
  LlmModel,
  LlmApi,
  EmbeddingApi,
  Chat as EvoChat,
  OpenAIEmbeddingAPI,
} from "@evo-ninja/agents";
import { createInBrowserScripts } from "../src/scripts";
import WelcomeModal, { WELCOME_MODAL_SEEN_STORAGE_KEY } from "../src/components/WelcomeModal";
import { BrowserLogger } from "../src/sys/logger";
import { checkLlmModel } from "../src/checkLlmModel";
import { ProxyLlmApi, ProxyEmbeddingApi } from "../src/api";
import { useSession } from "next-auth/react";
import { AuthProxy } from "../src/api/AuthProxy";
import { useDojo } from "../src/hooks/useDojo";

function Dojo() {
  const { dojo, setDojo, saveConfig, setDojoError } = useDojo()
  const { data: session } = useSession()

  const [welcomeModalOpen, setWelcomeModalOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accountModal, setAccountModalOpen] = useState(false);
  const [evo, setEvo] = useState<Evo | undefined>(undefined);
  const [proxyEmbeddingApi, setProxyEmbeddingApi] = useState<ProxyEmbeddingApi | undefined>(undefined);
  const [proxyLlmApi, setProxyLlmApi] = useState<ProxyLlmApi | undefined>(undefined);
  const [userFiles, setUserFiles] = useState<InMemoryFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<InMemoryFile[]>([]);
  const [userWorkspace, setUserWorkspace] = useState<
    InMemoryWorkspace | undefined
  >(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [capReached, setCapReached] = useState<boolean>(false)
  const [awaitingAuth, setAwaitingAuth] = useState<boolean>(false);
  const [firstTimeUser, setFirstTimeUser] = useState<boolean>(false);

  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
    const firstVisit = localStorage.getItem(WELCOME_MODAL_SEEN_STORAGE_KEY);
    if (!firstVisit) {
      localStorage.setItem(WELCOME_MODAL_SEEN_STORAGE_KEY, "true");
      setWelcomeModalOpen(true);
    }
  }, [])

  function checkForUserFiles() {
    if (!evo || !userWorkspace) {
      return;
    }
    updateWorkspaceFiles(userWorkspace, userFiles, setUserFiles);
  }

  function onMessage(message: ChatMessage) {
    setMessages((messages) => [...messages, message]);
    checkForUserFiles();
  }

  useEffect(() => {
    if (!evo || !userWorkspace) {
      return;
    }

    for (const file of uploadedFiles) {
      userWorkspace.writeFileSync(
        file.path,
        new TextDecoder().decode(file.content)
      );
    }

    checkForUserFiles();
  }, [uploadedFiles]);

  // const onDisclaimerSelect = (approve: boolean) => {
  //   localStorage.setItem("allow-telemetry", approve.toString());
  //   setDojo({
  //     config:{
  //     ...dojo.config,
  //     allowTelemetry: approve
  //   }});
  // };

  useEffect(() => {
    (async () => {
      setDojo({ error: undefined, config: dojo.config });
      try {
        const browserLogger = new BrowserLogger({
          onLog: (message: string) => {
            onMessage({
              user: "evo",
              title: message,
            });
          },
        });
        const logger = new Logger([browserLogger, new ConsoleLogger()], {
          promptUser: () => Promise.resolve("N/A"),
        });

        const scriptsWorkspace = createInBrowserScripts();
        const scripts = new Scripts(scriptsWorkspace);

        // Point by default to GPT-4 unless the given api key's account doesn't support it
        let model = "gpt-4"
        if (dojo.config.openAiApiKey) {
          try {
            model = await checkLlmModel(dojo.config.openAiApiKey as string, model);
          } catch (e: any) {
            if (e.message.includes("Incorrect API key provided")) {
              setDojoError("Open AI API key is not correct. Please make sure it has the correct format");
              // setDojoError("Open AI API key is not correct. Please make sure it has the correct format")
              return
            }
          }
        }

        const env = new Env({
          OPENAI_API_KEY: dojo.config.openAiApiKey || " ",
          GPT_MODEL: model,
          CONTEXT_WINDOW_TOKENS: "8000",
          MAX_RESPONSE_TOKENS: "2000",
        });

        let llm: LlmApi;
        let embedding: EmbeddingApi;

        if (dojo.config.openAiApiKey) {
          llm = new OpenAILlmApi(
            env.OPENAI_API_KEY,
            env.GPT_MODEL as LlmModel,
            env.CONTEXT_WINDOW_TOKENS,
            env.MAX_RESPONSE_TOKENS,
            logger
          );
          embedding = new OpenAIEmbeddingAPI(env.OPENAI_API_KEY, logger, cl100k_base)
        } else {
          llm = new ProxyLlmApi(
            env.GPT_MODEL as LlmModel,
            env.CONTEXT_WINDOW_TOKENS,
            env.MAX_RESPONSE_TOKENS,
            () => setCapReached(true)
          );
          setProxyLlmApi(llm as ProxyLlmApi);
          embedding = new ProxyEmbeddingApi(cl100k_base, () => setCapReached(true));
          setProxyEmbeddingApi(embedding as ProxyEmbeddingApi);
        }

        let workspace = userWorkspace;

        if (!workspace) {
          workspace = new InMemoryWorkspace();
          setUserWorkspace(workspace);
        }

        const internals = new SubWorkspace(".evo", workspace);

        const chat = new EvoChat(cl100k_base);
        setEvo(
          new Evo(
            new AgentContext(
              llm,
              embedding,
              chat,
              logger,
              workspace,
              internals,
              env,
              scripts
            )
          )
        );
      } catch (err) {
        setDojoError(err as string);
      }
    })();
  }, [dojo.config]);

  const handlePromptAuth = async (message: string) => {
    if (awaitingAuth) {
      return false;
    }

    if (!dojo.config.openAiApiKey && !session?.user) {
      setFirstTimeUser(true);
      setAccountModalOpen(true);
      return false;
    } else {
      setFirstTimeUser(false);
    }

    const subsidize = !dojo.config.openAiApiKey;

    setAwaitingAuth(true);
    const goalId = await AuthProxy.checkGoal(
      dojo.config.allowTelemetry ? message : "<redacted>",
      subsidize,
      () => setCapReached(true)
    );
    setAwaitingAuth(false);

    if (!goalId) {
      return false;
    }

    proxyLlmApi?.setGoalId(goalId);
    proxyEmbeddingApi?.setGoalId(goalId);
    return true
  }

  return (
    <>
      <div className="flex h-full bg-neutral-800 bg-landing-bg bg-repeat text-center text-neutral-400">
        {(accountModal || capReached) && (
          <AccountConfig
            apiKey={dojo.config.openAiApiKey}
            allowTelemetry={dojo.config.allowTelemetry}
            onConfigSaved={(apiKey, allowTelemetry) => { 
              saveConfig(apiKey, allowTelemetry)
              // setAccountModalOpen(false)
            }}
            capReached={capReached}
            firstTimeUser={firstTimeUser}
          />
        )}
        <div className={clsx(
          "relative w-full lg:w-auto lg:max-w-md",
          {
            hidden: !sidebarOpen,
          },
        )}>
          <Sidebar
            onSidebarToggleClick={() => {
              setSidebarOpen(!sidebarOpen);
            }}
            onSettingsClick={() => setAccountModalOpen(true)}
            userFiles={userFiles}
            onUploadFiles={setUploadedFiles}
          />
        </div>
        <div className={clsx("relative grow border-l-2 border-neutral-700", {
          "max-lg:hidden": sidebarOpen,
        })}>
          <>
            {dojo.error ? <DojoError error={dojo.error} /> : evo && (
              <Chat
                evo={evo}
                onMessage={onMessage}
                messages={messages}
                sidebarOpen={sidebarOpen}
                overlayOpen={welcomeModalOpen || accountModal}
                // onDisclaimerSelect={onDisclaimerSelect}
                onSidebarToggleClick={() => {
                  setSidebarOpen(!sidebarOpen);
                }}
                onUploadFiles={setUploadedFiles}
                handlePromptAuth={handlePromptAuth}
              />
            )}
          </>
        </div>
      </div>
      <WelcomeModal isOpen={welcomeModalOpen} onClose={() => setWelcomeModalOpen(false)} />
    </>
  );
}

export default Dojo;
