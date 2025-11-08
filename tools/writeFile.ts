import { Tool } from "../../agents/mod.ts";
import z from "zod";
import { resolve } from "@std/path";
import { ensureFile } from "@std/fs/ensure-file";

export default new Tool({
  name: "Write file…",
  description:
    "Writes or replaces a file. Creates parent directories if needed.",
  parameters: z.object({
    path: z.string().min(1).describe("File path"),
    content: z.string().describe("Text payload to write"),
    overwrite: z
      .boolean()
      .optional()
      .default(true)
      .describe("If false, fail when the file already exists"),
  }),
  async execute({ param: { path, content, overwrite } }) {
    const resolved = resolve(path);

    if (!overwrite) {
      try {
        const stat = await Deno.lstat(resolved);
        if (stat.isFile) {
          throw new Error(`File ${resolved} already exists`);
        }
      } catch {
        /* ignore – file likely doesn’t exist */
      }
    }

    console.log("\n");
    const answer = prompt("Does that look good [y/N]?") ?? "";
    if (answer.toLowerCase() !== "y") {
      return "User declined the change.";
    }

    await ensureFile(resolved);
    await Deno.writeTextFile(resolved, content);

    return `✅ written ${resolved}`;
  },
});
