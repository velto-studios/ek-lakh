import { site } from "@/lib/content";

/** The Velto mark. Geometry and colours are fixed; never restyle it. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <polygon points="6,14 26,14 50,57.64 50,94" fill="#FFFFFF" />
      <polygon points="74,14 82,14 82,26 87.4,26 50,94 50,57.64" fill="#FFFFFF" />
      <rect x="85.5" y="10.5" width="12" height="12" fill="#C8102E" />
    </svg>
  );
}

export function Brand({ size = "md" }: { size?: "md" | "lg" }) {
  const large = size === "lg";
  return (
    <a
      href="#top"
      aria-label={site.homeLabel}
      className="inline-flex min-h-11 items-center gap-2.5 rounded-sm"
    >
      <LogoMark className={large ? "h-10 w-10" : "h-8 w-8"} />
      <span className="flex items-baseline gap-2" aria-hidden="true">
        <span
          className={`font-extrabold leading-none tracking-[0.06em] ${large ? "text-[1.5rem]" : "text-[1.2rem]"}`}
        >
          VELTO
        </span>
        <span
          className={`font-mono font-medium leading-none tracking-[0.34em] text-steel ${large ? "text-[0.7rem]" : "text-[0.6rem]"}`}
        >
          STUDIOS
        </span>
      </span>
    </a>
  );
}
