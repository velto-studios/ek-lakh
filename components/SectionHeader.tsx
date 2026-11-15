import type { ReactNode } from "react";

import { Reveal } from "@/components/Reveal";

interface SectionHeaderProps {
  id: string;
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  className?: string;
  /** Use the neutral mark when the view already has a crimson accent. */
  quietMark?: boolean;
}

export function SectionHeader({
  id,
  eyebrow,
  title,
  lede,
  className,
  quietMark = false,
}: SectionHeaderProps) {
  return (
    <Reveal className={className}>
      <p className="eyebrow">
        <span
          className={quietMark ? "eyebrow-mark eyebrow-mark-quiet" : "eyebrow-mark"}
          aria-hidden="true"
        />
        {eyebrow}
      </p>
      <h2 id={id} className="section-title mt-5">
        {title}
      </h2>
      {lede ? <p className="lede mt-5">{lede}</p> : null}
    </Reveal>
  );
}
