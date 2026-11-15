import { Filmstrip } from "@/components/Filmstrip";
import { SectionHeader } from "@/components/SectionHeader";
import { story } from "@/lib/content";

export function StorySection() {
  return (
    <section id="story" aria-labelledby="story-title" className="section hairline-top">
      <div className="shell">
        <SectionHeader
          id="story-title"
          eyebrow={story.eyebrow}
          title={story.heading}
          className="max-w-3xl"
        />
      </div>
      <div className="mt-[clamp(2rem,5vw,3.5rem)]">
        <Filmstrip />
      </div>
    </section>
  );
}
