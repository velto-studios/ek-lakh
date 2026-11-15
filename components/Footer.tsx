import { Brand } from "@/components/Logo";
import { nav, navCopy, site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="hairline-top pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] pt-12">
      <div className="shell grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div>
          <Brand size="lg" />
          <p lang="en" className="mt-4 max-w-[22rem] text-[1.02rem] text-steel">
            {site.tagline}
          </p>
        </div>

        <nav aria-label={navCopy.footerLabel}>
          <ul className="flex flex-wrap gap-x-2 gap-y-1 md:justify-end">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-full pr-5 text-[1.02rem] font-medium text-steel transition-colors duration-200 hover:text-white md:pl-5 md:pr-0"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="shell mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
        <p lang="en" className="font-mono text-[0.78rem] font-medium tracking-[0.06em] text-dim">
          {site.copyright}
        </p>
        <a
          href={site.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center font-mono text-[0.85rem] font-medium text-white transition-colors duration-200 hover:text-steel"
        >
          {site.instagram.handle}
          <span className="sr-only"> ({site.newTab})</span>
        </a>
      </div>
    </footer>
  );
}
