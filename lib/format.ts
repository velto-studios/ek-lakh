/**
 * Number, date and time formatting helpers.
 * Everything here is deterministic, so server and client output always match.
 */

/** Indian digit grouping: 100000 -> "1,00,000", 10000 -> "10,000". */
export function formatIN(value: number, fractionDigits = 0): string {
  const fixed = Math.abs(value).toFixed(fractionDigits);
  const [whole = "0", fraction] = fixed.split(".");
  let grouped = whole;
  if (whole.length > 3) {
    const head = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    grouped = `${head},${whole.slice(-3)}`;
  }
  const sign = value < 0 ? "-" : "";
  return fraction ? `${sign}${grouped}.${fraction}` : `${sign}${grouped}`;
}

export function pad2(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(2, "0");
}

/** Media clock: 65.4 -> "1:05". */
export function formatClock(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const whole = Math.floor(totalSeconds);
  return `${Math.floor(whole / 60)}:${pad2(whole % 60)}`;
}

/**
 * "2026-11-16" -> "16 नवंबर 2026", using the twelve month names passed in.
 * The string is split by hand (no Date, no Intl), so the result never depends
 * on the time zone or locale data of whichever machine renders it.
 */
export function formatDateHi(iso: string, months: readonly string[]): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const month = months[Number(match[2]) - 1];
  if (!month) return iso;
  return `${Number(match[3])} ${month} ${match[1]}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
