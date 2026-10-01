---
paths: ['src/**/*.tsx']
---

# Component rules

- Split route/container from screen: the container gets data and callbacks; the screen is pure
  (props in, JSX out) and is what tests render.
- One component per file, named export, file name in kebab-case (`task-list.tsx` → `TaskList`).
  Small private sub-components used by one screen may live in the same file.
- Props are a `type` named `<Component>Props`. No `any`; no `React.FC`.
- Model screen states explicitly: loading, empty, error and success are all designed.
- Effects only synchronize with external systems. Derived values are computed during render;
  server data is loaded with TanStack Query hooks (`presentation/<entity>-queries.ts`), never `useEffect` + `fetch`.
- Compose instead of configuring: prefer `children` and small components over many boolean props.
- Use shadcn components from `@/shared/ui`; to change one, edit its file there (it is our code).
- Classes are merged with `cn()`. No inline `style` except for truly dynamic values.
- Follow `vercel-composition-patterns` for component APIs and `vercel-react-best-practices` for
  performance (when installed).

## Checklist

- [ ] Every interactive element is reachable and usable by keyboard, with a visible focus ring
- [ ] Inputs have labels; icon-only buttons have `aria-label`
- [ ] Loading, empty and error states exist
