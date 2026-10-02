# Design — caso-01 ("Cartelera")

**Direction:** "Cine nocturno" — a dark theatre lit by a marquee: near-black warm surfaces, one amber
accent, condensed poster-style headings. Light mode is the printed program: ivory paper, graphite ink.

## Palette (tokens in `src/index.css`, oklch)

- `background` warm near-black (dark) / ivory (light); `card` one step lighter.
- `primary` amber: the one main action per view (e.g. "Ver tráiler"), selected genres, the rating number.
- `secondary` / `muted`: badges, skeletons and secondary text. `accent`: hover/selected surfaces.
- `destructive` only for errors. Both themes share the hue family (60–85) so they feel like one brand.

## Typography

- `font-display` (Oswald): page and movie titles, section titles and big numbers, in uppercase.
- `font-sans` (Manrope): all UI text. Use `tabular-nums` for years, ratings and money.

## Imagery

- Posters are always 2:3 (`aspect-2/3`), backdrops are decoration only (`alt=""`, blurred, low opacity).
- Images come from TMDB in three widths; components pass `sizes` so the browser picks the smallest.

## Shape and density

- Radius `0.625rem`. Grid of 2 → 5 columns. `gap-4` in grids, `mt-12` between detail sections.

## Motion

- Card → detail: the poster morphs (shared `<ViewTransition name="poster-<id>">`, 380 ms). Only the clicked
  card carries the name, so the same movie can sit in several home sections.
- Home hero: auto-advances every 6 s; pauses on hover, focus, an open trailer and `prefers-reduced-motion`
  (which also makes slide changes instant).
- Everything else: ≤ 250 ms. All of it is disabled with `prefers-reduced-motion`.

## Don't

- No hex or Tailwind palette colors (`bg-amber-500`): tokens only.
- No second accent color; hierarchy comes from size, weight and spacing.
- No decorative gradients. The exceptions are the detail backdrop and the home hero image fading into the background.
- No emoji as icons (use lucide). The ★ in ratings is text, not an icon.
- No display font below `text-2xl` (except the header logo at `text-2xl`).
