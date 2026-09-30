---
name: commit
description: Create a git commit for the current changes with the project's message format.
disable-model-invocation: true
---

# /commit

1. `git status` and `git diff`. If there is nothing to commit, say so and stop.
2. Never stage `.env*` (except `.env.example`), secrets, `node_modules`, build output. If any appears,
   stop and warn.
3. Run `pnpm check` (or confirm it ran after the last change). Do not commit a failing check unless
   the user explicitly says so.
4. Stage the related files by name (not `git add -A` if unrelated changes exist — ask).
5. Message: Conventional Commits `type(scope): summary` — feat, fix, refactor, test, docs, chore,
   style; first line ≤ 72 characters, in English; body explains why if not obvious.
6. Show the message, commit, and print `git log -1 --oneline`.
