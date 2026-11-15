import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

const noopSubscribe = () => () => {};

/** False on the server and during hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

function subscribeVisibility(onChange: () => void): () => void {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/** True while the tab is in the foreground. */
export function usePageVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => true,
  );
}

/** Tracks whether an element intersects the viewport (optionally latching once it has). */
export function useOnScreen<T extends Element>(
  ref: RefObject<T | null>,
  rootMargin = "0px",
  once = false,
): boolean {
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        if (entry.isIntersecting) {
          setOnScreen(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setOnScreen(false);
        }
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin, once]);

  return onScreen;
}

interface TweenOptions {
  from?: number;
  duration?: number;
  start?: boolean;
}

/**
 * Tweens towards `target` with an ease-out curve and reports every frame
 * through `onFrame` (which must be stable). Later changes of `target` continue
 * from the value currently shown. With reduced motion the value jumps straight
 * to the target.
 */
export function useCountTween(
  target: number,
  onFrame: (value: number) => void,
  { from = 0, duration = 1600, start = true }: TweenOptions = {},
): void {
  const reduced = usePrefersReducedMotion();
  const shown = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) {
      shown.current = target;
      onFrame(target);
      return;
    }
    if (!start) {
      if (shown.current === null) onFrame(from);
      return;
    }
    const begin = shown.current ?? from;
    if (begin === target) {
      shown.current = target;
      onFrame(target);
      return;
    }

    let frame = 0;
    let startedAt: number | null = null;
    const step = (now: number) => {
      if (startedAt === null) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = progress === 1 ? target : begin + (target - begin) * eased;
      shown.current = value;
      onFrame(value);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    shown.current = begin;
    onFrame(begin);
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, from, duration, start, reduced, onFrame]);
}
