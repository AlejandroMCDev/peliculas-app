# caso-01 · Cartelera

Movie explorer built as a study project on top of the TMDB API: Clean Architecture per feature,
Vite + React Router, TanStack Query + axios, Tailwind, shadcn/ui, Zod and React View Transitions.

## Setup

1. Get a TMDB **API Read Access Token** (v4) at <https://www.themoviedb.org/settings/api>.
2. Copy `.env.example` to `.env.local` and paste the token after `VITE_TMDB_TOKEN=`.
   `.env.local` is git-ignored: never commit it.

```bash
pnpm install
pnpm dev      # dev server
pnpm check    # format, lint, typecheck, test, build (same as CI)
```

> The token ends up in the browser bundle (any `VITE_*` variable does). That is acceptable for a
> study project with a read-only token; a production app would call TMDB through its own proxy.

Architecture and conventions: `CLAUDE.md`, `.claude/rules/`, `docs/design.md`.

This product uses the TMDB API but is not endorsed or certified by TMDB.
