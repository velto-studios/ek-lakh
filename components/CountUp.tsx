"use client";

import { useCallback, useRef, useState } from "react";

import { formatIN } from "@/lib/format";
import { useCountTween } from "@/lib/hooks";

interface CountUpProps {
  value: number;
  /** Where the first run starts from. */
  from?: number;
  duration?: number;
  /** Hold at the starting value until this becomes true. */
  start?: boolean;
  /** Must be a stable function (module level or memoised). */
  format?: (value: number) => string;
  className?: string;
}

/**
 * A number that counts up to its value. The server renders the final value, so
 * the page is complete without JavaScript; screen readers only ever hear the
 * final value while the animated digits stay hidden from them.
 */
export function CountUp({
  value,
  from = 0,
  duration = 1600,
  start = true,
  format = formatIN,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // Rendered once; afterwards the tween owns the text node, so React never
  // overwrites a frame that is mid-flight.
  const [initial] = useState(() => format(value));

  const onFrame = useCallback(
    (current: number) => {
      if (ref.current) ref.current.textContent = format(Math.round(current));
    },
    [format],
  );
  useCountTween(value, onFrame, { from, duration, start });

  return (
    <>
      <span className="sr-only">{format(value)}</span>
      <span ref={ref} aria-hidden="true" className={className}>
        {initial}
      </span>
    </>
  );
}
