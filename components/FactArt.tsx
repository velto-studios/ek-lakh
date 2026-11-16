import {
  BEAK,
  BUTTER,
  CRIMSON,
  CatHead,
  ChickShapes,
  EYE_GLOW,
  FEATHER,
  INK,
  SOFT,
  TRACK,
} from "@/components/Characters";
import type { StatKind } from "@/lib/content";
import { COATS, coatHex } from "@/lib/scale";

/**
 * Small hand-drawn illustrations for the stat cards, built from the same
 * shapes and colours as the cast.
 */

const frame = {
  viewBox: "0 0 160 120",
  "aria-hidden": true,
  focusable: false,
  className: "h-full w-auto",
} as const;

interface ArtProps {
  values: readonly number[];
}

/** A carpet of cats, with one small yellow dot somewhere under it. */
function CatsArt() {
  const coats = [...COATS, COATS[0]];
  return (
    <svg {...frame}>
      <defs>
        <pattern id="art-cats" width="30" height="18" patternUnits="userSpaceOnUse">
          {coats.map((coat, index) => (
            <g
              key={`${coat.key}-${index}`}
              transform={`translate(${1 + (index % 3) * 10} ${0.8 + Math.floor(index / 3) * 9})`}
              fill={coat.hex}
            >
              <path d="M0.6 3.4 1.1 0.3 3.4 2ZM7.4 3.4 6.9 0.3 4.6 2Z" />
              <circle cx="4" cy="4.6" r="3.1" />
            </g>
          ))}
        </pattern>
      </defs>
      <rect width="160" height="120" fill="url(#art-cats)" />
      <circle cx="80" cy="60" r="12" fill={INK} opacity="0.92" />
      <circle cx="80" cy="60" r="5.5" fill={BUTTER} />
    </svg>
  );
}

function ChickArt() {
  return (
    <svg {...frame}>
      <ellipse cx="80" cy="111" rx="30" ry="4" fill="#000000" opacity="0.4" />
      <g transform="translate(29 6) scale(2.2)">
        <ChickShapes />
      </g>
    </svg>
  );
}

/** The red dot, and three cats that cannot look away. */
function DotArt() {
  const watchers = [
    { x: 24, y: 28 },
    { x: 137, y: 42 },
    { x: 34, y: 98 },
  ];
  return (
    <svg {...frame}>
      <g fill="none" stroke={CRIMSON}>
        <circle cx="80" cy="60" r="24" strokeOpacity="0.4" strokeWidth="1.4" />
        <circle cx="80" cy="60" r="38" strokeOpacity="0.2" strokeWidth="1.2" />
        <circle cx="80" cy="60" r="52" strokeOpacity="0.09" strokeWidth="1" />
      </g>
      <rect x="71" y="51" width="18" height="18" fill={CRIMSON} />
      {watchers.map((watcher) => {
        // Each pupil sits a little towards the dot.
        const dx = 80 - watcher.x;
        const dy = 60 - watcher.y;
        const length = Math.hypot(dx, dy);
        const px = (dx / length) * 1.5;
        const py = (dy / length) * 1.1;
        return (
          <g key={`${watcher.x}-${watcher.y}`} transform={`translate(${watcher.x} ${watcher.y})`}>
            <ellipse cx="-5" cy="0" rx="3.4" ry="3.9" fill={EYE_GLOW} />
            <ellipse cx="5" cy="0" rx="3.4" ry="3.9" fill={EYE_GLOW} />
            <ellipse cx={-5 + px} cy={py} rx="0.9" ry="2.8" fill={INK} />
            <ellipse cx={5 + px} cy={py} rx="0.9" ry="2.8" fill={INK} />
          </g>
        );
      })}
    </svg>
  );
}

/** Mother Hen is calling. */
function CallArt() {
  return (
    <svg {...frame}>
      <g fill="none" stroke={SOFT} strokeWidth="2" strokeLinecap="round">
        <path d="M46 44c-5 9-5 23 0 32" />
        <path d="M35 36c-9 14-9 34 0 48" strokeOpacity="0.5" />
        <path d="M114 44c5 9 5 23 0 32" />
        <path d="M125 36c9 14 9 34 0 48" strokeOpacity="0.5" />
      </g>
      <rect x="57" y="10" width="46" height="100" rx="10" fill="#15161A" stroke="#FFFFFF" strokeWidth="2.6" />
      <path d="M74 18.5h12" stroke={TRACK} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="73.5" cy="37.5" r="3.6" fill={BEAK} />
      <circle cx="80" cy="35" r="4.3" fill={BEAK} />
      <circle cx="86.5" cy="37.5" r="3.6" fill={BEAK} />
      <circle cx="80" cy="50" r="12.5" fill={FEATHER} />
      <path d="M76.5 52.5 80 58.5 83.5 52.5Z" fill={BEAK} stroke={BEAK} strokeWidth="1" strokeLinejoin="round" />
      <circle cx="74.8" cy="47.5" r="1.7" fill={INK} />
      <circle cx="85.2" cy="47.5" r="1.7" fill={INK} />
      <path d="M70 74h20M73.5 81h13" stroke={TRACK} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="80" cy="96" r="6.5" fill={BUTTER} />
    </svg>
  );
}

/** Not one cat left: only paw prints, heading off after the dot. */
function LeftArt() {
  const prints = [
    { x: 24, y: 98, opacity: 0.95 },
    { x: 46, y: 76, opacity: 0.78 },
    { x: 72, y: 66, opacity: 0.6 },
    { x: 92, y: 42, opacity: 0.42 },
    { x: 118, y: 33, opacity: 0.27 },
    { x: 138, y: 11, opacity: 0.14 },
  ];
  return (
    <svg {...frame}>
      {prints.map((print) => (
        <g
          key={`${print.x}-${print.y}`}
          transform={`translate(${print.x} ${print.y}) rotate(48)`}
          fill={SOFT}
          opacity={print.opacity}
        >
          <ellipse cx="0" cy="3.2" rx="5.6" ry="4.6" />
          <circle cx="-6.4" cy="-3.2" r="2.3" />
          <circle cx="-2.2" cy="-6.4" r="2.4" />
          <circle cx="2.6" cy="-6.4" r="2.4" />
          <circle cx="6.6" cy="-3" r="2.3" />
        </g>
      ))}
    </svg>
  );
}

/** The scoreboard: Peelu on the left, the cats on the right. */
function ScoreArt({ values }: ArtProps) {
  const [home = 0, away = 0] = values;
  const digits = { fontSize: 34, fontWeight: 700, textAnchor: "middle", className: "font-mono" } as const;
  return (
    <svg {...frame}>
      <rect x="6" y="22" width="148" height="76" rx="12" fill="none" stroke={TRACK} strokeWidth="2" />
      <path d="M80 30v60" stroke={TRACK} strokeWidth="2" strokeLinecap="round" />
      <g transform="translate(13 43) scale(0.7)">
        <ChickShapes />
      </g>
      <text x="62" y="72" fill="#FFFFFF" {...digits}>
        {home}
      </text>
      <text x="98" y="72" fill={SOFT} {...digits}>
        {away}
      </text>
      <g transform="translate(114 45) scale(0.54)">
        <CatHead coat={coatHex("grey")} />
      </g>
    </svg>
  );
}

const art: Record<StatKind, (props: ArtProps) => React.JSX.Element> = {
  cats: CatsArt,
  chick: ChickArt,
  dot: DotArt,
  call: CallArt,
  left: LeftArt,
  score: ScoreArt,
};

export function FactArt({ kind, values }: { kind: StatKind } & ArtProps) {
  const Art = art[kind];
  return <Art values={values} />;
}
