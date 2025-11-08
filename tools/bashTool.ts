import z from "zod";
import { Tool } from "../../agents/mod.ts";

export default new Tool({
  name: "Run Bash Command…",
  description:
    "Executes an arbitrary bash command and returns its stdout, stderr and exit code.",
  parameters: z.object({
    command: z
      .string()
      .min(1)
      .describe("The bash command to execute, including any arguments."),
  }),
  async execute({ param: { command } }) {
    try {
      console.log("\n");
      const answer = prompt("Does that look good [y/N]?") ?? "";
      if (answer.toLowerCase() !== "y") {
        return "User declined the change.";
      }
      // Use Deno.Command (deno 2+)
      const cmd = new Deno.Command("bash", {
        args: ["-c", command],
        stdout: "piped",
        stderr: "piped",
      });

      const { success, code, stdout, stderr } = await cmd.output();

      const decoder = new TextDecoder();
      return JSON.stringify({
        stdout: decoder.decode(stdout),
        stderr: decoder.decode(stderr),
        exitCode: code,
        success,
      });
    } catch (err) {
      throw new Error(`Failed to run command: ${err}`);
    }
  },
});
