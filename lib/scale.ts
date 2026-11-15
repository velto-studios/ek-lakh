/**
 * The arithmetic behind the scale explorer.
 * Every figure the explorer shows is derived from these constants.
 */

export const SQFT_IN_SQM = 0.09290304;
export const TOTAL_PEOPLE = 100_000;

export const COUNT_STEPS = [1, 10, 100, 1_000, 10_000, 100_000] as const;
export type CountStep = (typeof COUNT_STEPS)[number];

/** Football pitch, in metres. Length and width follow the FIFA recommended size. */
export const PITCH = {
  length: 105,
  width: 68,
  area: 105 * 68,
  centreCircleRadius: 9.15,
  penaltyDepth: 16.5,
  penaltyWidth: 40.32,
} as const;

export type DensityKey = "loose" | "dense" | "packed";

export interface Density {
  key: DensityKey;
  /** Area per person in square feet (Jacobs method). */
  sqft: number;
  /** Area per person in square metres. */
  area: number;
  /** Distance between neighbours on a square grid, in metres. */
  spacing: number;
}

function density(key: DensityKey, sqft: number): Density {
  const area = sqft * SQFT_IN_SQM;
  return { key, sqft, area, spacing: Math.sqrt(area) };
}

export const DENSITIES: readonly Density[] = [
  density("loose", 10),
  density("dense", 4.5),
  density("packed", 2.5),
];

export function getDensity(key: DensityKey): Density {
  return DENSITIES.find((item) => item.key === key) ?? DENSITIES[0];
}

/** Ground area a crowd needs, in square metres. */
export function crowdArea(count: number, d: Density): number {
  return count * d.area;
}

export function pitchEquivalent(areaSqm: number): number {
  return areaSqm / PITCH.area;
}

/** Side of the square block a crowd forms, in metres. */
export function blockSide(count: number, spacing: number): number {
  return Math.sqrt(count) * spacing;
}

/** How many pitches (columns along the length, rows along the width) cover a square block. */
export function pitchTiling(side: number): { cols: number; rows: number } {
  return {
    cols: Math.max(1, Math.ceil(side / PITCH.length)),
    rows: Math.max(1, Math.ceil(side / PITCH.width)),
  };
}

/** Small seeded PRNG so generated layouts are identical on every run. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface CrowdLayout {
  /** xyz triples in grid units (multiply x and z by the spacing to get metres). */
  positions: Float32Array;
  /** One value in [0, 1) per person, used for brightness variation. */
  seeds: Float32Array;
}

const JITTER = 0.56;

/**
 * Places `total` people on a jittered square grid, ordered ring by ring outwards
 * from the origin. Any prefix of the list is therefore a compact, near-square
 * block centred on the origin, which lets the renderer reveal 1, 10, 100 ...
 * people just by changing the draw range.
 */
export function buildCrowdLayout(total: number = TOTAL_PEOPLE, seed = 100_000): CrowdLayout {
  const random = mulberry32(seed);
  const positions = new Float32Array(total * 3);
  const seeds = new Float32Array(total);
  let placed = 0;

  const place = (cellX: number, cellZ: number, jitter: number) => {
    positions[placed * 3] = cellX + (random() - 0.5) * jitter;
    positions[placed * 3 + 1] = 0;
    positions[placed * 3 + 2] = cellZ + (random() - 0.5) * jitter;
    seeds[placed] = random();
    placed += 1;
  };

  if (total > 0) place(0, 0, 0);

  for (let ring = 1; placed < total; ring += 1) {
    const cells: number[] = [];
    for (let i = -ring; i <= ring; i += 1) cells.push(i, -ring, i, ring);
    for (let j = -ring + 1; j <= ring - 1; j += 1) cells.push(-ring, j, ring, j);

    // Shuffle the ring so a partly filled ring is spread evenly around the block.
    const size = cells.length / 2;
    for (let a = size - 1; a > 0; a -= 1) {
      const b = Math.floor(random() * (a + 1));
      const ax = cells[a * 2];
      const az = cells[a * 2 + 1];
      cells[a * 2] = cells[b * 2];
      cells[a * 2 + 1] = cells[b * 2 + 1];
      cells[b * 2] = ax;
      cells[b * 2 + 1] = az;
    }

    for (let c = 0; c < size && placed < total; c += 1) {
      place(cells[c * 2], cells[c * 2 + 1], JITTER);
    }
  }

  return { positions, seeds };
}

/**
 * Line segments (xyz pairs, metres) for a cols × rows sheet of pitches centred
 * on the origin: touchlines, halfway line, centre circle and penalty areas.
 */
export function buildPitchLines(cols: number, rows: number, circleSegments = 48): Float32Array {
  const out: number[] = [];
  const segment = (x1: number, z1: number, x2: number, z2: number) => {
    out.push(x1, 0, z1, x2, 0, z2);
  };

  const { length, width, centreCircleRadius, penaltyDepth, penaltyWidth } = PITCH;
  const originX = -(cols * length) / 2;
  const originZ = -(rows * width) / 2;
  const halfBox = penaltyWidth / 2;

  for (let col = 0; col < cols; col += 1) {
    for (let row = 0; row < rows; row += 1) {
      const left = originX + col * length;
      const right = left + length;
      const top = originZ + row * width;
      const bottom = top + width;
      const cx = left + length / 2;
      const cz = top + width / 2;

      segment(left, top, right, top);
      segment(right, top, right, bottom);
      segment(right, bottom, left, bottom);
      segment(left, bottom, left, top);
      segment(cx, top, cx, bottom);

      for (let s = 0; s < circleSegments; s += 1) {
        const a0 = (s / circleSegments) * Math.PI * 2;
        const a1 = ((s + 1) / circleSegments) * Math.PI * 2;
        segment(
          cx + Math.cos(a0) * centreCircleRadius,
          cz + Math.sin(a0) * centreCircleRadius,
          cx + Math.cos(a1) * centreCircleRadius,
          cz + Math.sin(a1) * centreCircleRadius,
        );
      }

      segment(left, cz - halfBox, left + penaltyDepth, cz - halfBox);
      segment(left + penaltyDepth, cz - halfBox, left + penaltyDepth, cz + halfBox);
      segment(left + penaltyDepth, cz + halfBox, left, cz + halfBox);
      segment(right, cz - halfBox, right - penaltyDepth, cz - halfBox);
      segment(right - penaltyDepth, cz - halfBox, right - penaltyDepth, cz + halfBox);
      segment(right - penaltyDepth, cz + halfBox, right, cz + halfBox);
    }
  }

  return new Float32Array(out);
}
