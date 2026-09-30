# Design — caso-01

**Direction:** "Cuaderno editorial" — a bullet-journal feel: bone paper, near-black ink, one forest-green accent.

## Palette (tokens in `src/index.css`, oklch)

- `background` bone paper; `card` slightly lighter paper; `foreground` near-black ink.
- `primary` forest green: the one main action per view and the completed-day dots.
- `accent` pale green: hover/selected surfaces. `muted` for secondary text and empty dots.
- `destructive` only for errors. Dark mode keeps the same hue (155) on a deep green-black.

## Typography

- `font-display` (Fraunces): page titles and big numbers only.
- `font-sans` (Inter Tight): all UI text. Use `tabular-nums` for streaks and counters.

## Shape and density

- Radius `0.625rem` (medium). Spacious density: `p-4` rows, `space-y-8` between page sections.

## Don't

- No hex or Tailwind palette colors (`bg-green-600`): tokens only.
- No second accent color; hierarchy comes from size, weight and spacing.
- No gradients, shadows-as-decoration or emoji as icons (use lucide).
- No display font below `text-2xl`.
- No animation longer than 250 ms; respect `prefers-reduced-motion`.
