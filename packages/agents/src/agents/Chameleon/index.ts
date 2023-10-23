import {
  AgentFunction,
  Chat,
  ChatLogs,
  ChatMessage,
  FunctionDefinition,
  MessageChunker,
  Timeout,
  Tokenizer,
  Workspace,
  LocalVectorDB,
  OpenAIEmbeddingAPI,
  LlmApi,
  LlmQueryBuilder,
  ContextualizedChat
} from "@evo-ninja/agent-utils";
import { AgentContext } from "../../AgentContext";
import { agentPrompts, prompts } from "./prompts";
import { Agent, GoalRunArgs } from "../../Agent";
import { AgentConfig } from "../../AgentConfig";
import { AgentFunctionBase } from "../../AgentFunctionBase";
import { DeveloperAgent, ResearcherAgent, DataAnalystAgent, WebResearcherAgent, ScribeAgent } from "../../scriptedAgents";
import { Rag } from "./Rag";
import { TextChunker } from "./TextChunker";
import { Prompt } from "./Prompt";
import { NewAgent } from "./NewAgent";

export class ChameleonAgent extends NewAgent<GoalRunArgs> {
  private _cChat: ContextualizedChat;
  private _chunker: MessageChunker;
  private _lastQuery: string | undefined;

  constructor(
    context: AgentContext,
    timeout?: Timeout,
  ) {
    super(
      new AgentConfig(
        agentPrompts,
        [],
        context.scripts,
        timeout
      ),
      context,
    );
    this._chunker = new MessageChunker({ maxChunkSize: 2000 });
    const embeddingApi = new OpenAIEmbeddingAPI(
      this.context.env.OPENAI_API_KEY,
      this.context.logger,
      this.context.chat.tokenizer
    );
    this._cChat = new ContextualizedChat(
      this.context.chat,
      this._chunker,
      new LocalVectorDB(this.context.internals, "cchat", embeddingApi)
    );
  }

  protected initializeChat(args: GoalRunArgs): void {
    const { chat } = this.context;

    chat.persistent(buildDirectoryPreviewMsg(this.context.workspace));
    chat.persistent("user", prompts.exhaustAllApproaches);
    chat.persistent("user", args.goal);
  }

  protected async beforeLlmResponse(): Promise<{ logs: ChatLogs, agentFunctions: FunctionDefinition[], allFunctions: AgentFunction<AgentContext>[]}> {

    // Retrieve the last message
    const rawChatLogs = this.context.chat.chatLogs;
    const lastMessages = [
      rawChatLogs.getMsg("persistent", -1),
      rawChatLogs.getMsg("temporary", -2),
      rawChatLogs.getMsg("temporary", -1)
    ].filter((x) => x !== undefined) as ChatMessage[];

    // Summarize large messages
    for (let i = 0; i < lastMessages.length; ++i) {
      const msg = lastMessages[i];
      if (this._chunker.shouldChunk(msg)) {
        const content = await summarizeMessage(
          msg,
          this.context.llm,
          this.context.chat.tokenizer
        );
        lastMessages[i] = { ...msg, content };
      }
    }

    // Predict the next step
    const prediction = await this.askLlm(
      new Prompt()
        .json(lastMessages)
        .line(`
          Consider the above chat between a user and assistant.
          In your expert opinion, what is the best next step for the assistant?`
        )
    );

    const [agent, agentFunctions, persona, allFunctions] = await findBestAgent(prediction, this.context);

    const context = `${persona}\n${prediction}`;
    const maxContextTokens = this.context.llm.getMaxContextTokens();
    const maxResponseTokens = this.context.llm.getMaxResponseTokens();
    // TODO: remove this once we properly track function definition tokens
    const fuzz = 500;
    const maxChatTokens = maxContextTokens - maxResponseTokens - fuzz;

    const contextualizedChat = await this._cChat.contextualize(
      context, {
        persistent: maxChatTokens * 0.25,
        temporary: maxChatTokens * 0.75
      }
    );

    prependAgentMessages(
      agent.config,
      contextualizedChat
    );

    return {
      logs: contextualizedChat.chatLogs,
      agentFunctions,
      allFunctions: allFunctions.map((fn: any) => {
        return {
          definition: fn.getDefinition(),
          buildExecutor: (context: AgentContext) => {
            return fn.buildExecutor(agent);
          }
        }
      })
    }
  }

