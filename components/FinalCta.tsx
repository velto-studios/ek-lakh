"use client";

import { Check, Play, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Reveal } from "@/components/Reveal";
import { closing, site } from "@/lib/content";
import { copyText, requestReelPlayback } from "@/lib/reel";

type ShareState = "idle" | "copied" | "failed";

/** A simple camera glyph for the Instagram link; not the trademarked logo. */
function CameraGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

export function FinalCta() {
  const [shareState, setShareState] = useState<ShareState>("idle");
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const share = async () => {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: site.metaTitle, text: closing.shareText, url });
        return;
      } catch (error) {
        // Closing the share sheet is not a failure; anything else falls back to copying.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    const copied = await copyText(url);
    setShareState(copied ? "copied" : "failed");
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setShareState("idle"), 3200);
  };

  return (
    <section
      id="share"
      aria-labelledby="share-title"
      className="section hairline-top relative isolate overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="motif motif-a" />
        <div className="motif motif-b" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_50%,rgba(11,11,13,0.9),rgba(11,11,13,0.35)_70%,rgba(11,11,13,0.75))]" />
      </div>

      <div className="shell flex flex-col items-center text-center">
        <Reveal>
          <p className="eyebrow justify-center">
            <span className="eyebrow-mark eyebrow-mark-quiet" aria-hidden="true" />
            {closing.eyebrow}
          </p>
          <h2
            id="share-title"
            className="mt-7 text-[clamp(2.3rem,1.2rem+5.2vw,5.5rem)] font-extrabold leading-[1.2] tracking-[-0.01em]"
          >
            <span className="block text-steel">{closing.lines[0]}</span>{" "}
            <span className="block">{closing.lines[1]}</span>
          </h2>
        </Reveal>

        <Reveal delay={0.12} className="mt-[clamp(2.25rem,5vw,3.5rem)] w-full">
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button type="button" className="btn btn-primary" onClick={requestReelPlayback}>
              <Play className="h-[1.05rem] w-[1.05rem] fill-current" aria-hidden="true" />
              {closing.watch}
            </button>
            <button type="button" className="btn btn-ghost" onClick={share}>
              {shareState === "copied" ? (
                <Check className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
              ) : (
                <Share2 className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
              )}
              {closing.share}
            </button>
            <a
              href={site.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              <CameraGlyph className="h-[1.1rem] w-[1.1rem]" />
              {closing.follow}
              <span className="sr-only"> ({site.newTab})</span>
            </a>
          </div>
          <p role="status" className="mt-4 min-h-[1.75rem] text-[0.98rem] text-steel">
            {shareState === "copied" ? closing.copied : null}
            {shareState === "failed" ? closing.copyFailed : null}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
