import { coatHex } from "@/lib/scale";

/**
 * The cast, drawn by hand as inline SVG: Peelu the chick, the cat gang and
 * Mother Hen. Every drawing on the site reuses these shapes and this palette.
 */

export const INK = "#0B0B0D";
export const BUTTER = "#FFD23F";
export const BUTTER_SHADE = "#E3AE1F";
export const BEAK = "#F08C1A";
export const CRIMSON = "#C8102E";
export const EYE_GLOW = "#D2E869";
export const FEATHER = "#F6EAD8";
export const FEATHER_SHADE = "#D8CAB3";
export const SOFT = "#B8BCC4";
export const TRACK = "#34363E";

const CHICK_SYMBOL_ID = "chick-symbol";

/** A chick on a 48 × 48 grid, facing right: round body, beak, eye and tuft. */
export function ChickShapes() {
  return (
    <>
      <path
        d="M22 13.5 19.5 6.5M24 13 24.5 5M26 13.5 29.5 7"
        fill="none"
        stroke={BUTTER}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M19.5 40.5v5M27.5 40.5v5"
        fill="none"
        stroke={BEAK}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="23" cy="27.5" r="15" fill={BUTTER} />
      <path
        d="M12.5 28.5c2.5 5.5 9 6 12 1.5"
        fill="none"
        stroke={BUTTER_SHADE}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M36.6 23.2 45.5 27 36.6 30.6Z"
        fill={BEAK}
        stroke={BEAK}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="30" cy="22.6" r="2.3" fill={INK} />
      <circle cx="30.8" cy="21.8" r="0.7" fill="#FFFFFF" />
    </>
  );
}

/** Defines the chick once, so a large flock costs two nodes per chick. */
export function ChickDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      className="absolute h-0 w-0 overflow-hidden"
    >
      <symbol id={CHICK_SYMBOL_ID} viewBox="0 0 48 48">
        <ChickShapes />
      </symbol>
    </svg>
  );
}

/** One chick of the flock. Needs <ChickDefs /> somewhere on the page. */
export function Chick({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <use href={`#${CHICK_SYMBOL_ID}`} />
    </svg>
  );
}

/** A cat's face on a 60 × 56 grid: two ears, a round head and bright eyes. */
export function CatHead({ coat, whiskers = SOFT }: { coat: string; whiskers?: string }) {
  return (
    <>
      <path d="M8 27 9.5 5.5 25 15Z" fill={coat} stroke={coat} strokeWidth="3" strokeLinejoin="round" />
      <path d="M52 27 50.5 5.5 35 15Z" fill={coat} stroke={coat} strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="30" cy="32" rx="24" ry="20" fill={coat} />
      <ellipse cx="20.5" cy="30" rx="4.7" ry="5.3" fill={EYE_GLOW} />
      <ellipse cx="39.5" cy="30" rx="4.7" ry="5.3" fill={EYE_GLOW} />
      <ellipse cx="20.5" cy="30" rx="1.3" ry="4.1" fill={INK} />
      <ellipse cx="39.5" cy="30" rx="1.3" ry="4.1" fill={INK} />
      <path d="M27.5 38.4h5L30 41.6Z" fill={INK} fillOpacity="0.6" />
      <path
        d="M14 40 3.5 38M14 43.5 4.5 46M46 40 56.5 38M46 43.5 55.5 46"
        fill="none"
        stroke={whiskers}
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.7"
      />
    </>
  );
}

const portrait = "h-full w-full";

/** Peelu, with the red dot he keeps in his pocket. */
export function PeeluPortrait() {
  return (
    <svg viewBox="0 0 120 120" className={portrait} aria-hidden="true" focusable="false">
      <ellipse cx="58" cy="108" rx="30" ry="4.5" fill="#000000" opacity="0.35" />
      <g transform="translate(9 8) scale(2.1)">
        <ChickShapes />
      </g>
      <rect x="99" y="88" width="9" height="9" fill={CRIMSON} />
    </svg>
  );
}

/** Three of the one lakh. */
export function CatGangPortrait() {
  return (
    <svg viewBox="0 0 120 120" className={portrait} aria-hidden="true" focusable="false">
      <g transform="translate(3 12) scale(0.86)">
        <CatHead coat={coatHex("black")} />
      </g>
      <g transform="translate(65.5 12) scale(0.86)">
        <CatHead coat={coatHex("ginger")} />
      </g>
      <g transform="translate(21 43) scale(1.3)">
        <CatHead coat={coatHex("grey")} />
      </g>
    </svg>
  );
}

/** Mother Hen, on the phone as always. */
export function HenPortrait() {
  return (
    <svg viewBox="0 0 120 120" className={portrait} aria-hidden="true" focusable="false">
      <path
        d="M57 110v7M73 110v7"
        fill="none"
        stroke={BEAK}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M94 68c13-9 17-22 12-36-11 5-19 14-21 27Z" fill={FEATHER_SHADE} />
      <ellipse cx="66" cy="80" rx="39" ry="31" fill={FEATHER} />
      <ellipse cx="48" cy="60" rx="18" ry="24" fill={FEATHER} />
      <circle cx="43" cy="42" r="18" fill={FEATHER} />
      <circle cx="35" cy="24.5" r="5.5" fill={BEAK} />
      <circle cx="44" cy="21.5" r="6.5" fill={BEAK} />
      <circle cx="53" cy="25" r="5.5" fill={BEAK} />
      <path d="M26.5 39 13 44.5 26.5 49Z" fill={BEAK} stroke={BEAK} strokeWidth="1.5" strokeLinejoin="round" />
      <ellipse cx="28.5" cy="56" rx="3.4" ry="5.2" fill={BEAK} />
      <circle cx="35.5" cy="40" r="2.7" fill={INK} />
      <circle cx="36.4" cy="39.1" r="0.8" fill="#FFFFFF" />
      <path
        d="M58 82c7 11 22 12 31 1"
        fill="none"
        stroke={FEATHER_SHADE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <g transform="rotate(14 62 44)">
        <rect x="55.5" y="31" width="13" height="25" rx="3.2" fill="#1C1D22" stroke={SOFT} strokeWidth="1.6" />
        <path d="M60 35.5h4" stroke={SOFT} strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <path
        d="M77 31c3.5 2.5 5 6 4.5 10M83 24.5c6.5 4.5 9 11 8 18.5"
        fill="none"
        stroke={SOFT}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
