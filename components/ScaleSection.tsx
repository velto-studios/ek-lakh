import { FactCards } from "@/components/FactCards";
import { Reveal } from "@/components/Reveal";
import { ScaleExplorer } from "@/components/ScaleExplorer";
import { SectionHeader } from "@/components/SectionHeader";
import { field } from "@/lib/content";

export function ScaleSection() {
  return (
    <section id="scale" aria-labelledby="scale-title" className="section hairline-top">
      <div className="shell">
        <SectionHeader
          id="scale-title"
          eyebrow={field.eyebrow}
          title={field.heading}
          lede={field.lede}
          className="max-w-3xl"
          quietMark
        />

        <Reveal className="mt-[clamp(2.5rem,6vw,4.5rem)]">
          <ScaleExplorer />
        </Reveal>

        <Reveal className="mt-[clamp(4rem,9vw,7rem)]">
          <p className="eyebrow">
            <span className="eyebrow-mark eyebrow-mark-quiet" aria-hidden="true" />
            {field.statsEyebrow}
          </p>
          <h3 className="mt-4 text-[clamp(1.6rem,1.2rem+1.8vw,2.6rem)] font-extrabold leading-[1.25]">
            {field.statsHeading}
          </h3>
        </Reveal>

        <div className="mt-[clamp(2rem,4vw,3rem)]">
          <FactCards />
        </div>
      </div>
    </section>
  );
}
