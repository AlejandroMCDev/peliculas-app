# caso-01

Study project: "Cartelera", a movie explorer on the TMDB API built to practice best practices, Clean
Architecture and UI design at intermediate complexity. Users browse movies in a grid with infinite scroll,
filter them (genres, cast, director, years, rating, runtime, sort) or search by title, and open a detail
page (synopsis, cast, trailer, box office, recommendations). UI and data in Spanish (es-MX); code in English.

## Stack

Vite + React 19 + React Router (data mode, `useTransitions`) · TypeScript strict · TanStack Query ·
axios · Tailwind CSS · shadcn/ui · Zod · React `<ViewTransition>` · Vitest + Testing Library · pnpm. Node 22.
TMDB token in `VITE_TMDB_TOKEN` (`.env.local`, see `.env.example`).

## Architecture (Clean Architecture per feature)

- `src/features/<name>/{domain,application,infrastructure,presentation}` + `<name>.composition.ts` + `index.ts`.
- Dependencies point inward: presentation → application → domain ← infrastructure.
  Only `<name>.composition.ts` picks the infrastructure implementation.
- Other code imports a feature only through `@/features/<name>`.
- `src/shared` holds generic code and never imports a feature. `src/shared/ui` is shadcn code.
- Server state lives in TanStack Query (`presentation/<entity>-queries.ts`, one query key factory).
  Filters live in the URL (`use-movie-filters.ts`), so every view is shareable and Back works.
- Tests: ALL tests live in `src/test/`, mirroring the path of the file under test
  (`src/features/x/domain/a.ts` → `src/test/features/x/domain/a.test.ts`). Never next to the code.
- Details: `.claude/rules/architecture.md`. Reference feature: `src/features/movies`.

## Working agreement

- Never assume. If a requirement, name, data shape or design decision is unclear, ask first.
- Plan before multi-file changes; keep changes small and focused on the request.
- Validate every external input (API responses, URL params, env) with Zod.
- Every screen handles loading (shadcn `Skeleton`), empty and error states.
- Use design tokens only (see `docs/design.md`); never hard-coded colors or font sizes.
- Before saying a task is done, run `pnpm check`.

## Skills & agents

- Performance: `vercel-react-best-practices`. Component APIs: `vercel-composition-patterns`.
- UI: `frontend-design` for visual direction, `web-design-guidelines` to audit it, `shadcn` for components,
  `vercel-react-view-transitions` for the card → detail morph and route transitions.
- Running-app checks: `webapp-testing`.
- Agents in `.claude/agents/`: `feature-planner` and `code-auditor` write plans in `docs/plans/`;
  `implementer` executes an APPROVED plan; `test-writer` writes tests. Use `/improve` or `/new-feature`
  to chain them. Never implement a plan whose status is not `approved`.

## Commands

- `pnpm dev` — dev server
- `pnpm check` — format, lint, typecheck, test, build (same as CI)
- `pnpm test:watch` — tests in watch mode
- `pnpm dlx shadcn@latest add <component>` — add a shadcn component (files land in `src/shared/ui`)

## Git

- Base branch `main`. Commits: Conventional Commits (`feat: add movie filters`), in English.
- Never commit `.env*` files (except `.env.example`).
