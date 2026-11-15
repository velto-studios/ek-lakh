# एक लाख लोग असल में कितने होते हैं?

A Hindi-first, single-page visual story by **Velto Studios**. It presents one idea,
what one lakh (100,000) people actually look like, and showcases the Instagram reel
made about it.

The page has a hero with a live count to 1,00,000, a custom 9:16 reel player, a WebGL
"scale explorer" that draws exactly 100,000 points on football pitches, a scene-by-scene
filmstrip, production notes with sources, and a closing call to action.

## Stack

- Next.js 16 (App Router, statically prerendered) with React 19 and TypeScript (strict)
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- `motion` for interface animation
- `three` with `@react-three/fiber` for the scale explorer (lazy-loaded, client only)
- `lucide-react` for icons
- Self-hosted fonts through `@fontsource/mukta` and `@fontsource/jetbrains-mono`

The site makes no network requests other than for its own files: no external fonts,
scripts, images or analytics.

## Commands

```bash
npm install        # install dependencies
npm run dev        # local development at http://localhost:3000
npm run build      # production build (the page is prerendered as static HTML)
npm run start      # serve the production build
npm run typecheck  # TypeScript, no emit
```

Node.js 20.9 or newer is required.

## Layout

```
app/          layout.tsx (metadata, fonts), page.tsx, globals.css (theme), icon.svg
components/   one flat folder of React components
lib/          content.ts, scale.ts, format.ts, hooks.ts, reel.ts
public/       media files (see below)
docs/         project documents
```

## Where the content lives

Every word, number, scene line and source link is in `lib/content.ts`. The eight
verified facts are stored there once, each with the assumption it rests on, and every
section reads from that file.

The figures in the scale explorer are not written by hand. They are computed in
`lib/scale.ts` from three constants: the area per person for each crowd density
(10, 4.5 and 2.5 square feet), the pitch size (105 × 68 m) and the number of people.

## Media

The files in `public/` are produced by the reel pipeline, not by this project:

| File | What it is |
| --- | --- |
| `reel.mp4` | The reel, 9:16, about 55 s, Hindi narration with burned-in subtitles |
| `poster.jpg` | Player cover, 1080 × 1920 |
| `og.jpg` | Link preview image, 1200 × 630 |
| `s1.jpg` … `s8.jpg` | One still per scene, 720 × 1280 |

The build does not need them. Until they are added, the player shows its error state
with a retry button and each scene card shows a numbered placeholder tile.

## Configuration

`NEXT_PUBLIC_SITE_URL` is optional. It sets the absolute base URL used for the
canonical link and the Open Graph image, and defaults to `https://ek-lakh.vercel.app`.

## Accessibility and motion

The page is keyboard operable, uses real landmarks and buttons, and respects
`prefers-reduced-motion`: count-ups jump to their final value, parallax and
auto-rotation stop, and entrance animations are skipped. If WebGL is unavailable the
scale explorer falls back to a static, to-scale SVG plan.
