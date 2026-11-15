import { Captions, Mic, Smartphone } from "lucide-react";

import { ReelPlayer } from "@/components/ReelPlayer";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { reel } from "@/lib/content";

const chipIcons = [Mic, Captions, Smartphone] as const;

export function ReelSection() {
  return (
    <section id="reel" aria-labelledby="reel-title" className="section hairline-top overflow-x-clip">
      <div className="shell grid gap-y-10 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-8">
        <SectionHeader
          id="reel-title"
          eyebrow={reel.eyebrow}
          quietMark
          className="lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:self-end"
          title={
            <>
              {reel.heading.before}
              <span className="numeral text-caption">{reel.heading.number}</span>
              {reel.heading.after}
            </>
          }
        />

        <Reveal className="min-w-0 lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center">
          <ReelPlayer />
        </Reveal>

        <Reveal
          delay={0.1}
          className="min-w-0 lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:self-start"
        >
          <p className="lede">{reel.paragraph}</p>
          <ul className="mt-7 flex flex-wrap gap-2.5">
            {reel.chips.map((chip, index) => {
              const Icon = chipIcons[index] ?? Smartphone;
              return (
                <li
                  key={chip}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-graphite/60 px-4 text-[0.95rem] font-medium text-white"
                >
                  <Icon className="h-4 w-4 text-steel" aria-hidden="true" />
                  {chip}
                </li>
              );
            })}
          </ul>
          <p className="mt-7 hidden max-w-[34rem] text-[0.9rem] leading-relaxed text-dim lg:block">
            {reel.keys}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
