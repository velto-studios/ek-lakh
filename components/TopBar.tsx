"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";

import { Brand } from "@/components/Logo";
import { nav, navCopy } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/hooks";

export function TopBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollY, scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.35 });
  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 12));

  // The mobile menu closes on Escape and on any press outside the bar.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top,0px)] transition-[background-color,border-color,backdrop-filter] duration-500 ease-soft ${
        solid
          ? "border-line/70 bg-charcoal/80 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <m.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-crimson"
        style={{ scaleX: reduced ? scrollYProgress : smoothProgress }}
      />

      <div className="shell flex h-[var(--bar-h)] items-center justify-between gap-6">
        <Brand />

        <nav aria-label={navCopy.label} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-full px-4 text-[1.02rem] font-medium text-steel transition-colors duration-200 hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="icon-btn -mr-2 md:hidden"
          aria-expanded={open}
          aria-controls={open ? "mobile-menu" : undefined}
          aria-label={open ? navCopy.close : navCopy.open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <m.nav
            id="mobile-menu"
            aria-label={navCopy.label}
            className="border-t border-line/70 md:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <ul className="shell flex flex-col py-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex min-h-12 items-center text-[1.2rem] font-bold"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </m.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
