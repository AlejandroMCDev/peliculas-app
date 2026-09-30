---
paths: ['src/**']
---

# Architecture rules

## Where new code goes

| I am writing…                                       | It goes in                                    |
| --------------------------------------------------- | --------------------------------------------- |
| A type, Zod schema or business rule (pure function) | `features/<f>/domain/`                        |
| An interface for data access (a port)               | `features/<f>/domain/<entity>-repository.ts`  |
| Something the user can do (create, list, pay…)      | `features/<f>/application/<verb>-<entity>.ts` |
| An API/Supabase/localStorage call or a DTO mapping  | `features/<f>/infrastructure/`                |
| A component, screen, route, UI hook                 | `features/<f>/presentation/`                  |
| Choosing which repository implementation to use     | `features/<f>/<f>.composition.ts`             |
| Code used by 2+ features with no business meaning   | `shared/`                                     |

## Rules

- domain and application never import React, the framework or `fetch`.
- Use cases receive their repository as the first argument; they validate input with the domain schema.
- Infrastructure maps DTOs to domain entities; DTO types never leave `infrastructure/`.
- Presentation never imports `infrastructure/`; it gets repositories from `<f>.composition.ts`.
- `index.ts` exports only what other code needs. Other features import `@/features/<f>` only.
- A second feature needing another feature's entity imports its type from the public API; if two
  features grow tightly coupled, stop and ask whether they are one feature.
- Errors: throw `AppError` with a code; presentation maps codes to messages.

## Checklist

- [ ] Each new file is in the layer the table above names
- [ ] `pnpm lint` passes (the layer rules are enforced there)
- [ ] New use cases have a test with the in-memory repository
