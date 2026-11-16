import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MakingSection } from "@/components/MakingSection";
import { Providers } from "@/components/Providers";
import { ReelSection } from "@/components/ReelSection";
import { ScaleSection } from "@/components/ScaleSection";
import { StorySection } from "@/components/StorySection";
import { TeamSection } from "@/components/TeamSection";
import { TopBar } from "@/components/TopBar";
import { site } from "@/lib/content";

export default function Page() {
  return (
    <Providers>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-bold focus:text-charcoal"
      >
        {site.skipLink}
      </a>
      <TopBar />
      <main id="main">
        <Hero />
        <ReelSection />
        <TeamSection />
        <ScaleSection />
        <StorySection />
        <MakingSection />
        <FinalCta />
      </main>
      <Footer />
    </Providers>
  );
}
