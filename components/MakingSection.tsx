import {
  AudioLines,
  CodeXml,
  Drama,
  Lightbulb,
  PanelsTopLeft,
  type LucideIcon,
} from "lucide-react";

import { CatGangPortrait, HenPortrait, PeeluPortrait } from "@/components/Characters";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { cast, making, type CastKey, type MakingIcon } from "@/lib/content";
import { pad2 } from "@/lib/format";

const icons: Record<MakingIcon, LucideIcon> = {
  idea: Lightbulb,
  cast: Drama,
  code: CodeXml,
  audio: AudioLines,
  web: PanelsTopLeft,
};

const portraits: Record<CastKey, () => React.JSX.Element> = {
  peelu: PeeluPortrait,
  cats: CatGangPortrait,
  hen: HenPortrait,
};

export function MakingSection() {
  return (
    <section id="making" aria-labelledby="making-title" className="section hairline-top">
      <div className="shell">
        <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-4">
            <SectionHeader
              id="making-title"
              eyebrow={making.eyebrow}
              title={making.heading}
              className="lg:sticky lg:top-[calc(var(--bar-h)+2.5rem)]"
            />
          </div>

          <ol className="lg:col-span-8">
            {making.steps.map((step, index) => {
              const Icon = icons[step.icon];
              return (
                <li key={step.title} className="border-t border-line first:border-t-0">
                  <Reveal
                    delay={0.04 * index}
                    className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 py-7 sm:gap-x-8 sm:py-9"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <span className="numeral text-[0.8rem] font-medium tracking-[0.1em] text-dim">
                        {pad2(index + 1)}
                      </span>
                      <span className="grid h-12 w-12 place-items-center rounded-full border border-line bg-graphite text-white">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[clamp(1.3rem,1.1rem+0.8vw,1.75rem)] font-extrabold leading-snug">
                        {step.title}
                      </h3>
                      <p className="mt-2.5 max-w-[40rem] text-[1.06rem] leading-[1.8] text-steel">
                        {step.body}
                      </p>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>

        <Reveal className="panel mt-[clamp(3.5rem,8vw,6rem)] p-5 sm:p-8 lg:p-10">
          <p className="eyebrow">
            <span className="eyebrow-mark eyebrow-mark-quiet" aria-hidden="true" />
            {cast.eyebrow}
          </p>
          <h3
            id="cast-title"
            className="mt-4 text-[clamp(1.5rem,1.2rem+1.4vw,2.25rem)] font-extrabold leading-[1.25]"
          >
            {cast.heading}
          </h3>

          <ul
            aria-labelledby="cast-title"
            className="mt-7 grid gap-x-8 gap-y-7 md:grid-cols-3 lg:gap-x-10"
          >
            {cast.members.map((member) => {
              const Portrait = portraits[member.key];
              return (
                <li
                  key={member.key}
                  className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 border-t border-line pt-7 first:border-t-0 first:pt-0 md:grid-cols-1 md:items-start md:border-t-0 md:pt-0"
                >
                  <div className="h-24 w-24 rounded-[1.25rem] border border-line bg-charcoal p-2.5 sm:h-28 sm:w-28">
                    <Portrait />
                  </div>
                  <div className="min-w-0 md:mt-5">
                    <h4 className="text-[1.3rem] font-extrabold leading-snug">{member.name}</h4>
                    <p className="mt-1.5 text-[1.02rem] leading-[1.75] text-steel">{member.line}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
