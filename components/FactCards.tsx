"use client";

import { useInView } from "motion/react";
import * as m from "motion/react-m";
import { useCallback, useEffect, useRef, type PointerEvent } from "react";

import { CountUp } from "@/components/CountUp";
import { FactArt } from "@/components/FactArt";
import { factCards, timeUnits, type FactCard } from "@/lib/content";
import { pad2, splitDuration } from "@/lib/format";
import { useCountTween } from "@/lib/hooks";

const MAX_TILT = 3.5;

/** Seconds counting up, shown as hours, minutes and seconds. */
function DurationCount({ seconds, start }: { seconds: number; start: boolean }) {
  const hoursRef = useRef<HTMLSpanElement>(null);
  const minutesRef = useRef<HTMLSpanElement>(null);
  const secondsRef = useRef<HTMLSpanElement>(null);
  const final = splitDuration(seconds);

  const onFrame = useCallback((value: number) => {
    const parts = splitDuration(value);
    if (hoursRef.current) hoursRef.current.textContent = String(parts.hours);
    if (minutesRef.current) minutesRef.current.textContent = pad2(parts.minutes);
    if (secondsRef.current) secondsRef.current.textContent = pad2(parts.seconds);
  }, []);
  useCountTween(seconds, onFrame, { duration: 2200, start });

  const digits = "numeral text-[clamp(2.1rem,1.5rem+2vw,2.9rem)] font-bold leading-none";
  const unit = "text-[1rem] font-medium text-steel";

  return (
    <>
      <span className="sr-only">
        {final.hours} {timeUnits.hours} {final.minutes} {timeUnits.minutes} {final.seconds}{" "}
        {timeUnits.seconds}
      </span>
      <span aria-hidden="true" className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="inline-flex items-baseline gap-1.5">
          <span ref={hoursRef} className={digits}>
            {final.hours}
          </span>
          <span className={unit}>{timeUnits.hours}</span>
        </span>
        <span className="inline-flex items-baseline gap-1.5">
          <span ref={minutesRef} className={digits}>
            {pad2(final.minutes)}
          </span>
          <span className={unit}>{timeUnits.minutes}</span>
        </span>
        <span className="inline-flex items-baseline gap-1.5">
          <span ref={secondsRef} className={digits}>
            {pad2(final.seconds)}
          </span>
          <span className={unit}>{timeUnits.seconds}</span>
        </span>
      </span>
    </>
  );
}

function FactCardView({ card, index }: { card: FactCard; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const inView = useInView(cardRef, { once: true, amount: 0.35 });

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // GPU-only tilt: two CSS variables feed a transform; CSS limits it to
  // fine pointers and to visitors who have not asked for reduced motion.
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const element = event.currentTarget;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      element.dataset.tilting = "true";
      element.style.setProperty("--ry", `${(x * MAX_TILT * 2).toFixed(2)}deg`);
      element.style.setProperty("--rx", `${(-y * MAX_TILT * 2).toFixed(2)}deg`);
    });
  };

  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    cancelAnimationFrame(frame.current);
    delete element.dataset.tilting;
    element.style.setProperty("--rx", "0deg");
    element.style.setProperty("--ry", "0deg");
  };

  return (
    <m.li
      data-reveal=""
      className="min-w-0"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.09, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div
        ref={cardRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="tilt panel flex h-full flex-col p-6 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="numeral text-[0.72rem] font-medium tracking-[0.12em] text-dim">
              {pad2(index + 1)}
            </span>
            <h4 className="text-[1.05rem] font-bold text-steel">{card.title}</h4>
          </div>
          <div className="h-24 shrink-0 sm:h-28">
            <FactArt kind={card.kind} />
          </div>
        </div>

        <p className="mt-6 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          {card.kind === "time" ? (
            <DurationCount seconds={card.value} start={inView} />
          ) : (
            <>
              {card.prefix ? (
                <span className="text-[1rem] font-medium text-steel">{card.prefix}</span>
              ) : null}
              <span className="numeral text-[clamp(2.6rem,1.8rem+2.6vw,3.6rem)] font-bold leading-none">
                <CountUp value={card.value} start={inView} duration={1800} />
                {card.suffix}
              </span>
              {card.unit ? (
                <span className="text-[1.15rem] font-medium text-steel">{card.unit}</span>
              ) : null}
            </>
          )}
        </p>
        {card.note ? <p className="mt-1.5 text-[0.98rem] text-steel">{card.note}</p> : null}

        <p className="mt-4 text-[1.05rem] leading-relaxed text-white">{card.line}</p>

        {card.extra ? (
          <dl className="mt-4 grid gap-2 border-t border-line pt-4 text-[0.95rem]">
            {card.extra.map((row) => (
              <div key={row.label} className="flex flex-wrap justify-between gap-x-4">
                <dt className="text-dim">{row.label}</dt>
                <dd className="font-medium text-white">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-auto pt-6">
          {card.basis.map((line) => (
            <p key={line} className="text-[0.86rem] leading-relaxed text-dim">
              {line}
            </p>
          ))}
        </div>
      </div>
    </m.li>
  );
}

export function FactCards() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {factCards.map((card, index) => (
        <FactCardView key={card.kind} card={card} index={index} />
      ))}
    </ul>
  );
}
