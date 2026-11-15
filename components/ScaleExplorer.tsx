"use client";

import { ListRestart, LoaderCircle, Minus, Pause, Play, Plus, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { CountUp } from "@/components/CountUp";
import { ScaleFallback } from "@/components/ScaleFallback";
import { densityCopy, scale as copy } from "@/lib/content";
import { clamp, formatApprox, formatIN } from "@/lib/format";
import { useOnScreen, usePageVisible, usePrefersReducedMotion } from "@/lib/hooks";
import {
  COUNT_STEPS,
  DENSITIES,
  crowdArea,
  getDensity,
  pitchEquivalent,
  type CountStep,
  type DensityKey,
} from "@/lib/scale";

function StageMessage({ text }: { text: string }) {
  return (
    <div
      role="status"
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-dim"
    >
      <LoaderCircle className="spinner h-7 w-7" aria-hidden="true" />
      <p className="text-[0.95rem]">{text}</p>
    </div>
  );
}

// three.js and React Three Fiber live in their own chunk, fetched only when
// the explorer is about to scroll into view.
const ScaleScene = dynamic(() => import("@/components/ScaleScene"), {
  ssr: false,
  loading: () => <StageMessage text={copy.loading} />,
});

/** Catches a failed WebGL context or a failed chunk load and shows the fallback. */
class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function supportsWebGL2(): boolean {
  try {
    const probe = document.createElement("canvas");
    const context = probe.getContext("webgl2");
    if (!context) return false;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

const LAST_STEP = COUNT_STEPS[COUNT_STEPS.length - 1];
const SEQUENCE_STEP_MS = 1350;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2.2;

export function ScaleExplorer() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const pageVisible = usePageVisible();
  const nearViewport = useOnScreen(rootRef, "700px 0px", true);
  const onScreen = useOnScreen(rootRef);

  const [count, setCount] = useState<CountStep>(COUNT_STEPS[0]);
  const [densityKey, setDensityKey] = useState<DensityKey>("loose");
  const [zoom, setZoom] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  /** The opening 1 → 1,00,000 run plays once, until the visitor takes over. */
  const [sequence, setSequence] = useState<"waiting" | "stopped">("waiting");

  const webgl = useMemo(() => (nearViewport ? supportsWebGL2() : null), [nearViewport]);
  const useFallback = webgl === false || contextLost;
  const stageReady = sceneReady || useFallback;

  const density = getDensity(densityKey);
  const area = crowdArea(count, density);
  const pitches = pitchEquivalent(area);
  const crowdName = densityCopy[densityKey].crowd;

  const captionParts = [
    `${formatIN(count)} ${count === 1 ? copy.person : copy.people}`,
    crowdName,
    `${copy.approx} ${formatApprox(area)} ${copy.sqm}`,
    `${pitches < 0.05 ? copy.lessThanTenth : formatIN(pitches, 1)} ${copy.pitches}`,
  ];
  const caption = captionParts.join(" · ");

  // Count up through the steps on first view, the way the reel does.
  const sequenceRunning =
    sequence === "waiting" && stageReady && onScreen && pageVisible && !reduced && count !== LAST_STEP;
  useEffect(() => {
    if (!sequenceRunning) return;
    const timer = window.setInterval(() => {
      setCount((current) => {
        const index = COUNT_STEPS.indexOf(current);
        return COUNT_STEPS[Math.min(index + 1, COUNT_STEPS.length - 1)];
      });
    }, SEQUENCE_STEP_MS);
    return () => window.clearInterval(timer);
  }, [sequenceRunning]);

  const chooseCount = (step: CountStep) => {
    setSequence("stopped");
    setCount(step);
    setZoom(1);
  };

  const chooseDensity = (key: DensityKey) => {
    setDensityKey(key);
    setZoom(1);
  };

  const replaySequence = () => {
    setCount(COUNT_STEPS[0]);
    setZoom(1);
    setSequence("waiting");
  };

  const stopOrbit = useCallback(() => setAutoRotate(false), []);
  const zoomBy = useCallback((factor: number) => {
    setZoom((current) => clamp(current * factor, ZOOM_MIN, ZOOM_MAX));
  }, []);
  const markReady = useCallback(() => setSceneReady(true), []);
  const markLost = useCallback(() => setContextLost(true), []);

  const resetView = () => {
    setZoom(1);
    setResetKey((key) => key + 1);
  };

  const fallback = (
    <ScaleFallback
      count={count}
      spacing={density.spacing}
      label={`${caption} ${copy.fallbackLabel}`}
      note={copy.fallbackNote}
    />
  );

  return (
    <div ref={rootRef} className="panel overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 p-5 sm:p-7">
        <div className="min-w-0">
          <p className="label-hi">{copy.readoutLabel}</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
            <span className="numeral text-[clamp(2.6rem,9vw,4.75rem)] font-bold leading-[1.05]">
              <CountUp value={count} from={1} duration={1100} />
            </span>
            <span className="text-[1.2rem] font-medium text-steel">
              {count === 1 ? copy.person : copy.people}
            </span>
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <p id="density-label" className="label-hi">
            {copy.densityLabel}
          </p>
          <div role="group" aria-labelledby="density-label" className="mt-2.5 grid grid-cols-3 gap-1.5">
            {DENSITIES.map((item) => (
              <button
                key={item.key}
                type="button"
                className="segment flex-col gap-0.5 px-3 py-2 leading-tight"
                aria-pressed={densityKey === item.key}
                onClick={() => chooseDensity(item.key)}
              >
                <span className="text-[1rem] font-bold">{densityCopy[item.key].label}</span>
                <span className="font-mono text-[0.66rem] font-medium opacity-80">
                  {item.sqft} {copy.sqft}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="stage relative h-[60svh] min-h-[20rem] border-y border-line lg:h-[min(64svh,38rem)]">
        {useFallback ? (
          fallback
        ) : webgl ? (
          <SceneBoundary fallback={fallback}>
            <ScaleScene
              count={count}
              spacing={density.spacing}
              zoom={zoom}
              autoRotate={autoRotate}
              resetKey={resetKey}
              active={onScreen && pageVisible}
              reducedMotion={reduced}
              label={`${caption} ${copy.sceneLabel}`}
              onInteract={stopOrbit}
              onZoom={zoomBy}
              onReady={markReady}
              onLost={markLost}
            />
          </SceneBoundary>
        ) : (
          <StageMessage text={copy.loading} />
        )}

        <p className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 text-[0.82rem] font-medium text-dim sm:left-6 sm:top-5">
          <span aria-hidden="true" className="h-px w-5 bg-[#CDEEDB]/70" />
          {copy.legend}
        </p>

        {sceneReady && !useFallback ? (
          <div className="absolute bottom-3 right-3 flex gap-1.5 sm:bottom-5 sm:right-5">
            <button
              type="button"
              className="icon-btn icon-btn-outline"
              aria-label={autoRotate ? copy.pauseOrbit : copy.resumeOrbit}
              disabled={reduced}
              onClick={() => setAutoRotate((value) => !value)}
            >
              {autoRotate && !reduced ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              className="icon-btn icon-btn-outline"
              aria-label={copy.resetView}
              onClick={resetView}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn-outline"
              aria-label={copy.zoomOut}
              disabled={zoom >= ZOOM_MAX}
              onClick={() => zoomBy(1.3)}
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn-outline"
              aria-label={copy.zoomIn}
              disabled={zoom <= ZOOM_MIN}
              onClick={() => zoomBy(1 / 1.3)}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p id="count-label" className="label-hi">
            {copy.countLabel}
          </p>
          <button
            type="button"
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-1 text-[0.95rem] font-medium text-steel transition-colors duration-200 hover:text-white"
            onClick={replaySequence}
          >
            <ListRestart className="h-4 w-4" aria-hidden="true" />
            {copy.replay}
          </button>
        </div>
        <div
          role="group"
          aria-labelledby="count-label"
          className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6"
        >
          {COUNT_STEPS.map((step) => (
            <button
              key={step}
              type="button"
              className="segment numeral text-[0.92rem] font-bold"
              aria-pressed={count === step}
              onClick={() => chooseCount(step)}
            >
              {formatIN(step)}
            </button>
          ))}
        </div>

        <p
          aria-live={sequenceRunning ? "off" : "polite"}
          className="mt-6 text-[clamp(1rem,0.95rem+0.4vw,1.25rem)] font-medium leading-relaxed text-white"
        >
          {captionParts.map((part, index) => (
            <span key={part}>
              {index > 0 ? (
                <span aria-hidden="true" className="text-dim">
                  {" · "}
                </span>
              ) : null}
              <span className={index === 1 ? "text-steel" : undefined}>{part}</span>
            </span>
          ))}
        </p>
        {useFallback ? null : (
          <p className="mt-3 text-[0.9rem] leading-relaxed text-dim">{copy.hint}</p>
        )}
      </div>
    </div>
  );
}
