---
name: improve
description: Audit code for bad patterns, bugs and architecture violations, then fix them through an approved plan with tests. Chains code-auditor, implementer and test-writer. Use when the user asks to improve, refactor, clean up, audit or fix the quality of some code.
---

# /improve [path | "changes"]

1. Scope: a path, or "changes" (the diff against `main`). If none is given, ask.
2. Delegate to the `code-auditor` agent with the scope. It writes `docs/plans/<date>-audit-<slug>.md`
   (status `draft`) and returns a summary.
3. Show the findings grouped by severity. Ask which ones to fix (all _Must fix_ by default — confirm).
   Remove the rejected items from the plan, set its status to `approved`.
4. Delegate to the `implementer` agent with the plan path.
5. Delegate to the `test-writer` agent with the plan path and the changed files: it adds tests that
   prove each fix (a test that fails before the fix when possible).
6. Run `/check`. Report per plan item: fixed / skipped / needs a decision.

Never skip step 3: nothing is implemented without the user's approval.
