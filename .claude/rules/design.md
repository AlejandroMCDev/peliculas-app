---
paths: ['src/**/*.tsx', 'src/**/*.css']
---

# Design rules — read docs/design.md first

- Colors only through tokens (`bg-primary`, `text-muted-foreground`, `border-border`…). No hex, no
  Tailwind palette colors (`bg-blue-500`) in components.
- Typography: `font-display` for page titles and hero text, `font-sans` for UI. Use a clear type
  scale; do not invent sizes per component.
- Spacing follows Tailwind's scale; keep the density chosen in docs/design.md consistent.
- Hierarchy first: one primary action per view; secondary actions are `variant="outline"` or `ghost`.
- Avoid the generic look: no default gradients, no purple-on-white by habit, no emoji as icons, no
  identical cards everywhere. Every visual choice should trace back to docs/design.md.
- Empty states say what to do next; errors say what happened and how to recover.
- Motion is purposeful and short (150–250 ms) and respects `prefers-reduced-motion`. Page/route
  transitions: use `vercel-react-view-transitions` (when installed) instead of ad-hoc animation code.
- New screens or visual changes: apply `frontend-design` (when installed) within docs/design.md.
- Text contrast ≥ 4.5:1 (large text and icons ≥ 3:1) in light and dark mode.
- Mobile first: check 375 px wide before desktop.
