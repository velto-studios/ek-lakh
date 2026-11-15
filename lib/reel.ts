/**
 * A tiny bridge between any call to action and the reel player.
 * The event is dispatched synchronously inside the click handler, so the
 * browser still treats the resulting play() call as user initiated.
 */

export const PLAY_REEL_EVENT = "velto:play-reel";
export const REEL_PLAYER_ID = "reel-player";

export function requestReelPlayback(): void {
  if (typeof window === "undefined") return;
  const target =
    document.getElementById(REEL_PLAYER_ID) ?? document.getElementById("reel");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  window.dispatchEvent(new CustomEvent(PLAY_REEL_EVENT));
}

/** Copies text to the clipboard, with a fallback for browsers without the async API. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path below.
  }
  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "0";
    field.style.left = "0";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    field.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  } catch {
    return false;
  }
}
