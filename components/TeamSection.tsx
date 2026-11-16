"use client";

import { ArrowUpRight, Check, Plus } from "lucide-react";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { Chick, ChickDefs } from "@/components/Characters";
import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { chickWord, monthsHi, site, team, words } from "@/lib/content";
import { formatDateHi, formatIN } from "@/lib/format";
import { REEL_URL, REEL_VIEWS, UPDATED_ON } from "@/lib/team";

const STORAGE_KEY = "velto:team-peelu";
const JOINED = "1";

/** The hand-entered view count, made safe to count with. */
const VIEWS = Number.isFinite(REEL_VIEWS) ? Math.max(0, Math.floor(REEL_VIEWS)) : 0;
const REEL_LINK = REEL_URL.trim();
const UPDATED = formatDateHi(UPDATED_ON, monthsHi);

function readJoined(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === JOINED;
  } catch {
    return false;
  }
}

function writeJoined(joined: boolean): void {
  try {
    if (joined) window.localStorage.setItem(STORAGE_KEY, JOINED);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked (private mode, strict settings); the chick still joins for this visit.
  }
}

/** Bigger digits for a small team, smaller ones once the count runs long. */
function countSize(text: string): string {
  if (text.length <= 5) return "text-[clamp(3.2rem,2rem+5.5vw,5.75rem)]";
  if (text.length <= 8) return "text-[clamp(2.6rem,1.6rem+4vw,4.25rem)]";
  return "text-[clamp(2rem,1.4rem+2.6vw,3rem)]";
}

export function TeamSection() {
  const countRef = useRef<HTMLParagraphElement>(null);
  const inView = useInView(countRef, { once: true, amount: 0.5 });
  const [joined, setJoined] = useState(false);
  /** True only when the visitor has just pressed the button, so a restored chick does not hop. */
  const [hop, setHop] = useState(false);

  // The saved chick is read after hydration, so server and client markup always match.
  useEffect(() => {
    setJoined(readJoined());
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === STORAGE_KEY) setJoined(readJoined());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const join = () => {
    if (joined) return;
    writeJoined(true);
    setHop(true);
    setJoined(true);
  };

  const leave = () => {
    writeJoined(false);
    setHop(false);
    setJoined(false);
  };

  // Peelu himself, one chick per view, and the visitor's own chick.
  const total = 1 + VIEWS + (joined ? 1 : 0);
  const totalText = formatIN(total);
  const countText = `${team.countPrefix} ${totalText} ${chickWord(total)}`;

  // Peelu and the visitor's place are always drawn; teammates fill what is left of the limit.
  const mates = Math.min(VIEWS, team.maxIcons - 1 - (joined ? 1 : 0));
  const beyond = total - (1 + mates + (joined ? 1 : 0));
  const places = Math.min(team.maxIcons, VIEWS + 2);
  const flockSize = places <= 26 ? "lg" : places <= 110 ? "md" : "sm";
  const alone = total === 1;

  return (
    <section id="team" aria-labelledby="team-title" className="section hairline-top">
      <ChickDefs />
      <div className="shell grid gap-y-10 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-9">
        <div className="min-w-0 lg:col-span-5 lg:col-start-1 lg:row-start-1">
          <SectionHeader
            id="team-title"
            eyebrow={team.eyebrow}
            title={team.heading}
            lede={team.lede}
            quietMark
          />
          <Reveal delay={0.08}>
            <p
              ref={countRef}
              aria-live="polite"
              className="mt-9 flex flex-wrap items-baseline gap-x-3.5 gap-y-1"
            >
              <span className="text-[clamp(1.2rem,1.05rem+0.7vw,1.6rem)] font-bold text-steel">
                {team.countPrefix}
              </span>
              <span className={`numeral font-bold leading-[1.05] text-butter ${countSize(totalText)}`}>
                <CountUp value={total} start={inView} duration={1400} />
              </span>
              <span className="text-[clamp(1.2rem,1.05rem+0.7vw,1.6rem)] font-bold">
                {chickWord(total)}
              </span>
            </p>
          </Reveal>
        </div>

        <Reveal
          delay={0.1}
          className="min-w-0 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:self-center"
        >
          <div className="panel p-5 sm:p-7">
            <div
              role="img"
              aria-label={countText}
              data-size={flockSize}
              className="flock min-h-[9rem] border-b border-dashed border-line pb-3"
            >
              <span className="flock-tag border-butter/45 text-butter">
                <Chick className="flock-chick flock-peelu" />
                {words.peelu}
              </span>
              {Array.from({ length: mates }, (_, index) => (
                <Chick key={index} className="flock-chick" />
              ))}
              {/* The visitor's place is always laid out, so joining never moves the page. */}
              <span
                className={`flock-tag border-line text-white ${joined ? "" : "invisible"} ${joined && hop ? "hop-in" : ""}`}
              >
                <Chick className="flock-chick" />
                <span className="numeral text-[0.8rem] font-bold tracking-normal">{team.youTag}</span>
              </span>
            </div>
            <p className="mt-3 min-h-[1.75rem] text-[0.98rem] leading-[1.75rem] text-steel">
              {beyond > 0
                ? `${team.more} ${formatIN(beyond)} ${chickWord(beyond)}`
                : alone
                  ? team.alone
                  : null}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.14} className="min-w-0 lg:col-span-5 lg:col-start-1 lg:row-start-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button type="button" className="btn btn-primary" aria-pressed={joined} onClick={join}>
              {joined ? (
                <Check className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
              ) : (
                <Plus className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
              )}
              {team.join}
            </button>
            {REEL_LINK ? (
              <a href={REEL_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                {team.reelLink}
                <ArrowUpRight className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
                <span className="sr-only"> ({site.newTab})</span>
              </a>
            ) : null}
          </div>
          <div className="mt-2 flex min-h-11 flex-wrap items-center gap-x-4">
            <p role="status" className="text-[0.98rem] text-steel">
              {joined ? team.joined : null}
            </p>
            <button
              type="button"
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-full text-[0.95rem] font-medium text-dim underline decoration-line underline-offset-4 transition-colors duration-200 hover:text-white ${joined ? "" : "invisible"}`}
              onClick={leave}
            >
              {team.leave}
            </button>
          </div>
          <p className="mt-4 max-w-[34rem] text-[0.88rem] leading-relaxed text-dim">
            {team.note.before}
            <time dateTime={UPDATED_ON}>{UPDATED}</time>
            {team.note.after}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
