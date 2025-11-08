import z from "zod";
import { Tool } from "../../agents/mod.ts";
import { resolve } from "@std/path";

export default new Tool({
  name: "Read file…",
  description:
    "Reads the full text contents of a file. Errors if the path is a folder.",
  parameters: z
    .string()
    .min(1)
    .describe("Absolute or relative file path to read"),
  /**
   * The execute function can be async.  The Agent will await it.
   */
  async execute({ param: path }) {
    // Normalise / resolve the path (helps prevent accidental globbing)
    const resolved = resolve(path);

    // Grab the FileInfo to check file type
    const stat = await Deno.lstat(resolved);
    if (!stat.isFile) {
      // Any non‑file (directory, symlink, socket, …) triggers an error message.
      throw new Error(`The path "${resolved}" is not a regular file.`);
    }

    return await Deno.readTextFile(resolved);
  },
});
