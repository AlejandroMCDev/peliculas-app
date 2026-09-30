---
name: review
description: Review the current changes against the project's architecture, component, design, accessibility and testing rules before committing or opening a PR. Use when the user asks for a review, self-review or feedback on their changes.
---

# /review

1. Get the changes: `git diff main...HEAD` plus `git diff` (uncommitted). Read changed files whole.
2. Check, citing file:line for each finding:
   - Architecture: right layer, dependency direction, public API only, DTOs contained, Zod at boundaries.
   - Components: pure screens, no `useEffect` data fetching, states designed, composition over flags.
   - Design: tokens only, hierarchy, consistency with `docs/design.md`, nothing generic by default.
   - Accessibility: keyboard, focus, labels, contrast, semantic HTML.
   - Tests: use cases and main interactions covered; tests assert behavior, not implementation.
   - Security: no secrets in client code or commits; external input validated.
3. If installed, also apply `web-design-guidelines`, `vercel-react-best-practices` and
   `vercel-composition-patterns`. For a deeper audit that ends in a fix plan, use `/improve` instead.
4. Report findings grouped as **Must fix** / **Should fix** / **Consider**, each with the fix.
   Say explicitly when a category has nothing to report. Do not edit files unless asked.
