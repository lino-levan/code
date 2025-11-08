import z from "zod";
import { Tool } from "../../agents/mod.ts";
import { resolve } from "@std/path";

export default new Tool({
  name: "Read directory…",
  description:
    "Lists the files and sub‑directories of a directory. Errors if the path is not a directory.",
  parameters: z
    .string()
    .min(1)
    .describe("Absolute or relative directory path to list"),
  async execute({ param: path }) {
    // Resolve the path so globbing or relative segments are normalised
    const resolved = resolve(path);

    // Grab FileInfo to ensure we actually have a directory
    const stat = await Deno.lstat(resolved);
    if (!stat.isDirectory) {
      throw new Error(`The path "${resolved}" is not a directory.`);
    }

    // Iterate through the directory contents
    const entries: Array<
      { name: string; isFile: boolean; isDirectory: boolean }
    > = [];
    for await (const entry of Deno.readDir(resolved)) {
      entries.push({
        name: entry.name,
        isFile: entry.isFile,
        isDirectory: entry.isDirectory,
      });
    }

    // If you prefer the raw names only, replace the above with:
    //   const entries = await Array.fromAsync(Deno.readDir(resolved), e => e.name);
    return JSON.stringify(entries);
  },
});
