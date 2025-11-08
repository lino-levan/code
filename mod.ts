import { Agent } from "./agent.ts";
import readFileTool from "./tools/readFile.ts";
import writeFileTool from "./tools/writeFile.ts";
import grepTool from "./tools/grep.ts";
import jsrSearchTool from "./tools/jsrSearch.ts";
import bashTool from "./tools/bashTool.ts";
import readDirectoryRecursiveTool from "./tools/readDirectoryRecursive.ts";

const agent = new Agent({
  model: "lmstudio:openai/gpt-oss-20b",
  instructions: "You are alphaXiv Code, a coding agent in the terminal.",
  tools: [
    bashTool,
    readFileTool,
    writeFileTool,
    grepTool,
    jsrSearchTool,
    readDirectoryRecursiveTool,
  ],
});

await agent.cli();
