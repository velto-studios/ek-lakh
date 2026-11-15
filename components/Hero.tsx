"use client";

import { ArrowDown, Play } from "lucide-react";
import type { CSSProperties } from "react";

import { CountUp } from "@/components/CountUp";
import { HeroCanvas } from "@/components/HeroCanvas";
import { hero } from "@/lib/content";
import { useHydrated } from "@/lib/hooks";
import { requestReelPlayback } from "@/lib/reel";

const order = (index: number) => ({ "--i": index }) as CSSProperties;

export function Hero() {
  const hydrated = useHydrated();

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >
      <HeroCanvas />

      {/* Scrims: keep the copy readable and melt the field into the page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(11,11,13,0.88)_0%,rgba(11,11,13,0.5)_42%,rgba(11,11,13,0.04)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[32%] bg-[linear-gradient(180deg,#0b0b0d_0%,rgba(11,11,13,0)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(0deg,#0b0b0d_6%,rgba(11,11,13,0)_100%)]"
      />

      <div className="shell relative z-10 flex flex-1 flex-col justify-end pb-[clamp(4.75rem,10svh,7rem)] pt-[calc(var(--bar-h)+env(safe-area-inset-top,0px)+1.25rem)]">
        <p className="eyebrow rise" style={order(0)}>
          <span className="eyebrow-mark eyebrow-mark-quiet" aria-hidden="true" />
          <span>
            {hero.eyebrow.brand}
            <span aria-hidden="true"> · </span>
            <span className="font-sans text-[0.95rem] font-medium normal-case tracking-normal">
              {hero.eyebrow.line}
            </span>
          </span>
        </p>

        <h1
          id="hero-title"
          className="rise mt-6 max-w-[20ch] text-[clamp(2.5rem,min(7.4vw,10svh),5.4rem)] font-extrabold leading-[1.16] tracking-[-0.01em]"
          style={order(1)}
        >
          {hero.title}
        </h1>

        <div className="rise mt-[clamp(1.25rem,4svh,2.5rem)]" style={order(2)}>
          <p className="label-hi">{hero.counterLabel}</p>
          <p
            data-needs-js=""
            className={`numeral mt-1 min-w-[8ch] text-[clamp(3.1rem,min(15.5vw,21svh),11.5rem)] font-bold leading-[1.02] transition-opacity duration-700 ease-soft ${hydrated ? "opacity-100" : "opacity-0"}`}
          >
            <CountUp
              value={hero.counterTo}
              from={hero.counterFrom}
              duration={2400}
              start={hydrated}
            />
          </p>
        </div>

        <div className="mt-[clamp(1.5rem,4svh,2.5rem)] flex flex-col gap-7 md:flex-row md:items-end md:justify-between md:gap-12">
          <p className="lede rise max-w-[34rem]" style={order(3)}>
            {hero.sub}
          </p>
          <div className="rise flex flex-wrap gap-3" style={order(4)}>
            <button type="button" className="btn btn-primary" onClick={requestReelPlayback}>
              <Play className="h-[1.05rem] w-[1.05rem] fill-current" aria-hidden="true" />
              {hero.primaryCta}
            </button>
            <a href="#scale" className="btn btn-ghost">
              {hero.secondaryCta}
              <ArrowDown className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="scroll-cue rise pointer-events-none absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-2"
        style={order(6)}
      >
        <span className="font-mono text-[0.6rem] font-medium tracking-[0.34em] text-dim">
          {hero.scrollCue}
        </span>
        <span className="scroll-cue-line" />
      </div>
    </section>
  );
}
