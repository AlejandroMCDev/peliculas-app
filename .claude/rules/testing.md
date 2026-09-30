---
paths: [src/test/**]
---

# Testing rules

- ALL tests live in `src/test/`, never next to the code. They mirror the path of the file under test:
  `src/features/habits/application/create-habit.ts` → `src/test/features/habits/application/create-habit.test.ts`.
- Import the code under test with the `@/` alias, never with `../` relative paths.
- Use cases: test with the in-memory repository — no mocks of our own code, no network.
- Domain rules: plain input → output tests. Pass `today` explicitly; never depend on the real clock.
- Screens: render the pure screen with Testing Library; query by role and accessible name
  (`getByRole('button', { name: 'Add' })`), interact with `user-event`, assert what the user sees.
- Never test implementation details (state variables, internal function calls, CSS classes).
- One behavior per test; the test name says the behavior (`rejects a blank name`).
