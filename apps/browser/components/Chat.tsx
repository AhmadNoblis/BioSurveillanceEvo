import {
  showDisclaimerAtom,
  errorAtom,
  chatInfoAtom,
  welcomeModalAtom,
  signInModalAtom,
  settingsModalAtom,
} from "@/lib/store";
import { useWorkspaceUploadDrop } from "@/lib/hooks/useWorkspaceUploadDrop";
import { useFirstTimeUser } from "@/lib/hooks/useFirstTimeUser";
import ExamplePrompts from "@/components/ExamplePrompts";
import ChatLogs from "@/components/ChatLogs";
import Disclaimer from "@/components/modals/Disclaimer";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import ChatInputButton from "@/components/ChatInputButton";
import TextField from "@/components/TextField";
import React, { useState, ChangeEvent, useEffect } from "react";
import { UploadSimple } from "@phosphor-icons/react";
import { useAtom } from "jotai";
import clsx from "clsx";
import { InMemoryFile } from "@nerfzael/memory-fs";
import promptsData from "./selected_prompts.json"; // Import the JSON data
import ModifyPromptsPopup from './ModifyPromptsPopup';
import MyLogo from './biohazard_symbol.svg.png';


export interface ChatLog {
  title: string;
  content?: string;
  user: string;
  color?: string;
  created_at?: string
}

export interface ChatProps {
  logs: ChatLog[];
  isStarting: boolean;
  isRunning: boolean;
  onGoalSubmit: (goal: string) => Promise<void>;
  onUpload: (upload: InMemoryFile[]) => void;
  status: string | undefined;
}

