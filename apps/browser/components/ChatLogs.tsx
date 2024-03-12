    import { ChatLog } from "@/components/Chat";
    import React, {
      useState,
      useEffect,
      useRef,
      useCallback,
      useMemo,
    } from "react";
    import ReactMarkdown from "react-markdown";
    import LoadingCircle from "./LoadingCircle";
    import { ArrowSquareRight } from "@phosphor-icons/react";
    import Logo from "./Logo";
    import { useSession } from "next-auth/react";
    import ChatDetails from "./modals/ChatDetails";
    import { sanitizeLogs } from "@/lib/utils/sanitizeLogsDetails";
    import { saveAs } from 'file-saver'; // Make sure to install file-saver package

    export interface ChatLogsProps {
      logs: ChatLog[];
      isRunning: boolean;
      status: string | undefined;
      chatName: string;
    }

    export default function ChatLogs({
      logs,
      isRunning,
      status,
      chatName,
    }: ChatLogsProps) {
      const listContainerRef = useRef<HTMLDivElement | null>(null);
      const [isAtBottom, setIsAtBottom] = useState(true);
      const { data: session } = useSession();

      const scrollToBottom = () => {
        listContainerRef.current?.scrollTo({
          top: listContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      };

      const sanitizedLogs = useMemo(() => {
        return sanitizeLogs(logs);
      }, [logs]);

      const [logsDetails, setLogsDetails] = useState<{
        open: boolean;
        index: number;
      }>({ open: false, index: 0 });

      const handleScroll = useCallback(() => {
        const container = listContainerRef.current;
        if (container) {
          const isScrolledToBottom =
            container.scrollHeight - container.scrollTop <= container.clientHeight;
          setIsAtBottom(isScrolledToBottom);
        }
      }, []);

      useEffect(() => {
        if (isAtBottom) {
          scrollToBottom();
        }
      }, [logs, isAtBottom]);

      useEffect(() => {
        const container = listContainerRef.current;
        if (container) {
          container.addEventListener("scroll", handleScroll);
        }
        return () => {
          if (container) {
            container.removeEventListener("scroll", handleScroll);
          }
        };
      }, [handleScroll]);

      // Function to download the chat logs with both userMessage and evoMessage
      const downloadChatLogs = useCallback(() => {
        // Formatting chat logs in a more detailed manner without access to logs.details
        const chatContent = sanitizedLogs.map((log, index) => {
          // Assuming sanitizedLogs contains objects with userMessage and evoMessage
          // Additional details can be formatted here as needed
          return `**Message ${index + 1}**\n**User:** ${log.userMessage}\n**AI Response:** ${log.evoMessage || 'No response'}\n`;
        }).join('\n\n'); // Separate each message with two newlines for clarity
      
        const blob = new Blob([chatContent], { type: 'text/markdown;charset=utf-8' });
        saveAs(blob, `${chatName}-ChatLogs.md`);
      }, [sanitizedLogs, chatName]);
      


      return (
        <>
          <div className="flex h-20 items-center justify-between border-b-2 border-zinc-800 md:h-12 px-4">
            <div>{chatName}</div>
            {/* Download button */}
            <button
              onClick={downloadChatLogs}
              className="text-zinc-500 hover:text-zinc-400 transition-colors duration-300"
              style={{ backgroundColor: 'transparent', borderColor: 'transparent' }}
            >
              Download
            </button>
          </div>
          <div
            ref={listContainerRef}
            onScroll={handleScroll}
            className="w-full flex-1 items-center space-y-6 overflow-y-auto overflow-x-clip px-2 py-3 text-left [scrollbar-gutter:stable]"
          >
            {sanitizedLogs.map((msg, index) => {
            console.log("Evo Message:"); // Print Evo message to console





            
              return (
                <div
                  key={index}
                  className={"m-auto w-full max-w-[56rem] self-center"}
                >
                  <div className="group relative flex w-full animate-slide-down items-start space-x-3 rounded-lg p-2 pb-10 text-zinc-700 opacity-0 transition-colors duration-300 ">
                    <>
                      {session?.user.image && session?.user.email ? (
                        <img
                          src={session?.user.image}
                          className="h-8 w-8 rounded-full bg-yellow-500"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-zinc-500" />
                      )}
                    </>
                    <div className="w-full max-w-[calc(100vw-84px)] space-y-2 pt-1 md:max-w-[49rem]">
                      <>
                      <div className="flex items-center justify-between">
                        <span className="SenderName font-medium" style={{ color: 'zinc-500' }}>
                          {session?.user.name ? session?.user.name : "User"}
                        </span>
                      </div>

                      </>
                      <div className="prose prose-invert w-full max-w-none">
                        <div style={{ color: 'black' }}>{msg.userMessage}</div>
                      </div>


                    </div>
                  </div>
                  <div
                    key={index}
                    className={"m-auto w-full max-w-[56rem] self-center"}
                  >
                    <div className="group relative flex w-full animate-slide-down items-start space-x-3 rounded-lg p-2 pb-10 text-zinc-700 opacity-0 transition-colors duration-300 ">
                      <Logo wordmark={false} className="!w-8 !min-w-[2rem]" />
                      <div className="w-full max-w-[calc(100vw-84px)] space-y-2 pt-1 md:max-w-[49rem]">
                        <>
                          <div className="flex items-center justify-between">
                            <span className="SenderName font-medium">Biosurveillance AI</span>
                            {!isRunning && (
                              <button
                                className="group/button flex items-center space-x-2 text-zinc-500 hover:text-zinc-500"
                                onClick={() =>
                                  setLogsDetails({
                                    open: true,
                                    index,
                                  })
                                }
                              >
                                <div className="font-regular text-xs group-hover/button:underline">
                                  View Details
                                </div>
                                <ArrowSquareRight size={24} />
                              </button>
                            )}
                          </div>
                        </>
                        
                        {msg.evoMessage && (
                          <ReactMarkdown className="prose prose-invert w-full max-w-none">
                            {msg.evoMessage}
                          </ReactMarkdown>
                        )}
                        {!msg.evoMessage &&
                          isRunning &&
                          sanitizedLogs.length - 1 === index && (
                            <>
                              <div className="flex items-center space-x-2 text-zinc-500">
                                <LoadingCircle />
                                <div className="group/loading flex cursor-pointer items-center space-x-2 text-zinc-500 transition-all duration-500 hover:text-zinc-700">
                                  <div
                                    className="group-hover/loading:underline"
                                    onClick={() =>
                                      setLogsDetails({
                                        open: true,
                                        index,
                                      })
                                    }
                                  >
                                    {status}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        {!msg.evoMessage && !isRunning && (
                          <ReactMarkdown className="prose prose-invert w-full max-w-none">
                            Please view step details, web search failed.
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <ChatDetails
            isOpen={logsDetails.open}
            onClose={() => setLogsDetails({ ...logsDetails, open: false })}
            logs={sanitizedLogs[logsDetails.index]}
            status={status}
          />
        </>
      );
    }
