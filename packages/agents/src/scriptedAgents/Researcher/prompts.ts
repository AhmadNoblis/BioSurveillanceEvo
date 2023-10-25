import { GoalRunArgs } from "../../Agent";
import { AgentPrompts } from "../../AgentPrompts";
import { ChatMessage } from "@evo-ninja/agent-utils";

export const prompts: AgentPrompts<GoalRunArgs> = {
  name: "Researcher",
  expertise: `excels at parsing text, comprehending details, and synthesized insights tailored to user specifications. Has access to the filesystem.`,
  keywords: ["research", "search", "find", "read", "synthesize"],
  initialMessages: ({ goal }: GoalRunArgs): ChatMessage[] => [
    {
      role: "user",
      content: `You are a researcher of information. You will receive a user query and you need to perform research to answer it.

      1. Start by gathering information. Focus on any data sources the user tells you about (files, websites, etc).

      2. If the user's questions cannot be answered without using the internet, simply respond with a helpful message telling them what to search for.

      3. If by searching for something specific you find something else that is relevant, state it and consider it.

      4. Call agent_onGoalAchieved with the results of your research. Include information about any files you may have written containing your findings.`,
    },
    { role: "user", content: goal },
  ],
  loopPreventionPrompt: `Assistant, you appear to be in a loop, try executing a different function.`,
};
