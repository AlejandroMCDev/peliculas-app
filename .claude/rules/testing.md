---
paths: ['src/**/*.test.ts', 'src/**/*.test.tsx']
---

# Testing rules

- Test files sit next to the file they test: `create-habit.ts` → `create-habit.test.ts`.
- Use cases: test with the in-memory repository — no mocks of our own code, no network.
- Domain rules: plain input → output tests. Pass `today` explicitly; never depend on the real clock.
- Screens: render the pure screen with Testing Library; query by role and accessible name
  (`getByRole('button', { name: 'Add' })`), interact with `user-event`, assert what the user sees.
- Never test implementation details (state variables, internal function calls, CSS classes).
- One behavior per test; the test name says the behavior (`rejects a blank name`).
