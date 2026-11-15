import type { FactCardKind } from "@/lib/content";
import { PITCH, TOTAL_PEOPLE } from "@/lib/scale";

/**
 * Small hand-drawn illustrations for the fact cards. Each one is built from
 * the same numbers the card states, so the picture is as true as the figure.
 */

const INK = "#FFFFFF";
const SOFT = "#B8BCC4";
const TRACK = "#34363E";

const SECONDS_IN_DAY = 86_400;

function ClockArt() {
  // 1,00,000 seconds = one full day (outer ring) plus the remainder (inner arc).
  const remainder = ((TOTAL_PEOPLE % SECONDS_IN_DAY) / SECONDS_IN_DAY) * 100;
  const ticks = Array.from({ length: 24 }, (_, index) => index);
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" focusable="false" className="h-full w-auto">
      <g transform="translate(80 60)">
        {ticks.map((tick) => (
          <line
            key={tick}
            x1="0"
            y1="-54"
            x2="0"
            y2={tick % 6 === 0 ? -47 : -50}
            stroke={tick % 6 === 0 ? SOFT : TRACK}
            strokeWidth="1.2"
            transform={`rotate(${tick * 15})`}
          />
        ))}
        <circle r="41" fill="none" stroke={INK} strokeWidth="3" />
        <circle r="30" fill="none" stroke={TRACK} strokeWidth="3" />
        <circle
          r="30"
          fill="none"
          stroke={INK}
          strokeWidth="3"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${remainder.toFixed(2)} 100`}
          transform="rotate(-90)"
        />
        <line x1="0" y1="0" x2="0" y2="-19" stroke={SOFT} strokeWidth="1.6" strokeLinecap="round" />
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="-15"
          stroke={SOFT}
          strokeWidth="1.6"
          strokeLinecap="round"
          transform={`rotate(${(remainder / 100) * 360})`}
        />
        <circle r="2.2" fill={INK} />
      </g>
    </svg>
  );
}

function PitchesArt() {
  const total = 13;
  const perRow = 5;
  const pitchW = 27;
  const pitchH = (pitchW * PITCH.width) / PITCH.length;
  const gap = 4.5;
  const cells = Array.from({ length: total }, (_, index) => ({
    x: 2 + (index % perRow) * (pitchW + gap),
    y: 22 + Math.floor(index / perRow) * (pitchH + gap + 6),
  }));
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" focusable="false" className="h-full w-auto">
      <g fill="none" stroke={SOFT} strokeWidth="1">
        {cells.map((cell) => (
          <g key={`${cell.x}-${cell.y}`}>
            <rect x={cell.x} y={cell.y} width={pitchW} height={pitchH} stroke={INK} />
            <line x1={cell.x + pitchW / 2} y1={cell.y} x2={cell.x + pitchW / 2} y2={cell.y + pitchH} />
            <circle cx={cell.x + pitchW / 2} cy={cell.y + pitchH / 2} r="2.4" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function QueueArt() {
  const marks = [0, 10, 20, 30, 40, 50];
  const startX = 8;
  const endX = 152;
  const span = endX - startX;
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" focusable="false" className="h-full w-auto">
      <line
        x1={startX}
        y1="58"
        x2={endX}
        y2="58"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="0.1 4.9"
      />
      <line x1={startX} y1="72" x2={endX} y2="72" stroke={TRACK} strokeWidth="1" />
      {marks.map((mark) => {
        const x = startX + (mark / 50) * span;
        return (
          <g key={mark}>
            <line x1={x} y1="68" x2={x} y2="76" stroke={SOFT} strokeWidth="1" />
            <text
              x={x}
              y="90"
              textAnchor="middle"
              fontSize="8"
              fontWeight="500"
              fill={SOFT}
              className="font-mono"
            >
              {mark}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function BusesArt() {
  // 50 columns × 40 rows = exactly 2,000 buses.
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" focusable="false" className="h-full w-auto">
      <defs>
        <pattern id="art-bus" width="3.2" height="3" patternUnits="userSpaceOnUse">
          <rect x="0.4" y="0.6" width="2.4" height="1.5" rx="0.4" fill={INK} />
        </pattern>
      </defs>
      <rect width="160" height="120" fill="url(#art-bus)" opacity="0.92" />
    </svg>
  );
}

function StadiumArt() {
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" focusable="false" className="h-full w-auto">
      <ellipse cx="80" cy="60" rx="66" ry="44" fill="none" stroke={TRACK} strokeWidth="13" />
      <ellipse
        cx="80"
        cy="60"
        rx="66"
        ry="44"
        fill="none"
        stroke={INK}
        strokeWidth="13"
        pathLength="100"
        strokeDasharray="76 100"
      />
      <ellipse cx="80" cy="60" rx="52" ry="31" fill="none" stroke="#0B0B0D" strokeWidth="1.2" />
      <ellipse cx="80" cy="60" rx="33" ry="19" fill="none" stroke={SOFT} strokeWidth="1" />
      <rect x="77" y="52" width="6" height="16" fill="none" stroke={SOFT} strokeWidth="1" />
    </svg>
  );
}

function IndiaArt() {
  // 138 columns × 107 rows = exactly 14,766 tiles; each tile is one lakh people.
  // The inset magnifies a 5 × 5 patch so a single tile can be seen.
  const inset = { x: 88, y: 55, size: 46 };
  const patch = { x: 30, y: 22, size: 5 };
  const cell = inset.size / 5;
  const tiles = Array.from({ length: 25 }, (_, index) => ({
    x: inset.x + (index % 5) * cell,
    y: inset.y + Math.floor(index / 5) * cell,
    centre: index === 12,
  }));
  return (
    <svg viewBox="0 0 138 107" aria-hidden="true" focusable="false" className="h-full w-auto">
      <defs>
        <pattern id="art-tile" width="1" height="1" patternUnits="userSpaceOnUse">
          <rect x="0.14" y="0.14" width="0.72" height="0.72" fill={SOFT} />
        </pattern>
      </defs>
      <rect width="138" height="107" fill="url(#art-tile)" opacity="0.55" />
      <g fill="none" stroke={INK} strokeWidth="0.7">
        <rect x={patch.x} y={patch.y} width={patch.size} height={patch.size} />
        <line x1={patch.x + patch.size} y1={patch.y} x2={inset.x + inset.size} y2={inset.y} />
        <line x1={patch.x} y1={patch.y + patch.size} x2={inset.x} y2={inset.y + inset.size} />
      </g>
      <rect
        x={inset.x}
        y={inset.y}
        width={inset.size}
        height={inset.size}
        fill="#0B0B0D"
        stroke={INK}
        strokeWidth="0.9"
      />
      {tiles.map((tile) => (
        <rect
          key={`${tile.x}-${tile.y}`}
          x={tile.x + cell * 0.14}
          y={tile.y + cell * 0.14}
          width={cell * 0.72}
          height={cell * 0.72}
          fill={tile.centre ? INK : TRACK}
        />
      ))}
    </svg>
  );
}

const art: Record<FactCardKind, () => React.JSX.Element> = {
  time: ClockArt,
  space: PitchesArt,
  queue: QueueArt,
  buses: BusesArt,
  stadium: StadiumArt,
  india: IndiaArt,
};

export function FactArt({ kind }: { kind: FactCardKind }) {
  const Art = art[kind];
  return <Art />;
}
