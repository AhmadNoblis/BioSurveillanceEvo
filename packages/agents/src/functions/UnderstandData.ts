import { ReadDirectoryFunction } from "./ReadDirectory";
import { ReadAndAnalyzeCSVDataFunction } from "./ReadAndAnalyzeCSVData";
import { AgentFunctionBase } from "../AgentFunctionBase";
import { Agent } from "../Agent";
import { AgentFunctionResult, ChatMessageBuilder } from "@evo-ninja/agent-utils";

interface UnderstandDataParameters {
  goal: string;
}

export class UnderstandDataFunction extends AgentFunctionBase<UnderstandDataParameters> {
  name: string = "understandData";
  description: string = "Understand the data and the user's goal."
  parameters: any = {
    type: "object",
    properties: {
      goal: {
        type: "string",
        description: "The user's goal"
      }
    },
    required: ["goal"],
    additionalProperties: false
  }

  buildExecutor(agent: Agent<unknown>): (params: UnderstandDataParameters, rawParams?: string | undefined) => Promise<AgentFunctionResult> {
    return async (params: UnderstandDataParameters, rawParams?: string): Promise<AgentFunctionResult> => {
      const readDirectory = new ReadDirectoryFunction(
        agent.context.scripts
      ).buildExecutor(agent);

      // In parallel:
      // - analyze data formatting requirements
      // - read directory
      // - read and analyze all files
      const results: AgentFunctionResult[] = await Promise.all([
        readDirectory({ path: "./" }),
        ...this.readAndAnalyzeFiles(agent, params.goal)
      ]);

      return {
        outputs: results.flatMap((x) => x.outputs),
        messages: [
          ChatMessageBuilder.functionCall(this.name, params),
          ChatMessageBuilder.functionCallResult(this.name, "Understanding data..."),
          ...results.flatMap((x) => x.messages)
        ]
      };
    }
  }

  readAndAnalyzeFiles(agent: Agent<unknown>, goal: string): Promise<AgentFunctionResult>[] {
    const workspace = agent.context.workspace;
    const files = workspace.readdirSync("./")
      .filter((x) => x.type === "file");

    const readAndAnalyzeCSVData = new ReadAndAnalyzeCSVDataFunction().buildExecutor(agent);

    return files.map((file) => readAndAnalyzeCSVData({
      path: file.name,
      question: goal
    }));
  }
}
