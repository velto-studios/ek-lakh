"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState, type PointerEvent } from "react";

import { SceneImage } from "@/components/SceneImage";
import { scenes, story } from "@/lib/content";
import { pad2 } from "@/lib/format";

const DRAG_THRESHOLD = 5;

export function Filmstrip() {
  const stripRef = useRef<HTMLOListElement>(null);
  const drag = useRef({ pointerId: -1, startX: 0, startLeft: 0, moved: false });
  const [index, setIndex] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  // Keep the "03 / 08" indicator and the arrow buttons in step with the scroll position.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = strip.scrollWidth - strip.clientWidth;
      const ratio = max > 0 ? strip.scrollLeft / max : 0;
      setIndex(Math.round(ratio * (scenes.length - 1)));
      setEdges({ start: strip.scrollLeft <= 2, end: max <= 0 || strip.scrollLeft >= max - 2 });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    strip.addEventListener("scroll", schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(strip);
    return () => {
      cancelAnimationFrame(frame);
      strip.removeEventListener("scroll", schedule);
      observer.disconnect();
    };
  }, []);

  const step = (direction: 1 | -1) => {
    const strip = stripRef.current;
    const card = strip?.querySelector<HTMLElement>("[data-card]");
    if (!strip || !card) return;
    const gap = Number.parseFloat(getComputedStyle(strip).columnGap) || 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    strip.scrollBy({
      left: direction * (card.offsetWidth + gap),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  // Drag to scroll with a mouse; touch and trackpads scroll natively.
  const onPointerDown = (event: PointerEvent<HTMLOListElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startLeft: event.currentTarget.scrollLeft,
      moved: false,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLOListElement>) => {
    const state = drag.current;
    if (state.pointerId !== event.pointerId) return;
    const delta = event.clientX - state.startX;
    if (!state.moved) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      state.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = "true";
    }
    event.currentTarget.scrollLeft = state.startLeft - delta;
  };

  const onPointerEnd = (event: PointerEvent<HTMLOListElement>) => {
    const state = drag.current;
    if (state.pointerId !== event.pointerId) return;
    state.pointerId = -1;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div>
      <div className="shell mb-6 flex items-center justify-between gap-6">
        <p className="numeral text-[0.95rem] font-medium text-steel">
          <span className="sr-only">{story.progressLabel} </span>
          <span className="text-white">{pad2(index + 1)}</span>
          {" / "}
          {pad2(scenes.length)}
        </p>
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            className="icon-btn icon-btn-outline h-12 w-12"
            aria-label={story.prev}
            disabled={edges.start}
            onClick={() => step(-1)}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn-outline h-12 w-12"
            aria-label={story.next}
            disabled={edges.end}
            onClick={() => step(1)}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ol
        ref={stripRef}
        tabIndex={0}
        aria-label={story.stripLabel}
        className="strip"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        {scenes.map((scene, position) => (
          <li key={scene.n} data-card="" className="strip-card">
            <m.figure
              data-reveal=""
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -6% 0px" }}
              transition={{
                duration: 0.75,
                delay: position < 4 ? position * 0.08 : 0,
                ease: [0.2, 0.7, 0.2, 1],
              }}
            >
              <div className="relative aspect-[9/16] overflow-hidden rounded-[1.25rem] border border-line bg-graphite">
                <SceneImage
                  src={scene.image}
                  alt={`${story.sceneWord} ${scene.n}: ${scene.title}`}
                  number={scene.n}
                />
              </div>
              <figcaption className="mt-5 pr-2">
                <p className="flex items-baseline gap-3">
                  <span className="numeral text-[0.8rem] font-medium tracking-[0.1em] text-dim">
                    {pad2(scene.n)}
                  </span>
                  <span className="text-[1.3rem] font-extrabold leading-snug">{scene.title}</span>
                </p>
                <p className="mt-2 text-[1.02rem] leading-[1.75] text-steel">{scene.line}</p>
              </figcaption>
            </m.figure>
          </li>
        ))}
      </ol>
    </div>
  );
}
