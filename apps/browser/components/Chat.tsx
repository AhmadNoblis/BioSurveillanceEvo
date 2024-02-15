import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
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
import { UploadSimple } from "@phosphor-icons/react";
import clsx from "clsx";
import { InMemoryFile } from "@nerfzael/memory-fs";

export interface ChatLog {
  title: string;
  content?: string;
  user: string;
  color?: string;
  created_at?: string;
}

export interface ChatProps {
  logs: ChatLog[];
  isStarting: boolean;
  isRunning: boolean;
  onGoalSubmit: (goal: string) => void;
  onUpload: (upload: InMemoryFile[]) => void;
  status: string | undefined;
}

const Chat: React.FC<ChatProps> = ({
  logs,
  isStarting,
  isRunning,
  onGoalSubmit,
  onUpload,
  status,
}: ChatProps) => {
  const [{ id: chatId, name: chatName }] = useAtom(chatInfoAtom);
  const [showDisclaimer, setShowDisclaimer] = useAtom(showDisclaimerAtom);
  const [, setError] = useAtom(errorAtom);
  const [welcomeModalOpen, setWelcomeModalOpen] = useAtom(welcomeModalAtom);
  const [signInModalOpen, setSignInModalOpen] = useAtom(signInModalAtom);
  const [settingsModalOpen, setSettingsModalOpen] = useAtom(settingsModalAtom);
  const [message, setMessage] = useState<string>("");
  const [isCycling, setIsCycling] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  const prompts = [
    "Virus Variant Tracking: \"Identify updates on new variants of [specific disease] reported by genomic surveillance networks.\"",
    "Latest Outbreak Reports: \"Find the latest reports on disease outbreaks by health organizations.\"",
    "Disease Surveillance Updates: \"Search for recent updates on disease surveillance from public health agencies worldwide.\"",
    "New Disease Cases: \"Locate information on new cases of [specific disease] reported in the last 24 hours.\"",
    "Vaccine Efficacy and Coverage: \"Retrieve latest findings on vaccine efficacy against [specific disease] and current vaccination coverage rates in [specific region/country].\"",
    "Public Health Advisories: \"Collect recent public health advisories and guidelines issued for [specific disease].\"",
    "Travel Health Notices: \"Find current travel health notices related to outbreaks of [specific disease].\"",
    "Zoonotic Disease Transmission: \"Search for new information on cases of zoonotic disease transmission to humans.\"",
    "Emerging Infectious Diseases: \"Identify reports on emerging infectious diseases from scientific publications and health organizations.\"",
    "Global Health Security: \"Retrieve information on global health security measures being implemented to prevent the spread of infectious diseases.\"",
    "Disease Modeling and Forecasts: \"Locate the latest disease modeling studies and forecasts for [specific disease].\"",
    "Epidemiological Studies: \"Find newly published epidemiological studies on [specific disease].\"",
    "Healthcare System Impact: \"Search for reports on the impact of [specific disease] on healthcare systems in [specific region/country].\"",
    "International Health Regulations: \"Retrieve information on International Health Regulations (IHR) compliance and reporting related to [specific disease].\"",
    "Social Media Monitoring for Disease Outbreaks: \"Monitor social media for mentions of symptoms or outbreaks related to [specific disease] in [specific region/country].\"",
    "Environmental Factors in Disease Spread: \"Identify reports on environmental factors contributing to the spread of [specific disease].\"",
    "Pharmaceutical and Therapeutic Developments: \"Find the latest developments in pharmaceuticals and therapeutics for treating [specific disease].\"",
    "Outbreak Response and Containment Efforts: \"Search for information on outbreak response and containment efforts for [specific disease] by [specific organization or country].\""
];

const specificDiseases = [
  "COVID-19",
  "Ebola",
  "Zika virus",
  "Influenza",
  "Malaria",
  "Dengue fever",
  "Cholera",
  "Tuberculosis",
  "HIV/AIDS",
];

const specificRegionsCountries = [
  "United States",
  "Brazil",
  "India",
  "China",
  "South Africa",
  "United Kingdom",
  "Australia",
  "Nigeria",
  "Russia",
];

const generateCustomPrompts = () => {
  let customizedPrompts = [];
  prompts.forEach((prompt) => {
    if (prompt.includes("[specific disease]")) {
      specificDiseases.forEach((disease) => {
        if (prompt.includes("[specific region/country]")) {
          specificRegionsCountries.forEach((regionCountry) => {
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
      specificRegionsCountries.forEach((regionCountry) => {
        const customizedPrompt = prompt.replace("[specific region/country]", regionCountry);
        customizedPrompts.push(customizedPrompt);
      });
    } else {
      // If the prompt does not contain any placeholders, add it as is.
      customizedPrompts.push(prompt);
    }
  });
  return customizedPrompts;
};



useEffect(() => {
  if (isCycling) {
    const customPrompts = generateCustomPrompts(); // Generate the prompts dynamically
    const intervalId = setInterval(() => {
      onGoalSubmit(customPrompts[currentPromptIndex]);
      setCurrentPromptIndex((prevIndex) => (prevIndex + 1) % customPrompts.length);
    }, 3000); // Adjust the time as needed

    return () => clearInterval(intervalId);
  }
}, [isCycling, currentPromptIndex, onGoalSubmit]);

  const startCyclingPrompts = () => {
    setIsCycling(true);
  };

  const stopCycling = () => {
    setIsCycling(false);
   // setCurrentPromptIndex(0); // Reset the index when stopping
  };

  const { getInputProps, open } = useWorkspaceUploadDrop(onUpload);
  const firstTimeUser = useFirstTimeUser();
  const shouldShowExamplePrompts = !chatId || (!logs.length && !isStarting && !isRunning);

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
  };

  return (
    <main
      className={clsx("relative flex h-full w-full flex-col", {
        "items-center justify-center": shouldShowExamplePrompts,
      })}
    >
      {shouldShowExamplePrompts ? (
        <Logo wordmark={false} className="mb-16 w-16" />
      ) : (
        <ChatLogs status={status} chatName={chatName ?? "New Session"} isRunning={isStarting || isRunning} logs={logs} />
      )}

      <div
        className={clsx(
          "mt-4 flex w-full space-y-4",
          shouldShowExamplePrompts
            ? "flex-col-reverse space-y-reverse px-4 md:px-8 lg:px-4"
            : "mx-auto max-w-[56rem] flex-col px-4"
        )}
      >
        {shouldShowExamplePrompts && (
          <ExamplePrompts
            onClick={handleGoalSubmit}
          />
        )}
        <div
          className={clsx(
            "mb-4 flex w-full items-center justify-center gap-4 self-center",
            shouldShowExamplePrompts ? "max-w-[42rem]" : "max-w-[56rem]"
          )}
        >
          <TextField
            type="text"
            value={message}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setMessage(event.target.value);
            }}
            onKeyDown={(event: React.KeyboardEvent) => {
              if (event.key === "Enter" && !isStarting && !isRunning) {
                onGoalSubmit(message);
              }
            }}
            placeholder="Search up emerging diseases or potential outbreaks"
            className="!rounded-lg !p-4 !pl-12"
            leftAdornment={
              <>
                <Button variant="icon" className="!text-zinc-500" onClick={onUploadOpen}>
                  <UploadSimple size={20} />
                </Button>
                <input {...getInputProps()} />
              </>
            }
            rightAdornment={
              <ChatInputButton
                running={isRunning}
                message={message}
                handleSend={() => onGoalSubmit(message)}
              />
            }
            rightAdornmentClassnames="!right-3"
            disabled={isRunning || showDisclaimer} // Disable input while sending or if disclaimer is shown
          />
          {/* Control buttons for starting and stopping the cycling process */}
          <Button onClick={startCyclingPrompts} disabled={isCycling}>Start Cycling</Button>
          <Button onClick={stopCycling} disabled={!isCycling}>Stop Cycling</Button>

        </div>
      </div>
      <Disclaimer
        isOpen={showDisclaimer && !welcomeModalOpen && !signInModalOpen && !settingsModalOpen}
        onClose={() => setShowDisclaimer(false)}
      />
    </main>
  );
};

export default Chat;