  protected async beforeLlmResponse0(): Promise<{ logs: ChatLogs, agentFunctions: FunctionDefinition[], allFunctions: AgentFunction<AgentContext>[]}> {
    const { chat } = this.context;
    const { messages } = chat.chatLogs;

    let query = "";
    if (messages.length <= 2) {
      query = messages.slice(-1)[0].content ?? "";
    } else {
      const lastMessage = messages.slice(-1)[0];

      if (isLargeMsg(lastMessage)) {
        const q = this._lastQuery ?? await this.askLlm(
            new Prompt()
              .json(messages.slice(-2)[0])
              .line("What is the above message trying to achieve?")
          );

        await shortenMessage(lastMessage, q, this.context);
      }
      //TODO: Keep persona in chat logs when doing this
      query = await this.askLlm(
        new Prompt()
          .json([
            { role: "user", content: "You are an expert assistant capable of accomplishing a multitude of tasks using functions that use external tools (like internet, file system, etc.)." }, 
            ...messages
          ])
          .line(`
            Consider the above chat between a user and assistant.
            In your expert opinion, what is the best next step for the assistant?`
          )
      );
    }

    this._lastQuery = query;
    await shortenLargeMessages(query, chat, this.context);
    console.log("Query: ", query);

    const [agent, agentFunctions, persona, allFunctions] = await findBestAgent(query, this.context);
    console.log("Selected agent: ", agent.config.prompts.name);

    const logs = insertPersonaAsFirstMsg(persona, chat.chatLogs, chat.tokenizer);

    return {
      logs,
      agentFunctions,
      allFunctions: allFunctions.map((fn: any) => {
        return {
          definition: fn.getDefinition(),
          buildExecutor: (context: AgentContext) => {
            return fn.buildExecutor(agent);
          }
        }
      })
    }
  }
}

const insertPersonaAsFirstMsg = (persona: string, logs: ChatLogs, tokenizer: Tokenizer): ChatLogs => {
  const newLogs = logs.clone();
  newLogs.insert("persistent",
    [{
      role: "user",
      content: persona,
    } as ChatMessage],
    [tokenizer.encode(persona).length],
    0
  );

  return newLogs;
};

const findBestAgent = async (query: string, context: AgentContext): Promise<[Agent<unknown>, FunctionDefinition[], string, AgentFunctionBase<unknown>[]]> => {
  const allAgents: Agent[] = [
    DeveloperAgent,
    ResearcherAgent,
    WebResearcherAgent,
    DataAnalystAgent,
    ScribeAgent
  ].map(agentClass => new agentClass(context.cloneEmpty()));

  const agentsWithPrompts = allAgents.map(agent => {
    return {
      expertise: agent.config.prompts.expertise + "\n" + agent.config.functions.map(x => x.name).join("\n"),
      persona: agent.config.prompts.initialMessages({ goal: "" })[0].content ?? "",
      agent,
    };
  });

  const result = await Rag.standard(agentsWithPrompts, context)
    .limit(1)
    .selector(x => x.expertise)
    .query(query);

  const agents = result
    .sortByIndex()
    .onlyUnique();

  console.log("Selected agents: ", agents.map(x => x.agent.config.prompts.name));

  const agentWithPrompt = agents[0];

  return [
    agentWithPrompt.agent,
    agentWithPrompt.agent.config.functions.map(f => f.getDefinition()),
    agentWithPrompt.persona,
    agentsWithPrompts.map(x => x.agent.config.functions).flat()
  ];
};

const isLargeMsg = (message: ChatMessage): boolean => {
  return !!message.content && message.content.length > 2000;
}

