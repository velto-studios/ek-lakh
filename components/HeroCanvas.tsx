"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { mulberry32 } from "@/lib/scale";

const TAU = Math.PI * 2;
const MAX_DPR = 1.5;
/** Roughly how many cats watch from the dark, whatever the screen size. */
const TARGET_PAIRS = 720;
const MIN_CELL = 50;
/** Rows further back are drawn smaller: the scale runs from this at the top to 1 at the bottom. */
const FAR_SCALE = 0.45;
/** Pairs per unit of area work out to this many times 1 / cell², given the scale above. */
const PACKING = 2.78;
const BLINK_S = 0.26;
/** The share of its nap cycle a cat spends with its eyes open. */
const AWAKE = 0.8;
const NAP_EDGE = 0.012;
const STILL_FRAME_S = 4;
const LEVELS = 6;
/** Two eye colours, both a warm green-yellow. */
const EYE_RGB = ["204, 232, 104", "234, 224, 98"] as const;
const PUPIL = "rgba(11, 11, 13, 0.82)";
const BUTTER = "#FFD23F";
const BEAK = "#F08C1A";
const INK = "#0B0B0D";
/** How far the red dot's pull reaches, in CSS pixels. */
const DOT_REACH = 260;
const CHICK_CLEARING = 58;
const CHICK_RADIUS = 6.5;

/**
 * A light 2D canvas: cats' eyes in the dark, blinking at random, all watching
 * one small yellow chick. On a desktop pointer the red dot follows the cursor,
 * and the eyes near it turn towards it and brighten. The loop stops whenever
 * the hero is off screen, the tab is hidden or the visitor prefers reduced
 * motion (then one still frame is drawn and there is no red dot).
 */
