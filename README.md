# पीलू vs 1 लाख बिल्लियाँ

A Hindi-first, single-page site by **Velto Studios** for a small, silly story: one
yellow chick, Peelu, against an army of one lakh (100,000) cats, and the one small red
dot that wins it for him. The page showcases the Instagram reel and invites visitors
into Team Peelu, where every view of the reel adds one new chick.

The page has a hero with cats' eyes in the dark and a count to 1,00,000, a custom 9:16
reel player, the Team Peelu flock, a WebGL "field" that draws exactly 100,000 cats
around Peelu and lets a red dot lead them away, six stat cards, a scene-by-scene
filmstrip, production notes with the cast, and a closing call to action.

## Stack

- Next.js 16 (App Router, statically prerendered) with React 19 and TypeScript (strict)
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- `motion` for interface animation
- `three` with `@react-three/fiber` for the field (lazy-loaded, client only)
- `lucide-react` for icons
- Self-hosted fonts through `@fontsource/mukta` and `@fontsource/jetbrains-mono`

The site makes no network requests other than for its own files: no external fonts,
scripts, images, analytics or APIs.

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
lib/          content.ts, team.ts, scale.ts, format.ts, hooks.ts, reel.ts
public/       media files (see below)
docs/         project documents
```

## Where the content lives

Every word, number and scene line is in `lib/content.ts`, and every section reads from
that file. The reel's narration is quoted there verbatim.

The cat army is generated in `lib/scale.ts`: the count steps (1, 5, 100, 10,000 and
1,00,000), where each cat stands and which coat it wears.

## Updating Team Peelu

The team count is not live and calls no API. `lib/team.ts` holds three values that are
updated by hand:

| Value | What it is |
| --- | --- |
| `REEL_VIEWS` | The reel's view count when it was last checked |
| `REEL_URL` | Link to the reel; while it is empty, no link is shown |
| `UPDATED_ON` | The date of that check, as `YYYY-MM-DD` |

The page shows 1 (Peelu) + `REEL_VIEWS` chicks, plus one more if the visitor has
joined. To update it, edit the file and redeploy. A visitor's own chick is saved only
in that browser's `localStorage`.

## Media

The files in `public/` are produced by the reel pipeline, not by this project:

| File | What it is |
| --- | --- |
| `reel.mp4` | The reel, 9:16, about 50 s, Hindi narration with burned-in subtitles |
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
`prefers-reduced-motion`: count-ups jump to their final value, the eyes in the hero
hold still and the red dot does not follow the pointer, auto-rotation stops, and
entrance animations are skipped. If WebGL is unavailable the field falls back to a
static SVG sketch.
