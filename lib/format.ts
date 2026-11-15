/**
 * Number and time formatting helpers.
 * Everything here is deterministic, so server and client output always match.
 */

/** Indian digit grouping: 100000 -> "1,00,000", 14766 -> "14,766". */
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

/** Rounds to a number of significant digits without floating point noise. */
export function roundSig(value: number, digits = 3): number {
  if (value === 0 || !Number.isFinite(value)) return 0;
  const exponent = Math.floor(Math.log10(Math.abs(value))) - (digits - 1);
  if (exponent >= 0) {
    const factor = 10 ** exponent;
    return Math.round(value / factor) * factor;
  }
  const factor = 10 ** -exponent;
  return Math.round(value * factor) / factor;
}

/** An honest approximation: three significant digits, at most one decimal. */
export function formatApprox(value: number): string {
  const rounded = roundSig(value, 3);
  return rounded >= 100 ? formatIN(Math.round(rounded)) : formatIN(rounded, 1);
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

export function splitDuration(totalSeconds: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const whole = Math.max(0, Math.round(totalSeconds));
  return {
    hours: Math.floor(whole / 3600),
    minutes: Math.floor((whole % 3600) / 60),
    seconds: whole % 60,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
