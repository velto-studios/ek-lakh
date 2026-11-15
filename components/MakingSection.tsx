import {
  ArrowUpRight,
  AudioLines,
  Calculator,
  CodeXml,
  Lightbulb,
  PanelsTopLeft,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { facts, making, site, sourcesBlock, type MakingIcon } from "@/lib/content";
import { pad2 } from "@/lib/format";

const icons: Record<MakingIcon, LucideIcon> = {
  idea: Lightbulb,
  facts: Calculator,
  code: CodeXml,
  audio: AudioLines,
  web: PanelsTopLeft,
};

export function MakingSection() {
  const { columns } = sourcesBlock;

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
          <h3
            id="sources-title"
            className="text-[clamp(1.5rem,1.2rem+1.4vw,2.25rem)] font-extrabold leading-[1.25]"
          >
            {sourcesBlock.heading}
          </h3>

          <div role="table" aria-label={sourcesBlock.tableLabel} className="mt-7">
            <div role="rowgroup" className="hidden md:block">
              <div
                role="row"
                className="grid grid-cols-[11rem_minmax(0,1fr)_minmax(0,1.35fr)] gap-x-8 border-b border-line pb-3 text-[0.9rem] font-medium text-dim"
              >
                <span role="columnheader">{columns.fact}</span>
                <span role="columnheader">{columns.figure}</span>
                <span role="columnheader">{columns.basis}</span>
              </div>
            </div>
            <div role="rowgroup">
              {facts.map((fact) => (
                <div
                  key={fact.key}
                  role="row"
                  className="grid gap-x-8 gap-y-1 border-b border-line/70 py-4 md:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1.35fr)] md:py-3.5"
                >
                  <span role="cell" className="text-[0.92rem] font-medium text-dim md:text-[1rem]">
                    {fact.label}
                  </span>
                  <span role="cell" className="text-[1.08rem] font-bold leading-snug text-white">
                    {fact.display}
                  </span>
                  <span role="cell" className="text-[0.98rem] leading-relaxed text-steel">
                    {fact.basis}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 max-w-[44rem] text-[1.02rem] leading-relaxed text-steel">
            {sourcesBlock.note}
          </p>

          <h4 className="mt-9 text-[0.92rem] font-medium text-dim">{sourcesBlock.listLabel}</h4>
          <ul className="mt-2 grid gap-x-10 md:grid-cols-2">
            {sourcesBlock.sources.map((source) => (
              <li key={source.href} className="border-b border-line/70">
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  lang="en"
                  className="group flex min-h-12 items-center justify-between gap-4 py-3 text-[0.98rem] leading-snug text-white transition-colors duration-200 hover:text-steel"
                >
                  <span className="min-w-0">
                    {source.label}
                    <span className="sr-only" lang="hi">
                      {" "}
                      ({site.newTab})
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-dim transition-transform duration-300 ease-soft group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
