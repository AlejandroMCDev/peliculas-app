---
name: new-feature
description: Create a new feature following the project's Clean Architecture, by chaining the feature-planner, implementer and test-writer agents with the user's approval in between. Use when the user asks to create or add a new feature, module or section of the app.
---

# /new-feature <name>

1. Delegate to the `feature-planner` agent with the user's description. It asks what it needs and
   writes `docs/plans/<date>-feature-<name>.md` with status `draft`.
2. Show the plan summary to the user. Apply their changes to the plan. Continue only when the user
   says it is approved; then set the plan's status to `approved`.
3. Delegate to the `implementer` agent with the plan path.
4. Delegate to the `test-writer` agent with the plan path and the list of files the implementer changed.
5. Run `/check`. Report: files created, tests added, anything left open in the plan.

The reference shape is `src/features/habits`: every new feature mirrors it.
