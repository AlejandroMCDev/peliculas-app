---
name: check
description: Run the same quality gate as CI (format, lint, typecheck, tests, build) and fix failures. Use before committing, before opening a PR, or when the user asks to check, verify or validate the project.
---

# /check

1. Run `pnpm check`. If it passes, say so in one line and stop.
2. On failure, fix the root cause of the first failing step, then run `pnpm check` again.
   - Format: `pnpm format`. Lint: try `pnpm lint --fix` first.
   - Never silence a rule (`eslint-disable`, `@ts-ignore`, `any`, skipped tests) to make it pass.
     If a rule seems wrong for the case, stop and ask.
   - A layer-rule error means code is in the wrong layer: move it (see `.claude/rules/architecture.md`).
3. Stop after 5 fix cycles, or earlier if the same error repeats twice, and report what remains.
4. Summarize: what failed, what you changed, final status.
