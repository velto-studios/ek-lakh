import { BUTTER, CRIMSON, INK } from "@/components/Characters";
import { COATS, buildCatLayout } from "@/lib/scale";

interface ScaleFallbackProps {
  count: number;
  dotOn: boolean;
  label: string;
  note: string;
}

const VIEW_W = 420;
const VIEW_H = 300;
const CENTRE_X = VIEW_W / 2;
const CENTRE_Y = VIEW_H / 2;
/** Up to this many cats are drawn one by one; beyond it the crowd becomes a textured block. */
const DRAWN_CATS = 100;
const DOT_SIZE = 12;
const DOT_X = 372;

// The same first hundred cats, in the same places and coats, as the 3D scene shows.
const layout = buildCatLayout(DRAWN_CATS);
const nearCats = Array.from({ length: DRAWN_CATS }, (_, index) => {
  const channel = (offset: number) => Math.round(layout.colors[index * 3 + offset] * 255);
  return {
    x: layout.positions[index * 3],
    y: layout.positions[index * 3 + 2],
    fill: `rgb(${channel(0)} ${channel(1)} ${channel(2)})`,
  };
});

/**
 * Static plan view used when WebGL is unavailable: Peelu in the middle with
 * the cats around him and, once the red dot is out, the whole crowd bunched
 * up behind it at the edge. A sketch of the idea, not drawn to scale.
 */
export function ScaleFallback({ count, dotOn, label, note }: ScaleFallbackProps) {
  const individual = count <= DRAWN_CATS;
  // Few cats are drawn large; a big crowd is a block whose side grows with the count.
  const cell = count <= 5 ? 26 : 13;
  const side = 60 + 38 * (Math.log10(Math.max(count, 1)) - 2);
  const texture = count > 10_000 ? 0.62 : 1;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-5">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label={label}
        className="h-auto max-h-[78%] w-full max-w-[36rem]"
      >
        <defs>
          <pattern
            id="fallback-cats"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform={`scale(${texture})`}
          >
            {COATS.slice(0, 4).map((coat, index) => (
              <circle
                key={coat.key}
                cx={2 + (index % 2) * 4}
                cy={2 + Math.floor(index / 2) * 4}
                r="1.25"
                fill={coat.hex}
              />
            ))}
          </pattern>
        </defs>

        <g
          className="fallback-crowd"
          style={{
            transformOrigin: `${CENTRE_X}px ${CENTRE_Y}px`,
            transform: dotOn ? "translate(116px, 0px) scale(0.34)" : "none",
          }}
        >
          {individual ? (
            nearCats
              .slice(0, count)
              .map((cat) => (
                <circle
                  key={`${cat.x}:${cat.y}`}
                  cx={CENTRE_X + cat.x * cell}
                  cy={CENTRE_Y + cat.y * cell}
                  r={cell * 0.34}
                  fill={cat.fill}
                />
              ))
          ) : (
            <rect
              x={CENTRE_X - side / 2}
              y={CENTRE_Y - side / 2}
              width={side}
              height={side}
              fill="url(#fallback-cats)"
            />
          )}
        </g>

        <rect
          x={DOT_X}
          y={CENTRE_Y - DOT_SIZE / 2}
          width={DOT_SIZE}
          height={DOT_SIZE}
          fill={CRIMSON}
          className="fallback-dot"
          opacity={dotOn ? 1 : 0}
        />
        <circle cx={CENTRE_X} cy={CENTRE_Y} r="8" fill={BUTTER} stroke={INK} strokeWidth="2.5" />
      </svg>
      <p className="max-w-[30rem] text-center text-[0.9rem] leading-relaxed text-dim">{note}</p>
    </div>
  );
}
