import {
  Env,
  Scripts,
  OpenAI,
  Chat,
  ContextWindow,
  LlmApi,
  ConsoleLogger,
  Logger,
  WrapClient,
  agentPlugin,
} from "@evo-ninja/agent-utils";
import { FileSystemWorkspace } from "@evo-ninja/agent-utils-fs";
import { DebugLog, DebugLlmApi } from "@evo-ninja/agent-debug";
import * as rimraf from "rimraf";
import dotenv from "dotenv";
import path from "path";
import cl100k_base from "gpt-tokenizer/cjs/encoding/cl100k_base";
import { ScriptedAgent } from "../..";
import { ResearchPlannerAgent } from ".";

const rootDir = path.join(__dirname, "../../../../../");

dotenv.config({
  path: path.join(rootDir, ".env"),
});

jest.setTimeout(300000);

describe("ResearchPlanner Agent Test Suite", () => {
  function createResearchPlannerAgent(testName: string): {
    agent: ScriptedAgent;
    debugLog: DebugLog;
  } {
    const testCaseDir = path.join(__dirname, ".tests", testName);

    // reset the dir
    rimraf.sync(testCaseDir);

    const env = new Env(process.env as Record<string, string>);
    const logger = new Logger([new ConsoleLogger()], {
      promptUser: () => {
        throw Error("promptUser not supported.");
      },
      logUserPrompt: () => {
        throw Error("logUserPrompt not supported.");
      },
    });

    const llm: LlmApi = new OpenAI(
      env.OPENAI_API_KEY,
      env.GPT_MODEL,
      env.CONTEXT_WINDOW_TOKENS,
      env.MAX_RESPONSE_TOKENS,
      logger
    );

    const debugLog = new DebugLog(
      new FileSystemWorkspace(path.join(testCaseDir, "./debug"))
    );
    const debugLlm = new DebugLlmApi(debugLog, llm);

    const contextWindow = new ContextWindow(llm);
    const chat = new Chat(cl100k_base, contextWindow, logger);

    const scriptsDir = path.join(rootDir, "scripts");
    const scriptsWorkspace = new FileSystemWorkspace(scriptsDir);
    const scripts = new Scripts(scriptsWorkspace, "./");

    const workspace = new FileSystemWorkspace(testCaseDir);

    return {
      agent: new ResearchPlannerAgent(
        {
          client: new WrapClient(
            workspace,
            logger,
            agentPlugin({ logger }),
            env
          ),
          llm: debugLlm,
          chat,
          workspace,
          scripts,
          logger,
          env,
        }
      ),
      debugLog
    };
  }

  async function runResearchPlannerAgent(
    agent: ScriptedAgent,
    goal: string,
    debugLog: DebugLog
  ) {
    debugLog.goalStart(goal);
    const iterator = agent.run({ goal });

    while (true) {
      debugLog.stepStart();
      const response = await iterator.next();
      debugLog.stepEnd();

      if (response.done) {
        if (!response.value.ok) {
          debugLog.stepError(response.value.error ?? "Unknown error");
        } else {
          debugLog.stepLog(JSON.stringify(response.value.value));
        }
        return response;
      }
    }
  }

  test("plan", async () => {
    const { agent, debugLog } = createResearchPlannerAgent("plan");
    await runResearchPlannerAgent(
      agent,
      "Tesla's revenue every year since its creation",
      debugLog
    );
  });
});
