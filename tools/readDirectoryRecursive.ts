import z from "zod";
import { Tool } from "../../agents/mod.ts";
import { resolve, join } from "@std/path";

/**
 * Recursively list all files and directories under a given path.
 */
export default new Tool({
  name: "Read directory recursively…",
  description:
    "Recursively lists the files and sub‑directories of a directory, returning full paths. Errors if the path is not a directory.",
  parameters: z.object({
    path: z.string().min(1).describe("Absolute or relative directory to list"),
    depth: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe("Optional maximum depth to walk (0 = unlimited)"),
    includeHidden: z
      .boolean()
      .optional()
      .default(false)
      .describe("If true, include dotfiles and hidden directories in the result (off by default)."),
  }),
  async execute({ param }) {
    const { path, depth = 0, includeHidden } = param;
    const resolved = resolve(path);

    // Ensure the root is a directory
    const stat = await Deno.lstat(resolved);
    if (!stat.isDirectory) {
      throw new Error(`The path "${resolved}" is not a directory.`);
    }

    const results: Array<{ fullPath: string; isFile: boolean; isDirectory: boolean }> = [];

    const walk = async (dir: string, currentDepth: number) => {
      if (depth > 0 && currentDepth >= depth) return;

      for await (const entry of Deno.readDir(dir)) {
        // Skip hidden entries unless includeHidden is true
        if (!includeHidden && entry.name.startsWith(".")) continue;
        const full = join(dir, entry.name);
        results.push({
          fullPath: full,
          isFile: entry.isFile,
          isDirectory: entry.isDirectory,
        });
        if (entry.isDirectory) {
          await walk(full, currentDepth + 1);
        }
      }
    };

    await walk(resolved, 0);
    return JSON.stringify(results, null, 2);
  },
});