import React, {
  useState,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
  useRef,
  useCallback,
} from "react";
import { Evo } from "@evo-ninja/agents";
import ReactMarkdown from "react-markdown";
import FileSaver from "file-saver";
import { InMemoryFile } from "@nerfzael/memory-fs";
import clsx from "clsx";
import { useAtom } from "jotai";
import { allowTelemetryAtom, showAccountModalAtom, showDisclaimerAtom, sidebarAtom, uploadedFilesAtom, welcomeModalAtom } from "@/lib/store";
import { ExamplePrompt, examplePrompts } from "@/lib/examplePrompts";
import TextField from "./TextField";
import {
  CaretCircleRight,
  CopySimple,
  PencilSimple,
  ThumbsDown,
  ThumbsUp,
  UploadSimple,
} from "@phosphor-icons/react";
import ChatInputButton from "./ChatInputButton";
import Image from "next/image";
import AvatarBlockie from "./AvatarBlockie";
import Logo from "./Logo";
import Button from "./Button";
import LoadingCircle from "./LoadingCircle";
import Disclaimer from "./Disclaimer";

export interface ChatMessage {
  title: string;
  content?: string;
  user: string;
  color?: string;
}

export interface ChatProps {
  messages: ChatMessage[];
  samplePrompts: ExamplePrompt[] | undefined;
  isRunning: boolean;
  isStopped: boolean;
  isPaused: boolean;
  isSending: boolean;
  onPause: () => void;
  onContinue: () => void;
  onPromptSent: (prompt: string) => Promise<void>;
}

const chat_name = "New Chat";

