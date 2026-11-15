import { PITCH, blockSide, pitchTiling } from "@/lib/scale";

interface ScaleFallbackProps {
  count: number;
  spacing: number;
  label: string;
  note: string;
}

const VIEW_W = 420;
const VIEW_H = 300;
const PAD = 26;

/**
 * Static, to-scale plan view used when WebGL is unavailable: the pitches the
 * crowd needs, with the crowd drawn as a dotted square on top.
 */
export function ScaleFallback({ count, spacing, label, note }: ScaleFallbackProps) {
  const side = blockSide(count, spacing);
  const { cols, rows } = pitchTiling(side);
  const sheetW = cols * PITCH.length;
  const sheetH = rows * PITCH.width;
  const unit = Math.min((VIEW_W - PAD * 2) / sheetW, (VIEW_H - PAD * 2) / sheetH);
  const originX = (VIEW_W - sheetW * unit) / 2;
  const originY = (VIEW_H - sheetH * unit) / 2;
  const blockPx = Math.max(side * unit, 3);

  const pitches: { x: number; y: number }[] = [];
  for (let col = 0; col < cols; col += 1) {
    for (let row = 0; row < rows; row += 1) {
      pitches.push({ x: originX + col * PITCH.length * unit, y: originY + row * PITCH.width * unit });
    }
  }
  const pitchW = PITCH.length * unit;
  const pitchH = PITCH.width * unit;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-5">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label={label}
        className="h-auto max-h-[78%] w-full max-w-[36rem]"
      >
        <defs>
          <pattern id="fallback-crowd" width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.85" fill="#F6EAD8" />
          </pattern>
        </defs>
        <g fill="none" stroke="#CDEEDB" strokeOpacity="0.45" strokeWidth="1">
          {pitches.map((pitch) => (
            <g key={`${pitch.x}-${pitch.y}`}>
              <rect x={pitch.x} y={pitch.y} width={pitchW} height={pitchH} />
              <line
                x1={pitch.x + pitchW / 2}
                y1={pitch.y}
                x2={pitch.x + pitchW / 2}
                y2={pitch.y + pitchH}
              />
              <circle
                cx={pitch.x + pitchW / 2}
                cy={pitch.y + pitchH / 2}
                r={PITCH.centreCircleRadius * unit}
              />
            </g>
          ))}
        </g>
        <rect
          x={VIEW_W / 2 - blockPx / 2}
          y={VIEW_H / 2 - blockPx / 2}
          width={blockPx}
          height={blockPx}
          fill={blockPx < 9 ? "#F6EAD8" : "url(#fallback-crowd)"}
        />
      </svg>
      <p className="max-w-[30rem] text-center text-[0.9rem] leading-relaxed text-dim">{note}</p>
    </div>
  );
}
