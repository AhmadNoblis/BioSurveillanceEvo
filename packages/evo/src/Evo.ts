import { agentFunctions } from "./agent-functions";
import { AgentContext } from "./AgentContext";
import {
  INITIAL_PROMP,
  LOOP_PREVENTION_PROMPT
} from "./prompts";

import {
  Agent,
  Workspace,
  Scripts,
  LlmApi,
  Chat,
  Logger,
  AgentOutput,
  RunResult,
  Timeout,
  InMemoryWorkspace,
  basicFunctionCallLoop,
  ContextWindow,
  WrapClient,
  agentPlugin,
  Env
} from "@evo-ninja/agent-utils";
import { ScriptWriter } from "@evo-ninja/agents";
import { ResultErr } from "@polywrap/result";

export interface EvoRunArgs {
  goal: string;
}

export class Evo implements Agent<EvoRunArgs> {
  private readonly context: AgentContext;

  constructor(
    private readonly llm: LlmApi,
    private readonly chat: Chat,
    private readonly logger: Logger,
    private readonly workspace: Workspace,
    scripts: Scripts,
    private readonly env: Env,
    private readonly timeout?: Timeout,
  ) {
    this.context = {
      llm,
      chat,
      workspace,
      scripts,
      logger,
      globals: {},
      client: new WrapClient(
        this.workspace,
        this.logger,
        agentPlugin({ logger: this.logger }),
        this.env
      ),
    };
  }

  public async* run({ goal }: EvoRunArgs): AsyncGenerator<AgentOutput, RunResult, string | undefined> {
    const { chat } = this.context;
    const createScriptWriter = (): ScriptWriter => {
      const workspace = new InMemoryWorkspace();
      const contextWindow = new ContextWindow(this.llm);
      const chat = new Chat(this.chat.tokenizer, contextWindow, this.logger);
      return new ScriptWriter(this.llm, chat, workspace, this.logger, this.env);
    };

    if (this.timeout) {
      setTimeout(this.timeout.callback, this.timeout.milliseconds);
    }

    try {
      chat.persistent("assistant", INITIAL_PROMP);
      chat.persistent("user", goal);

      return yield* basicFunctionCallLoop(
        this.context,
        agentFunctions(createScriptWriter),
        (functionCalled) => {
          const namespace = functionCalled.args.namespace || "";
          const terminationFunctions = [
            `agent.onGoalAchieved`,
            `agent.onGoalFailed`
          ];
          return terminationFunctions.includes(namespace);
        },
        LOOP_PREVENTION_PROMPT
      );
    } catch (err) {
      this.logger.error(err);
      return ResultErr("Unrecoverable error encountered.");
    }
  }
}
