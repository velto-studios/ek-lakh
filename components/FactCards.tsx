"use client";

import { useInView } from "motion/react";
import * as m from "motion/react-m";
import { Fragment, useEffect, useRef, type PointerEvent } from "react";

import { CountUp } from "@/components/CountUp";
import { FactArt } from "@/components/FactArt";
import { scoreSeparator, statCards, type StatCard } from "@/lib/content";
import { pad2 } from "@/lib/format";

const MAX_TILT = 3.5;

function StatCardView({ card, index }: { card: StatCard; index: number }) {
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
          <span className="numeral text-[0.72rem] font-medium tracking-[0.12em] text-dim">
            {pad2(index + 1)}
          </span>
          <div className="h-24 shrink-0 sm:h-28">
            <FactArt kind={card.kind} values={card.values} />
          </div>
        </div>

        {/* The number and what it counts sit on separate lines, so a running count never reflows the card. */}
        <h4 className="mt-6">
          <span className="numeral block whitespace-nowrap text-[clamp(2.6rem,1.8rem+2.6vw,3.6rem)] font-bold leading-none">
            {card.values.map((value, position) => (
              <Fragment key={position}>
                {position > 0 ? <span className="text-dim"> {scoreSeparator} </span> : null}
                <CountUp value={value} from={card.from} start={inView} duration={1800} />
              </Fragment>
            ))}
          </span>
          <span className="mt-2 block text-[1.15rem] font-medium text-steel">{card.title}</span>
        </h4>

        {card.quote ? (
          <p className="mt-3 text-[1.08rem] font-bold leading-snug text-butter">{card.quote}</p>
        ) : null}
        <p className="mt-3 text-[1.05rem] leading-relaxed text-white">{card.line}</p>
      </div>
    </m.li>
  );
}

export function FactCards() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {statCards.map((card, index) => (
        <StatCardView key={card.kind} card={card} index={index} />
      ))}
    </ul>
  );
}