const Chat: React.FC<ChatProps> = ({
  messages,
  samplePrompts,
  onPromptSent,
  onContinue,
  onPause,
  isPaused,
  isRunning,
  isSending,
  isStopped
}: ChatProps) => {
  const [message, setMessage] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarAtom);
  const [showAccountModal] = useAtom(showAccountModalAtom)
  const [welcomeModalSeen] = useAtom(welcomeModalAtom)
  const [showDisclaimer, setShowDisclaimer] = useAtom(showDisclaimerAtom)
  const [, setUploadedFiles] = useAtom(uploadedFilesAtom)

  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);


  const [isLandingPage, setIsLandingPage] = useState<boolean>(false);
  const [, setAllowTelemetry] = useAtom(allowTelemetryAtom);

  const handleDisclaimerSelect = (select: boolean) => {
    setAllowTelemetry(select)
    setShowDisclaimer(false)
  }

  const handleSend = async (prompt: string) => {
    await onPromptSent(prompt);
    setMessage("")
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleKeyPress = async (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !isSending) {
      await handleSend(message)
    }
  };

  const handleSamplePromptClick = async (prompt: ExamplePrompt) => {
    if (prompt.files) {
      setUploadedFiles(prompt.files);
    }
    await handleSend(prompt.prompt)
  };

  const handleScroll = useCallback(() => {
    // Detect if the user is at the bottom of the list
    const container = listContainerRef.current;
    if (container) {
      const isScrolledToBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight;
      setIsAtBottom(isScrolledToBottom);
    }
  }, []);

  useEffect(() => {
    const container = listContainerRef.current;
    if (container) {
      // Add scroll event listener
      container.addEventListener("scroll", handleScroll);
    }

    // Clean up listener
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    // If the user is at the bottom, scroll to the new item
    if (isAtBottom) {
      listContainerRef.current?.scrollTo({
        top: listContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isAtBottom]);

  return (
    <div
      className={clsx("flex h-full flex-col", {
        "items-center justify-center": isLandingPage,
      })}
    >
      {isLandingPage ? (
        <div className="flex flex-col items-center space-y-2">
          <Logo wordmark={false} className="h-16 w-16" />
          <h1 className="text-2xl font-bold">What's your goal today?</h1>
        </div>
      ) : (
        <>
          <div className="flex h-12 items-center justify-center border-b-2 border-zinc-800">
            <div>{chat_name}</div>
          </div>
          <div
            ref={listContainerRef}
            onScroll={handleScroll}
            className="flex-1 items-center space-y-6 overflow-auto p-5 text-left"
          >
            {messages.map((msg, index) => {
              return (
                <div
                  key={index}
                  className={`${msg.user} m-auto w-full max-w-[56rem] self-center`}
                >
                  <div className="animate-slide-down group relative flex w-full items-start space-x-4 rounded-lg p-2 pb-10 text-white opacity-0 transition-colors duration-300 ">
                    {msg.user === "evo" ? (
                      <Logo wordmark={false} className="!w-8" />
                    ) : (
                      <AvatarBlockie
                        address="0x7cB57B5A97eAbe94205C07890BE4c1aD31E486A8"
                        size={32}
                        className="border-2 border-zinc-900"
                      />
                    )}
                    <div className="space-y-2 pt-1">
                      {index === 0 || messages[index - 1].user !== msg.user ? (
                        <div className="SenderName font-medium">
                          {msg.user.charAt(0).toUpperCase() + msg.user.slice(1)}
                        </div>
                      ) : null}
                      <div className="prose prose-invert max-w-[49rem]">
                        <ReactMarkdown>{msg.title.toString()}</ReactMarkdown>
                        <ReactMarkdown>
                          {msg.content?.toString() ?? ""}
                        </ReactMarkdown>
                      </div>
                      {msg.user === "evo" && isRunning && isSending && (
                        <div className="flex items-center space-x-2 text-cyan-500">
                          <LoadingCircle />
                          <div className="group flex cursor-pointer items-center space-x-2 text-cyan-500 transition-all duration-500 hover:text-cyan-700">
                            <div className="group-hover:underline">
                              Predicting best approach...
                            </div>
                            <Button
                              variant="icon"
                              className="!text-current !transition-none"
                            >
                              <CaretCircleRight size={20} />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="animate-fade-in absolute bottom-1 left-9 hidden space-x-0.5 group-hover:flex">
                      {msg.user === "evo" ? (
                        <>
                          <Button variant="icon">
                            <CopySimple
                              size={16}
                              className="fill-currentColor"
                            />
                          </Button>
                          <Button variant="icon">
                            <ThumbsUp size={16} className="fill-currentColor" />
                          </Button>
                          <Button variant="icon">
                            <ThumbsDown
                              size={16}
                              className="fill-currentColor"
                            />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="icon">
                            <PencilSimple
                              size={16}
                              className="fill-currentColor"
                            />
                          </Button>
                          <Button variant="icon">
                            <CopySimple
                              size={16}
                              className="fill-currentColor"
                            />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div
        className={clsx(
          "flex space-y-4",
          isLandingPage
            ? "flex-col-reverse"
            : "mx-auto w-full max-w-[56rem] flex-col"
        )}
      >
        {!messages.length && (
          <div className="flex flex-col items-center space-y-3">
            {isLandingPage && (
              <h2 className="w-full text-center font-normal">
                Not sure where to start? Try asking one of these:
              </h2>
            )}
            <div className="flex w-full max-w-[56rem] flex-wrap items-center justify-center space-x-1 space-y-1 self-center">
              {examplePrompts.map((prompt, index) => (
                <div
                  key={index}
                  className={clsx(
                    "cursor-pointer rounded-lg border-2  bg-zinc-900/50 p-2.5 text-xs text-zinc-400 transition-all duration-300 ease-in-out hover:bg-cyan-600 hover:text-white",
                    isLandingPage
                      ? "whitespace-nowrap border-zinc-700"
                      : "m-1 w-[calc(100%-1.5rem)] border-zinc-800"
                  )}
                  onClick={() => handleSamplePromptClick(prompt)}
                >
                  {prompt.prompt}
                </div>
              ))}
            </div>
          </div>
        )}
        <div
          className={clsx(
            "mb-4 flex w-full items-center justify-center gap-4 self-center p-4",
            isLandingPage ? "max-w-[42rem]" : "max-w-[56rem]"
          )}
        >
          <TextField
            type="text"
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder="Ask Evo anything..."
            className="!rounded-lg !p-4 !pl-12"
            leftAdornment={
              <Button variant="icon" className="!text-white">
                <UploadSimple size={20} />
              </Button>
            }
            rightAdornment={
              <ChatInputButton
              evoRunning={isRunning}
              paused={isPaused}
              sending={isSending}
              stopped={isStopped}
              handlePause={onPause}
              handleContinue={onContinue}
              handleSend={async () => await handleSend(message)}
              />
            }
            rightAdornmentClassnames="!right-3"
            disabled={isSending || showDisclaimer} // Disable input while sending or if disclaimer is shown
          />
        </div>
      </div>
      {showDisclaimer && !showAccountModal && welcomeModalSeen &&  (
        <Disclaimer handleDisclaimerSelect={handleDisclaimerSelect} />
      )}
      <a
        className="fixed bottom-4 right-4 z-10 cursor-pointer rounded-full border-2 border-zinc-500 bg-zinc-700 p-1 shadow hover:bg-zinc-600 hover:shadow-lg"
        href="https://discord.gg/r3rwh69cCa"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image alt="Support" src="/questionmark.svg" width={12} height={12} />
      </a>
    </div>
  );
};

export default Chat;