const joinUnderCharLimit = (chunks: string[], characterLimit: number, separator: string): string => {
  let result = "";

  for (const chunk of chunks) {
    if (result.length + chunk.length + separator.length > characterLimit) {
      break;
    }

    if (result === "") {
      result += chunk;
    } else {
      result += separator + chunk;
    }
  }

  return result;
}

// const getUnderCharLimit = (chunks: string[], characterLimit: number): string[] => {
//   let totalLength = 0;
//   const newChunks = [];
//   for (const chunk of chunks) {
//     if (totalLength + chunk.length > characterLimit) {
//       const remainingCharacters = characterLimit - totalLength;
//       if (remainingCharacters > 0) {
//         newChunks.push(chunk.substring(0, remainingCharacters));
//       }
//       break;
//     }
//     newChunks.push(chunk);
//     totalLength += chunk.length;
//   }
//   return newChunks;
// }

const shortenLargeMessages = async (query: string, chat: Chat, context: AgentContext): Promise<void> => {
  for(let i = 2; i < chat.chatLogs.messages.length ; i++) {
    const message = chat.chatLogs.messages[i];
    if (isLargeMsg(message)) {
      await shortenMessage(message, query, context);
    }
  }
};

const shortenMessage = async (message: ChatMessage, query: string, context: AgentContext): Promise<void> => {
  message.content = previewChunks(
    (await Rag.standard(TextChunker.characters(message.content ?? "", 1000), context)
      .limit(2)
      .selector(x => x)
      .query(query))
      .sortByIndex()
      .onlyUnique(),
    2000
  );
};

const buildDirectoryPreviewMsg = (workspace: Workspace): ChatMessage => {
  const files = workspace.readdirSync("./");
  return {
    role: "system",
    content: `Current directory: './'
Files: ${
files.filter((x) => x.type === "file").map((x) => x.name).join(", ")
}\nDirectories: ${
files.filter((x) => x.type === "directory").map((x) => x.name).join(", ")
}` 
  }
};

function prependAgentMessages(agent: AgentConfig<unknown>, chat: Chat): void {
  // TODO: refactor the AgentConfig to only include the agent's prompt, assume goal will be added
  const msgs = agent.prompts.initialMessages({ goal: "foo bar remove me" }).slice(0, -1);
  chat.chatLogs.insert(
    "persistent",
    msgs,
    msgs.map((msg) => chat.tokenizer.encode(msg.content || "").length),
    0
  );
}

async function summarizeMessage(message: ChatMessage, llm: LlmApi, tokenizer: Tokenizer): Promise<string> {
  const fuzTokens = 200;
  const maxTokens = llm.getMaxContextTokens() - fuzTokens;

  const prompt = (summary: string | undefined) => {
    return `Summarize the following data. Includes all unique details.\n
            ${summary ? `An existing summary exists, please add all new details found to it.\n\`\`\`\n${summary}\n\`\`\`\n` : ``}`;
  }
  const appendData = (prompt: string, chunk: string) => {
    return `${prompt}\nData:\n\`\`\`\n${chunk}\n\`\`\``;
  }

  let summary: string | undefined = undefined;
  const data = message.content || "";
  const len = data.length;
  let idx = 0;

  while (idx < len) {
    const promptStr = prompt(summary);
    const propmtTokens = tokenizer.encode(promptStr).length;
    const chunkTokens = (maxTokens - propmtTokens);
    const chunk = data.substring(idx, Math.min(idx + chunkTokens, len));
    idx += chunkTokens;

    const promptFinal = appendData(promptStr, chunk);

    summary = await new LlmQueryBuilder(llm, tokenizer)
      .persistent("user", promptFinal)
      .build()
      .content();
  }

  return summary || "";
}

const previewChunks = (chunks: string[], charLimit: 2000): string => joinUnderCharLimit(chunks, charLimit - "...\n".length, "\n...\n")
// const limitChunks = (chunks: string[], charLimit: 2000): string[] => getUnderCharLimit(chunks, charLimit)
