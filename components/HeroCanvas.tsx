"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { mulberry32 } from "@/lib/scale";

const TAU = Math.PI * 2;
/** Camera pitch below the horizon, in radians (about 38 degrees). */
const PITCH = 0.66;
/** Focal length as a multiple of the canvas height. */
const FOCAL = 1.1;
const BASE_SPACING = 0.045;
const DOT_RADIUS = 0.0046;
const MAX_DOTS = 7000;
const MAX_DPR = 1.5;
const STILL_FRAME_MS = 4000;
const ALPHAS = [0.12, 0.23, 0.38, 0.57, 0.82];
const FILLS = ALPHAS.map((alpha) => `rgba(255, 236, 212, ${alpha})`);

/**
 * A light 2D canvas: a crowd seen from above at night, in perspective.
 * A few thousand dots drift very slightly while a soft wave of brightness
 * rolls through them. The loop stops whenever the hero is off screen, the tab
 * is hidden or the visitor prefers reduced motion (then one still frame is drawn).
 */
export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 1;
    let height = 1;
    let dpr = 1;
    let count = 0;
    let depthNear = 1;
    let depthFar = 2;
    let xs = new Float32Array(0);
    let zs = new Float32Array(0);
    let phases = new Float32Array(0);
    let gains = new Float32Array(0);
    let screenX = new Float32Array(0);
    let screenY = new Float32Array(0);
    let radii = new Float32Array(0);
    let buckets = new Uint8Array(0);

    let frame = 0;
    let running = false;
    let onScreen = true;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const epoch = performance.now();

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      const sin = Math.sin(PITCH);
      const cos = Math.cos(PITCH);
      const focal = FOCAL * height;
      const halfV = height / 2 / focal;
      const halfH = width / 2 / focal;
      // Ground distances (camera height = 1) seen at the bottom and top edges.
      const zNear = (cos - halfV * sin) / (sin + halfV * cos);
      const zFar = (cos + halfV * sin) / Math.max(0.05, sin - halfV * cos);
      depthNear = sin + zNear * cos;
      depthFar = sin + zFar * cos;

      const area = (halfH * depthNear + halfH * depthFar) * (zFar - zNear);
      const spacing = Math.max(BASE_SPACING, Math.sqrt(area / MAX_DOTS));
      const margin = spacing * 6;
      const halfWidthFar = halfH * depthFar + margin;
      const cols = Math.ceil((halfWidthFar * 2) / spacing);
      const rows = Math.ceil((zFar - zNear + margin * 2) / spacing);

      const random = mulberry32(1_00_000);
      const px: number[] = [];
      const pz: number[] = [];
      const pp: number[] = [];
      const pg: number[] = [];
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = -halfWidthFar + (col + 0.5 + (random() - 0.5) * 0.72) * spacing;
          const z = zNear - margin + (row + 0.5 + (random() - 0.5) * 0.72) * spacing;
          const phase = random() * TAU;
          const gain = 0.5 + random() * 0.5;
          const depth = sin + z * cos;
          if (depth < 0.2 || Math.abs(x) > halfH * depth + margin) continue;
          px.push(x);
          pz.push(z);
          pp.push(phase);
          pg.push(gain);
        }
      }

      count = px.length;
      xs = Float32Array.from(px);
      zs = Float32Array.from(pz);
      phases = Float32Array.from(pp);
      gains = Float32Array.from(pg);
      screenX = new Float32Array(count);
      screenY = new Float32Array(count);
      radii = new Float32Array(count);
      buckets = new Uint8Array(count);
    };

    const draw = (now: number) => {
      const time = (now - epoch) / 1000;
      pointer.x += (pointer.targetX - pointer.x) * 0.05;
      pointer.y += (pointer.targetY - pointer.y) * 0.05;

      const angle = PITCH + pointer.y * 0.014;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      const focal = FOCAL * height * dpr;
      const centreX = canvas.width / 2;
      const centreY = canvas.height / 2;
      const cameraX = pointer.x * 0.035;
      const depthRange = Math.max(0.001, depthFar - depthNear);
      const levels = ALPHAS.length;

      for (let i = 0; i < count; i += 1) {
        const wobble = phases[i] + time * 0.5;
        const x = xs[i] + Math.sin(wobble) * 0.004 - cameraX;
        const z = zs[i] + Math.cos(wobble * 0.83) * 0.004;
        const depth = sin + z * cos;
        const lift = z * sin - cos;
        screenX[i] = centreX + (focal * x) / depth;
        screenY[i] = centreY - (focal * lift) / depth;
        radii[i] = Math.max(0.55 * dpr, (DOT_RADIUS * focal) / depth);

        const wave = 0.5 + 0.5 * Math.sin(xs[i] * 1.7 + zs[i] * 2.4 - time * 0.85);
        const haze = 1.1 - ((depth - depthNear) / depthRange) * 0.7;
        const alpha = gains[i] * (0.22 + 0.78 * wave * wave) * Math.min(1, Math.max(0.3, haze));
        buckets[i] = Math.min(levels - 1, Math.floor(alpha * levels));
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      for (let level = 0; level < levels; level += 1) {
        context.fillStyle = FILLS[level];
        context.beginPath();
        for (let i = 0; i < count; i += 1) {
          if (buckets[i] !== level) continue;
          const radius = radii[i];
          if (radius < 1) {
            context.rect(screenX[i] - radius, screenY[i] - radius, radius * 2, radius * 2);
          } else {
            context.moveTo(screenX[i] + radius, screenY[i]);
            context.arc(screenX[i], screenY[i], radius, 0, TAU);
          }
        }
        context.fill();
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      draw(now);
      frame = requestAnimationFrame(loop);
    };

    const sync = () => {
      const shouldRun = onScreen && !reduced && document.visibilityState === "visible";
      if (shouldRun && !running) {
        running = true;
        frame = requestAnimationFrame(loop);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
    };

    // Resizing clears the bitmap, so repaint in the same frame to avoid a flash.
    const paint = () => draw(running ? performance.now() : epoch + STILL_FRAME_MS);
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
      pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    if (finePointer && !reduced) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
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
      document.removeEventListener("visibilitychange", sync);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