export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const dot = dotRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 1;
    let height = 1;
    let dpr = 1;
    let count = 0;
    let chickX = 0;
    let chickY = 0;
    let glow: CanvasGradient | null = null;

    // Fixed per pair, in CSS pixels.
    let homeX = new Float32Array(0);
    let homeY = new Float32Array(0);
    let radius = new Float32Array(0);
    let gap = new Float32Array(0);
    let tiltCos = new Float32Array(0);
    let tiltSin = new Float32Array(0);
    let tilt = new Float32Array(0);
    let gain = new Float32Array(0);
    let blinkPeriod = new Float32Array(0);
    let blinkPhase = new Float32Array(0);
    let napPeriod = new Float32Array(0);
    let napPhase = new Float32Array(0);
    let hue = new Uint8Array(0);
    // Recomputed every frame, in device pixels.
    let centreX = new Float32Array(0);
    let centreY = new Float32Array(0);
    let halfGap = new Float32Array(0);
    let lookX = new Float32Array(0);
    let lookY = new Float32Array(0);
    let open = new Float32Array(0);
    let level = new Uint8Array(0);

    let frame = 0;
    let running = false;
    let onScreen = true;
    let lastNow = 0;
    const epoch = performance.now();
    const pointer = { clientX: 0, clientY: 0, seen: false };
    const follower = { x: 0, y: 0, presence: 0, shown: 0 };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      // The chick stands near the middle, nudged clear of the headline and the counter.
      const wide = width >= 900;
      chickX = width * (wide ? 0.66 : 0.5);
      chickY = height * (wide ? 0.4 : 0.29);
      glow = context.createRadialGradient(
        chickX * dpr,
        chickY * dpr,
        0,
        chickX * dpr,
        chickY * dpr,
        CHICK_CLEARING * dpr,
      );
      glow.addColorStop(0, "rgba(255, 210, 63, 0.26)");
      glow.addColorStop(1, "rgba(255, 210, 63, 0)");

      const cell = Math.max(MIN_CELL, Math.sqrt((PACKING * width * height) / TARGET_PAIRS));
      const random = mulberry32(1_00_000);
      const pairs: number[] = [];
      let y = -cell * 0.2;
      while (y < height + cell * 0.4) {
        const depth = Math.min(1, Math.max(0, y / height));
        const scale = FAR_SCALE + (1 - FAR_SCALE) * depth;
        const step = cell * scale;
        for (let x = -step * random(); x < width + step * 0.5; x += step) {
          const px = x + (random() - 0.5) * step * 0.7;
          const py = y + (random() - 0.5) * step * 0.6;
          const size = (2 + random() * 1.6) * scale;
          const spread = size * (3 + random() * 0.9);
          const lean = (random() - 0.5) * 0.34;
          const strength = (0.3 + 0.4 * scale) * (0.6 + 0.4 * random());
          const blinkEvery = 2.6 + random() * 6.5;
          const blinkAt = random() * blinkEvery;
          const napEvery = 9 + random() * 16;
          const napAt = random() * napEvery;
          const colour = random() < 0.3 ? 1 : 0;
          const missing = random() < 0.12;
          if (missing || Math.hypot(px - chickX, py - chickY) < CHICK_CLEARING) continue;
          pairs.push(px, py, size, spread, lean, strength, blinkEvery, blinkAt, napEvery, napAt, colour);
        }
        y += step * 0.8;
      }

      const FIELDS = 11;
      count = pairs.length / FIELDS;
      homeX = new Float32Array(count);
      homeY = new Float32Array(count);
      radius = new Float32Array(count);
      gap = new Float32Array(count);
      tilt = new Float32Array(count);
      tiltCos = new Float32Array(count);
      tiltSin = new Float32Array(count);
      gain = new Float32Array(count);
      blinkPeriod = new Float32Array(count);
      blinkPhase = new Float32Array(count);
      napPeriod = new Float32Array(count);
      napPhase = new Float32Array(count);
      hue = new Uint8Array(count);
      for (let i = 0; i < count; i += 1) {
        const at = i * FIELDS;
        homeX[i] = pairs[at];
        homeY[i] = pairs[at + 1];
        radius[i] = pairs[at + 2];
        gap[i] = pairs[at + 3];
        tilt[i] = pairs[at + 4];
        tiltCos[i] = Math.cos(pairs[at + 4]);
        tiltSin[i] = Math.sin(pairs[at + 4]);
        gain[i] = pairs[at + 5];
        blinkPeriod[i] = pairs[at + 6];
        blinkPhase[i] = pairs[at + 7];
        napPeriod[i] = pairs[at + 8];
        napPhase[i] = pairs[at + 9];
        hue[i] = pairs[at + 10];
      }
      centreX = new Float32Array(count);
      centreY = new Float32Array(count);
      halfGap = new Float32Array(count);
      lookX = new Float32Array(count);
      lookY = new Float32Array(count);
      open = new Float32Array(count);
      level = new Uint8Array(count);
    };

    /** Adds both eyes of every pair at one brightness level and colour to the current path. */
    const traceEyes = (wantedLevel: number, wantedHue: number, grow: number) => {
      for (let i = 0; i < count; i += 1) {
        if (level[i] !== wantedLevel || hue[i] !== wantedHue) continue;
        const rx = radius[i] * dpr * grow;
        const ry = Math.max(rx * 0.86 * open[i], 0.35 * dpr);
        const offsetX = tiltCos[i] * halfGap[i];
        const offsetY = tiltSin[i] * halfGap[i];
        for (let side = -1; side <= 1; side += 2) {
          const x = centreX[i] + offsetX * side;
          const y = centreY[i] + offsetY * side;
          if (rx < 1.2) {
            context.rect(x - rx, y - ry, rx * 2, ry * 2);
          } else {
            context.moveTo(x + rx * tiltCos[i], y + rx * tiltSin[i]);
            context.ellipse(x, y, rx, ry, tilt[i], 0, TAU);
          }
        }
      }
    };

    const draw = (time: number, dt: number) => {
      // The red dot eases after the pointer and fades out when the pointer leaves the hero.
      let wanted = 0;
      if (pointer.seen) {
        const rect = canvas.getBoundingClientRect();
        const targetX = pointer.clientX - rect.left;
        const targetY = pointer.clientY - rect.top;
        if (targetX >= 0 && targetX <= rect.width && targetY >= 0 && targetY <= rect.height) {
          wanted = 1;
          if (follower.presence < 0.02) {
            follower.x = targetX;
            follower.y = targetY;
          }
          const ease = 1 - Math.exp(-dt * 12);
          follower.x += (targetX - follower.x) * ease;
          follower.y += (targetY - follower.y) * ease;
        }
      }
      follower.presence += (wanted - follower.presence) * (1 - Math.exp(-dt * 7));
      if (follower.presence < 0.004) follower.presence = 0;
      if (dot && (follower.presence > 0 || follower.shown > 0)) {
        dot.style.transform = `translate3d(${follower.x.toFixed(1)}px, ${follower.y.toFixed(1)}px, 0)`;
        if (Math.abs(follower.presence - follower.shown) > 0.01 || follower.presence === 0) {
          follower.shown = follower.presence;
          dot.style.opacity = follower.presence.toFixed(2);
        }
      }

      for (let i = 0; i < count; i += 1) {
        // A quick blink now and then, and a longer nap once in a while.
        const blink = (time + blinkPhase[i]) % blinkPeriod[i];
        let lids = blink < BLINK_S ? Math.abs(1 - (2 * blink) / BLINK_S) : 1;
        const nap = ((time + napPhase[i]) % napPeriod[i]) / napPeriod[i];
        if (nap > AWAKE) lids *= 1 - Math.min(1, (nap - AWAKE) / NAP_EDGE, (1 - nap) / NAP_EDGE);
        open[i] = lids;

        // Every cat watches the chick, unless the red dot is close enough to steal its gaze.
        let lx = chickX - homeX[i];
        let ly = chickY - homeY[i];
        let length = Math.hypot(lx, ly) || 1;
        lx /= length;
        ly /= length;
        let pull = 0;
        if (follower.presence > 0) {
          const dx = follower.x - homeX[i];
          const dy = follower.y - homeY[i];
          const distance = Math.hypot(dx, dy);
          if (distance < DOT_REACH) {
            const near = 1 - distance / DOT_REACH;
            pull = near * near * (3 - 2 * near) * follower.presence;
            const turn = Math.min(1, pull * 2.6);
            const inverse = 1 / (distance || 1);
            lx += (dx * inverse - lx) * turn;
            ly += (dy * inverse - ly) * turn;
            length = Math.hypot(lx, ly) || 1;
            lx /= length;
            ly /= length;
          }
        }
        lookX[i] = lx;
        lookY[i] = ly;

        // Turning the head shifts the pair towards what it watches and narrows it a little.
        const lean = 0.35 + 0.65 * pull;
        centreX[i] = (homeX[i] + lx * radius[i] * 0.9 * lean) * dpr;
        centreY[i] = (homeY[i] + ly * radius[i] * 0.6 * lean) * dpr;
        halfGap[i] = gap[i] * 0.5 * (1 - 0.16 * Math.abs(lx) * lean) * dpr;

        const alpha = Math.min(1, gain[i] * (1 + 1.3 * pull) + 0.22 * pull);
        level[i] = lids < 0.06 ? 255 : Math.min(LEVELS - 1, Math.floor(alpha * LEVELS));
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      for (let colour = 0; colour < EYE_RGB.length; colour += 1) {
        for (let step = 0; step < LEVELS; step += 1) {
          const alpha = (step + 1) / LEVELS;
          // A wide faint halo under a bright core reads as a glow, without any blur.
          context.fillStyle = `rgba(${EYE_RGB[colour]}, ${(alpha * 0.17).toFixed(3)})`;
          context.beginPath();
          traceEyes(step, colour, 2.3);
          context.fill();
          context.fillStyle = `rgba(${EYE_RGB[colour]}, ${alpha.toFixed(3)})`;
          context.beginPath();
          traceEyes(step, colour, 1);
          context.fill();
        }
      }

      // Slit pupils, on the eyes large enough to show them.
      context.fillStyle = PUPIL;
      context.beginPath();
      for (let i = 0; i < count; i += 1) {
        const r = radius[i] * dpr;
        if (level[i] === 255 || r < 2 || open[i] < 0.3) continue;
        const offsetX = tiltCos[i] * halfGap[i];
        const offsetY = tiltSin[i] * halfGap[i];
        const rx = r * 0.24;
        const ry = r * 0.66 * open[i];
        for (let side = -1; side <= 1; side += 2) {
          const x = centreX[i] + offsetX * side + lookX[i] * r * 0.4;
          const y = centreY[i] + offsetY * side + lookY[i] * r * 0.3;
          context.moveTo(x + rx * tiltCos[i], y + rx * tiltSin[i]);
          context.ellipse(x, y, rx, ry, tilt[i], 0, TAU);
        }
      }
      context.fill();

      // Peelu: one small yellow chick, hopping on the spot.
      if (glow) {
        context.fillStyle = glow;
        context.fillRect(
          (chickX - CHICK_CLEARING) * dpr,
          (chickY - CHICK_CLEARING) * dpr,
          CHICK_CLEARING * 2 * dpr,
          CHICK_CLEARING * 2 * dpr,
        );
      }
      const hop = Math.abs(Math.sin(time * 2.4)) * 2.4;
      const cx = chickX * dpr;
      const cy = (chickY - hop) * dpr;
      const r = CHICK_RADIUS * dpr;
      context.fillStyle = BEAK;
      context.beginPath();
      context.moveTo(cx + r * 0.82, cy - r * 0.42);
      context.lineTo(cx + r * 1.62, cy);
      context.lineTo(cx + r * 0.82, cy + r * 0.42);
      context.closePath();
      context.fill();
      context.fillStyle = BUTTER;
      context.beginPath();
      context.arc(cx, cy, r, 0, TAU);
      context.fill();
      context.fillStyle = INK;
      context.beginPath();
      context.arc(cx + r * 0.42, cy - r * 0.3, r * 0.17, 0, TAU);
      context.fill();
    };

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, Math.max(0, (now - lastNow) / 1000));
      lastNow = now;
      draw((now - epoch) / 1000, dt);
      frame = requestAnimationFrame(loop);
    };

    const sync = () => {
      const shouldRun = onScreen && !reduced && document.visibilityState === "visible";
      if (shouldRun && !running) {
        running = true;
        lastNow = performance.now();
        frame = requestAnimationFrame(loop);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(frame);
        follower.presence = 0;
        follower.shown = 0;
        if (dot) dot.style.opacity = "0";
      }
    };

    // Resizing clears the bitmap, so repaint in the same frame to avoid a flash.
    const paint = () =>
      draw(running ? (performance.now() - epoch) / 1000 : STILL_FRAME_S, 0);
    const resizeObserver = new ResizeObserver(() => {
      build();
      paint();
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      onScreen = entry.isIntersecting;
      sync();
    });
    intersectionObserver.observe(canvas);

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
      pointer.seen = true;
    };
    const onPointerGone = () => {
      pointer.seen = false;
    };
    const root = document.documentElement;
    if (finePointer && !reduced) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      root.addEventListener("pointerleave", onPointerGone);
      window.addEventListener("blur", onPointerGone);
    }
    document.addEventListener("visibilitychange", sync);

    build();
    paint();
    sync();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerGone);
      window.removeEventListener("blur", onPointerGone);
      document.removeEventListener("visibilitychange", sync);
      if (dot) dot.style.opacity = "0";
    };
  }, [reduced]);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      <span ref={dotRef} aria-hidden="true" className="hero-dot" />
    </>
  );
}
