# alphaXiv Code

A minimal terminal coding agent written in Deno that delegates tasks to a
GPT‑based LLM and performs safe file‑system operations (`read`, `write`, `grep`,
`directory list`). It bundles a small set of tools that can be invoked via a
prompt‑driven REPL, making it easy to prototype AI‑augmented coding workflows
without installing heavy frameworks. Built with only Deno standard library
imports, the agent can be dropped into any Deno project and extended by adding
new `Tool` modules. Run `deno run --allow-all mod.ts` and start typing commands
– the agent handles the heavy lifting for you.
