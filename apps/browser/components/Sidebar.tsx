import React, { memo, useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import clsx from "clsx";
import DropdownAccount from "./DropdownAccount";
import CurrentWorkspace from "./CurrentWorkspace";
import {
  DiscordLogo,
  GithubLogo,
  NotePencil,
  PencilSimple,
  TrashSimple,
} from "@phosphor-icons/react";
import Avatar from "./Avatar";
import Button from "./Button";
import { useCreateChat } from "@/lib/mutations/useCreateChat";
import { useChats } from "@/lib/queries/useChats";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { useSession } from "next-auth/react";
import { useDeleteChat } from "@/lib/mutations/useDeleteChat";
import { chatInfoAtom, userWorkspaceAtom } from "@/lib/store";
import { useAtom } from "jotai";
import useWindowSize from "@/lib/hooks/useWindowSize";
import TextField from "./TextField";
import { useUpdateChatTitle } from "@/lib/mutations/useUpdateChatTitle";

export interface SidebarProps {
  hoveringSidebarButton: boolean;
  sidebarOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar = ({
  sidebarOpen,
  hoveringSidebarButton,
  closeSidebar,
}: SidebarProps) => {
  const router = useRouter();
  const { mutateAsync: createChat } = useCreateChat();
  const { mutateAsync: deleteChat } = useDeleteChat();
  const { mutateAsync: updateChat } = useUpdateChatTitle();
  const { data: chats, isLoading: isLoadingChats } = useChats();
  const { data: session, status } = useSession();
  const { isMobile } = useWindowSize();

  const [userWorkspace] = useAtom(userWorkspaceAtom);
  const [{ id: currentChatId }, setCurrentChatInfo] = useAtom(chatInfoAtom);
  const [editChat, setEditChat] = useState<{ id: string; title: string }>();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const editTitleInputRef = useRef<HTMLInputElement>(null);

  const mappedChats = chats?.map((chat) => ({
    id: chat.id,
    name: chat.title ?? chat.logs[0].title,
  }));

  const createNewChat = async () => {
    const id = uuid();
    const createdChat = await createChat(id);
    router.push(`/chat/${createdChat.id}`);
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleChatClick = (id: string, name: string) => {
    if (!editChat) {
      router.push(`/chat/${id}`);
      setCurrentChatInfo({ name });
      if (isMobile) {
        closeSidebar();
      }
    }
  };

  const handleEditClick = async (id: string, title: string) => {
    if (currentChatId === id) {
      setCurrentChatInfo({ name: title });
    }
    await updateChat({ chatId: id, title });
    setEditChat(undefined);
  };

  const handleDeleteClick = async (id: string) => {
    // Remove files associated to chat before removing chat
    await userWorkspace.rmdir(id, { recursive: true });
    await deleteChat(id);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    // Bind the event listener
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Unbind the event listener on clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editTitleInputRef.current &&
        !editTitleInputRef.current.contains(event.target as Node)
      ) {
        setEditChat(undefined);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editTitleInputRef]);

  return (
    <>
      <div
        className={clsx(
          "flex h-full flex-col justify-between transition-opacity",
          {
            "opacity-50 delay-0 duration-300":
              sidebarOpen && hoveringSidebarButton,
            "pointer-events-none opacity-0 delay-0 duration-0": !sidebarOpen,
          }
        )}
      >
        <div
          className="flex h-full animate-fade-in flex-col justify-between opacity-0"
          style={{ animationDelay: sidebarOpen ? "150ms" : "0ms" }}
        >
          <div className="flex h-full flex-col justify-between">
            <div className={clsx({ "space-y-6": session?.user.email })}>
              <header onClick={() => router.replace("/")}>
                <Logo className="w-[162px] cursor-pointer p-4 transition-opacity hover:opacity-50" />
              </header>
              {session?.user.email && (
                <div className="space-y-1 px-2">
                  <div className="flex w-full items-center justify-between space-x-1 px-3">
                    <div className="text-xs uppercase tracking-widest text-zinc-500">
                      Recent Chats
                    </div>
                    {!isLoadingChats && (
                      <Button variant="icon" onClick={createNewChat}>
                        <NotePencil size={18} weight="bold" />
                      </Button>
                    )}
                  </div>
                  {!isLoadingChats ? (
                    <div className="h-full max-h-[30vh] space-y-0.5 overflow-y-auto">
                      {chats && chats.length > 0 ? (
                        <div className="px-2">
                          {mappedChats?.map((chat) => (
                            <div
                              key={chat.id}
                              data-id={chat.id}
                              className={clsx(
                                "group relative w-full cursor-pointer overflow-x-hidden text-ellipsis whitespace-nowrap rounded text-sm text-zinc-100 transition-colors duration-300",
                                {
                                  "p-1 hover:bg-zinc-700 hover:pr-14 hover:text-white":
                                    chat.id !== editChat?.id,
                                }
                              )}
                              onClick={() =>
                                handleChatClick(chat.id, chat.name)
                              }
                            >
                              {chat.id === editChat?.id ? (
                                <div ref={editTitleInputRef}>
                                  <TextField
                                    className="!border-none !p-1 focus:!bg-zinc-950"
                                    defaultValue={chat.name}
                                    onKeyDown={(e) =>
                                      e.key === "Enter" &&
                                      handleEditClick(
                                        chat.id,
                                        e.currentTarget.value
                                      )
                                    }
                                  />
                                </div>
                              ) : (
                                chat.name
                              )}
                              <div
                                className={clsx(
                                  "absolute right-1 top-1/2 hidden -translate-y-1/2 transform animate-fade-in items-center opacity-0",
                                  {
                                    "group-hover:flex":
                                      chat.id !== editChat?.id,
                                  }
                                )}
                              >
                                <Button
                                  onClick={() =>
                                    setEditChat({
                                      id: chat.id,
                                      title: chat.name,
                                    })
                                  }
                                  variant="icon"
                                  className="!text-white"
                                >
                                  <PencilSimple weight="bold" size={16} />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteClick(chat.id)}
                                  variant="icon"
                                  className="!text-white"
                                >
                                  <TrashSimple weight="bold" size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          onClick={createNewChat}
                          className="mt-1 flex cursor-pointer flex-col items-center justify-center space-y-2 rounded-lg border-2 border-dashed border-zinc-500 p-7 text-center transition-colors duration-300 hover:border-cyan-500 hover:bg-zinc-950 hover:text-cyan-500"
                        >
                          <NotePencil
                            size={24}
                            className="text-[currentColor]"
                          />
                          <p className="leading-regular text-xs text-zinc-500">
                            You currently have no chats.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mx-2 h-[20vh] w-[calc(100%-1rem)] animate-pulse rounded-lg bg-zinc-700" />
                  )}
                </div>
              )}
              <CurrentWorkspace />
            </div>
            <div className="relative flex w-full items-center justify-between space-x-2 p-4">
              {status !== "loading" ? (
                <>
                  <DropdownAccount
                    ref={dropdownRef}
                    dropdownOpen={dropdownOpen}
                  />
                  <div
                    className={clsx(
                      "inline-flex w-full -translate-x-2 transform cursor-pointer items-center space-x-2 rounded-lg p-2 transition-colors hover:bg-zinc-800",
                      { "bg-zinc-800": dropdownOpen }
                    )}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {session?.user.email ? (
                      <>
                        <div className="flex items-center space-x-2">
                          {session.user.image ? (
                            <img
                              src={session.user.image}
                              className="h-8 w-8 min-w-[2rem] rounded-full bg-cyan-600"
                            />
                          ) : (
                            <div className="h-8 w-8 min-w-[2rem] rounded-full bg-cyan-600" />
                          )}
                          <div className="w-full max-w-[124px] space-y-1 overflow-x-hidden">
                            <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold leading-none">
                              {session.user.name}
                            </div>
                            <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-[11px] leading-none text-gray-400">
                              {session.user.email}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Avatar size={32} />
                        <div className="text-white">Guest</div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-12 w-full animate-pulse rounded-lg bg-zinc-700" />
              )}
              <div className="flex items-center space-x-1 text-lg text-white">
                <a
                  href="https://discord.gg/r3rwh69cCa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="icon">
                    <DiscordLogo size={20} />
                  </Button>
                </a>
                <a
                  href="https://github.com/polywrap/evo.ninja"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="icon">
                    <GithubLogo size={20} />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(Sidebar);
