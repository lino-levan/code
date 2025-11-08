import { Agent } from "../agents/mod.ts";
import readDirectoryTool from "./tools/readDirectory.ts";
import readFileTool from "./tools/readFile.ts";
import writeFileTool from "./tools/writeFile.ts";
import grepTool from "./tools/grep.ts";
import jsrSearchTool from "./tools/jsrSearch.ts";

const agent = new Agent({
  model: "lmstudio:openai/gpt-oss-20b",
  instructions: "You are alphaXiv Code, a coding agent in the terminal.",
  tools: [
    readFileTool,
    readDirectoryTool,
    writeFileTool,
    grepTool,
    jsrSearchTool,
  ],
});

await agent.cli();
