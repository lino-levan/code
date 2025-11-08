import { Tool } from "../../agents/mod.ts";
import z from "zod";
import { walk } from "@std/fs";
import { resolve } from "@std/path";

/**
 * A lightweight grep‑style search tool.
 *
 * Parameters:
 *  - pattern: RegExp string or literal (e.g. "/foo/i" or "foo")
 *  - path:     file or directory to search
 *  - flags:    RegExp flags (i,m,g)
 *  - recursive: search sub‑directories
 *  - countOnly: return only the total match count
 */
async function findMatches(
  filePath: string,
  regex: RegExp,
): Promise<Array<{ line: number; text: string }>> {
  const content = await Deno.readTextFile(filePath);
  const lines = content.split("\n");
  const matches: Array<{ line: number; text: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (regex.test(line)) {
      matches.push({ line: i + 1, text: line });
    }
    regex.lastIndex = 0; // reset if /g is present
  }
  return matches;
}

export default new Tool({
  name: "Grep",
  description: "Search files for a pattern, similar to grep.",
  parameters: z.object({
    pattern: z.string().min(1),
    path: z.string().min(1),
    flags: z.string().optional(),
    recursive: z.boolean().default(false),
    countOnly: z.boolean().default(false),
  }),
  async execute({
    param: { pattern, path, flags = "", recursive, countOnly },
  }) {
    const resolvedPath = resolve(path);

    // Build RegExp
    const regExpFlags = (flags.includes("g") ? "g" : "") +
      (flags.includes("i") ? "i" : "") +
      (flags.includes("m") ? "m" : "");
    let regex: RegExp;
    try {
      regex = new RegExp(pattern, regExpFlags);
    } catch (e) {
      throw new Error(`Invalid regex: ${e instanceof Error ? e.message : e}`);
    }

    const results: Array<{
      file: string;
      lineNumber: number;
      line: string;
    }> = [];
    let totalMatches = 0;

    const processFile = async (filePath: string) => {
      const matches = await findMatches(filePath, regex);
      totalMatches += matches.length;
      if (!countOnly) {
        for (const m of matches) {
          results.push({
            file: filePath,
            lineNumber: m.line,
            line: m.text,
          });
        }
      }
    };

    const stat = Deno.statSync(resolvedPath);
    if (stat.isDirectory) {
      for await (
        const entry of walk(resolvedPath, {
          includeDirs: false,
          includeFiles: true,
        })
      ) {
        if (recursive) {
          await processFile(entry.path);
        }
      }
    } else if (stat.isFile) {
      await processFile(resolvedPath);
    } else {
      throw new Error(`Path ${resolvedPath} is neither a file nor a directory`);
    }

    return countOnly
      ? JSON.stringify({ totalMatches })
      : JSON.stringify({ matches: results, totalMatches });
  },
});