const Chat: React.FC<ChatProps> = ({
  logs,
  isStarting,
  isRunning,
  onGoalSubmit,
  onUpload,
  status
}: ChatProps) => {
  const [{ id: chatId, name: chatName }] = useAtom(chatInfoAtom);
  const [showDisclaimer, setShowDisclaimer] = useAtom(showDisclaimerAtom);
  const [, setError] = useAtom(errorAtom);
  const [welcomeModalOpen, setWelcomeModalOpen] = useAtom(welcomeModalAtom);
  const [signInModalOpen] = useAtom(signInModalAtom);
  const [settingsModalOpen] = useAtom(settingsModalAtom)

  const [message, setMessage] = useState<string>("");

  const { getInputProps, open } = useWorkspaceUploadDrop(onUpload);
  const firstTimeUser = useFirstTimeUser();

  const shouldShowExamplePrompts = !chatId || (!logs.length && !isStarting && !isRunning);

  const [isCycling, setIsCycling] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [showModifyPrompts, setShowModifyPrompts] = useState(false);
  const generateCustomPrompts = (): string[] => {
    let customizedPrompts: string[] = [];
    promptsData.prompts.forEach((prompt) => {
      if (prompt.includes("[specific disease]")) {
        promptsData.specificDiseases.forEach((disease) => {
          if (prompt.includes("[specific region/country]")) {
            promptsData.specificRegionsCountries.forEach((regionCountry) => {
              const customizedPrompt = prompt
                .replace("[specific disease]", disease)
                .replace("[specific region/country]", regionCountry);
              customizedPrompts.push(customizedPrompt);
            });
          } else {
            const customizedPrompt = prompt.replace("[specific disease]", disease);
            customizedPrompts.push(customizedPrompt);
          }
        });
      } else if (prompt.includes("[specific region/country]")) {
        promptsData.specificRegionsCountries.forEach((regionCountry) => {
          const customizedPrompt = prompt.replace("[specific region/country]", regionCountry);
          customizedPrompts.push(customizedPrompt);
        });
      } else {
        customizedPrompts.push(prompt);
      }
    });
    return customizedPrompts;
  };

  useEffect(() => {
    if (isCycling) {
      const customPrompts = generateCustomPrompts();
      const intervalId = setInterval(() => {
        onGoalSubmit(customPrompts[currentPromptIndex]);
        setCurrentPromptIndex((prevIndex) => (prevIndex + 1) % customPrompts.length);
      }, 3000);
      return () => clearInterval(intervalId);
    }
  }, [isCycling, currentPromptIndex, onGoalSubmit]);

  const startCyclingPrompts = () => {
    setIsCycling(true);
  };

  const stopCycling = () => {
    setIsCycling(false);
  };



  const handleGoalSubmit = async (goal: string): Promise<void> => {
    if (firstTimeUser) {
      setWelcomeModalOpen(true);
      return;
    }
    if (!goal) {
      setError("Please enter a goal.");
      return;
    }
    setMessage("");
    return onGoalSubmit(goal);
  };

  const onUploadOpen = () => {
    if (firstTimeUser) {
      setWelcomeModalOpen(true);
      return;
    }
    open();
  }

  return (
    <main className={clsx("relative flex h-full w-full flex-col", {"items-center justify-center": shouldShowExamplePrompts})}>
      {/* start of code for logo */}

      {shouldShowExamplePrompts && (
    <>
      <div className="w-full flex justify-center items-center mt-4">
        <img src={MyLogo.src} alt="Logo" className="w-20 h-20" />
      </div>
      <Logo wordmark={false} className="mb-4 w-16" />
    </>
  )}

  {/* Render ChatLogs when not showing example prompts */}
  {!shouldShowExamplePrompts && (
    <ChatLogs status={status} chatName={chatName ?? "New Session"} isRunning={isStarting || isRunning} logs={logs} />
  )}
      
      {/*end of code for logo*/}
      <div className={clsx("mt-4 flex w-full space-y-4", shouldShowExamplePrompts ? "flex-col-reverse space-y-reverse px-4 md:px-8 lg:px-4" : "mx-auto max-w-[56rem] flex-col px-4")}>
        {shouldShowExamplePrompts && <ExamplePrompts onClick={handleGoalSubmit} />}
        <div className={clsx("mb-4 flex w-full items-center justify-center gap-4 self-center", shouldShowExamplePrompts ? "max-w-[60rem]" : "max-w-[56rem]")}>
          <TextField
            type="text"
            value={message}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {setMessage(event.target.value);}}
            onKeyDown={(event: React.KeyboardEvent) => {
              if (event.key === "Enter" && !isStarting && !isRunning) {
                return handleGoalSubmit(message);
              }
            }}
              placeholder="Find, track, and discover emerging infectious disease outbreaks"
            className="!rounded-lg !p-4 !pl-12"
            leftAdornment={
              <>
                <Button variant="icon" className="!text-zinc-500" onClick={onUploadOpen}><UploadSimple size={20} /></Button>
                <input {...getInputProps()} />
              </>
            }
            rightAdornment={<ChatInputButton running={isRunning} message={message} handleSend={() => onGoalSubmit(message)} />}
            rightAdornmentClassnames="!right-3"
            disabled={isRunning || showDisclaimer}
          />
          <Button onClick={startCyclingPrompts} disabled={isCycling}>Start Cycling</Button>
          <Button onClick={stopCycling} disabled={!isCycling}>Stop Cycling</Button>
          <Button onClick={() => setShowModifyPrompts(true)} disabled={isCycling || showDisclaimer}>Modify Prompts</Button>
        </div>
      </div>
      <Disclaimer isOpen={showDisclaimer && !welcomeModalOpen && !signInModalOpen && !settingsModalOpen} onClose={() => setShowDisclaimer(false)} />
      {showModifyPrompts && <ModifyPromptsPopup 
  isOpen={showModifyPrompts} 
  onClose={() => setShowModifyPrompts(false)} 
  onSave={(modifiedData) => { console.log(modifiedData); setShowModifyPrompts(false); }} 
  initialData={{
    prompts: promptsData.prompts, 
    diseases: promptsData.specificDiseases, 
    regionsCountries: promptsData.specificRegionsCountries,
  }} 
/>}
    </main>
  );
};

export default Chat;