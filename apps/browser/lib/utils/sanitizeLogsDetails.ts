import { ChatLog } from "@/components/Chat";

export type MessageSet = {
  userMessage: string;
  evoMessage?: string;
  details: Record<string, string[]>;
};

export function sanitizeLogs(messages: ChatLog[]): MessageSet[] {
  if (!messages || !messages.length) return [];

  // First, sort the messages by their creation date
  messages.sort(
    (a, b) =>
      new Date(a.created_at as string).getTime() -
      new Date(b.created_at as string).getTime()
  );

  return messages.reduce<MessageSet[]>((sanitizedLogs, currentMessage) => {
    const sanitizedLogsLength = sanitizedLogs.length;
    const currentSet =
      sanitizedLogsLength > 0 ? sanitizedLogs[sanitizedLogsLength - 1] : null;

    if (currentMessage.user === "user") {
      sanitizedLogs.push({
        userMessage: currentMessage.title,
        details: {},
        evoMessage: undefined,
      });
      return sanitizedLogs;
    }

    if (!currentSet) {
      return sanitizedLogs;
    }

    // Check if title exists and is a string
    if (typeof currentMessage.title !== 'string' || currentMessage.title === "{}") {
      currentSet.evoMessage = "LLM has returned {} error";
      return sanitizedLogs;
    }

    if (!currentMessage.title.startsWith("#")) {
      currentSet.evoMessage = currentMessage.title;
    } else {
      if (currentMessage.title.startsWith("## ")) {
        currentSet.details[currentMessage.title] = [];
      } else {
        const detailKeys = Object.keys(currentSet.details);
        const currentKey = detailKeys[detailKeys.length - 1];
        const detailContent = currentMessage.content
          ? currentMessage.title.concat(`\n${currentMessage.content}`)
          : currentMessage.title;
        const currentStep = currentSet.details[currentKey];
        if (currentStep) {
          currentStep.push(detailContent);
        }
      }
    }
    return sanitizedLogs;
  }, []);
}

