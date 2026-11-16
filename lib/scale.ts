/**
 * The cat army behind the field explorer: how many cats each step shows,
 * where every cat stands and which coat it wears.
 */

export const TOTAL_CATS = 100_000;

export const COUNT_STEPS = [1, 5, 100, 10_000, 100_000] as const;
export type CountStep = (typeof COUNT_STEPS)[number];

/** Coat colours, with how common each one is in the army (weights add up to 1). */
export const COATS = [
  { key: "grey", hex: "#8E939D", weight: 0.3 },
  { key: "ginger", hex: "#DB873A", weight: 0.24 },
  { key: "black", hex: "#3E3F49", weight: 0.14 },
  { key: "white", hex: "#F1EDE6", weight: 0.14 },
  { key: "tabby", hex: "#8F6B4A", weight: 0.18 },
] as const;

export type CoatKey = (typeof COATS)[number]["key"];

export function coatHex(key: CoatKey): string {
  return COATS.find((coat) => coat.key === key)?.hex ?? COATS[0].hex;
}

/** "#RRGGBB" -> three sRGB components in [0, 1]. */
export function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

/**
 * Half the side of the square block that `count` cats form around Peelu, in
 * grid cells: the cats plus Peelu's own cell, measured to the cells' outer edge.
 */
export function blockHalfSide(count: number): number {
  return Math.sqrt(count + 1) / 2 + 0.5;
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

export interface CatLayout {
  /** xyz triples in grid cells; Peelu stands on the origin, which no cat occupies. */
  positions: Float32Array;
  /** Two independent values in [0, 1) per cat: its brightness and its place in the chase. */
  seeds: Float32Array;
  /** rgb triples in [0, 1]: the coat of each cat. */
  colors: Float32Array;
}

const JITTER = 0.5;

/**
 * Places `total` cats on a jittered square grid, ordered ring by ring outwards
 * from Peelu at the origin. Any prefix of the list is therefore a compact,
 * near-square block centred on him, which lets the renderer reveal 1, 5, 100 ...
 * cats just by changing the draw range.
 */
export function buildCatLayout(total: number = TOTAL_CATS, seed = 100_000): CatLayout {
  const random = mulberry32(seed);
  const positions = new Float32Array(total * 3);
  const seeds = new Float32Array(total * 2);
  const colors = new Float32Array(total * 3);
  const palette = COATS.map((coat) => hexToRgb(coat.hex));
  let placed = 0;

  const pickCoat = (): [number, number, number] => {
    let roll = random();
    for (let index = 0; index < COATS.length; index += 1) {
      roll -= COATS[index].weight;
      if (roll < 0) return palette[index];
    }
    return palette[0];
  };

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
      positions[placed * 3] = cells[c * 2] + (random() - 0.5) * JITTER;
      positions[placed * 3 + 1] = 0;
      positions[placed * 3 + 2] = cells[c * 2 + 1] + (random() - 0.5) * JITTER;
      seeds[placed * 2] = random();
      seeds[placed * 2 + 1] = random();
      const [r, g, b] = pickCoat();
      colors[placed * 3] = r;
      colors[placed * 3 + 1] = g;
      colors[placed * 3 + 2] = b;
      placed += 1;
    }
  }

  return { positions, seeds, colors };
}
