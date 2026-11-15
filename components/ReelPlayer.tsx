"use client";

import {
  LoaderCircle,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  TriangleAlert,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { media, reel } from "@/lib/content";
import { clamp, formatClock } from "@/lib/format";
import { PLAY_REEL_EVENT, REEL_PLAYER_ID } from "@/lib/reel";

type Status = "idle" | "playing" | "paused" | "ended" | "error";

/** Vendor-prefixed fullscreen members that are missing from the DOM typings. */
type FullscreenShell = HTMLDivElement & { webkitRequestFullscreen?: () => void };
type FullscreenVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };
type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
};

const SEEK_STEP = 5;
const copy = reel.player;

function fullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export function ReelPlayer() {
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubbing = useRef(false);

  const [status, setStatus] = useState<Status>("idle");
  const [buffering, setBuffering] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.ended) video.currentTime = 0;
    setBuffering(video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA);
    try {
      await video.play();
    } catch (error) {
      setBuffering(false);
      // An interrupted or blocked play() simply leaves the player paused;
      // a missing or unsupported source is a real failure.
      const unsupported = error instanceof DOMException && error.name === "NotSupportedError";
      if (video.error || unsupported) setStatus("error");
    }
  }, []);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) void play();
    else video.pause();
  }, [play]);

  const retry = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setStatus("idle");
    setTime(0);
    video.load();
    void play();
  }, [play]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) video.muted = !video.muted;
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    const next = clamp(seconds, 0, video.duration);
    video.currentTime = next;
    setTime(next);
  }, []);

  const seekBy = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (video) seekTo(video.currentTime + delta);
    },
    [seekTo],
  );

  const toggleFullscreen = useCallback(() => {
    const shell = shellRef.current as FullscreenShell | null;
    const video = videoRef.current as FullscreenVideo | null;
    if (!shell || !video) return;
    const doc = document as FullscreenDocument;

    if (fullscreenElement()) {
      if (doc.exitFullscreen) void doc.exitFullscreen().catch(() => undefined);
      else doc.webkitExitFullscreen?.();
      return;
    }

    // iPhone Safari can only put the <video> itself into fullscreen.
    const nativeVideoFullscreen = () => {
      try {
        video.webkitEnterFullscreen?.();
      } catch {
        // Not available before metadata has loaded; nothing else to try.
      }
    };

    if (shell.requestFullscreen) {
      shell.requestFullscreen().catch(nativeVideoFullscreen);
    } else if (shell.webkitRequestFullscreen) {
      shell.webkitRequestFullscreen();
    } else {
      nativeVideoFullscreen();
    }
  }, []);

  // The video can fail (or finish loading metadata) before React attaches
  // its listeners, so read the element's state once on mount.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.error) setStatus("error");
    if (Number.isFinite(video.duration) && video.duration > 0) setDuration(video.duration);
    setMuted(video.muted);
  }, []);

  // Any call to action on the page can start the reel.
  useEffect(() => {
    const onRequest = () => {
      shellRef.current?.focus({ preventScroll: true });
      void play();
    };
    window.addEventListener(PLAY_REEL_EVENT, onRequest);
    return () => window.removeEventListener(PLAY_REEL_EVENT, onRequest);
  }, [play]);

  useEffect(() => {
    const sync = () => setFullscreen(fullscreenElement() === shellRef.current);
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement;
    const onButton = target.closest("button") !== null;
    const onSlider = target.getAttribute("role") === "slider";

    switch (event.code) {
      case "Space":
        if (onButton) return; // the focused button handles its own activation
        event.preventDefault();
        toggle();
        break;
      case "KeyK":
        event.preventDefault();
        toggle();
        break;
      case "ArrowLeft":
        event.preventDefault();
        seekBy(-SEEK_STEP);
        break;
      case "ArrowRight":
        event.preventDefault();
        seekBy(SEEK_STEP);
        break;
      case "Home":
        if (!onSlider) return;
        event.preventDefault();
        seekTo(0);
        break;
      case "End":
        if (!onSlider) return;
        event.preventDefault();
        seekTo(duration);
        break;
      case "KeyM":
        event.preventDefault();
        toggleMute();
        break;
      case "KeyF":
        event.preventDefault();
        toggleFullscreen();
        break;
      default:
    }
  };

  const scrubToPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || duration <= 0) return;
    seekTo(clamp((event.clientX - rect.left) / rect.width, 0, 1) * duration);
  };

  const onScrubStart = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (duration <= 0) return;
    scrubbing.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    scrubToPointer(event);
  };

  const onScrubMove = (event: PointerEvent<HTMLDivElement>) => {
    if (scrubbing.current) scrubToPointer(event);
  };

  const onScrubEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!scrubbing.current) return;
    scrubbing.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const failed = status === "error";
  const playing = status === "playing";
  const ended = status === "ended";
  const showSpinner = buffering && !failed;
  const showCentre = !playing && !failed && !showSpinner;
  const progress = duration > 0 ? clamp(time / duration, 0, 1) : 0;
  const percent = `${(progress * 100).toFixed(2)}%`;
  const total = duration > 0 ? formatClock(duration) : "-:--";

  return (
    <div className="relative mx-auto flex w-full justify-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[82%] w-full max-w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.2),rgba(200,16,46,0.06)_55%,transparent)] blur-2xl"
      />

      <div
        id={REEL_PLAYER_ID}
        ref={shellRef}
        role="group"
        aria-label={copy.label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="reel-shell"
      >
        <div className="reel-screen">
          {/* Shown until the poster or the first frame arrives. */}
          <div
            aria-hidden="true"
            className="dot-tile absolute inset-0 flex flex-col items-center justify-end gap-2 pb-[18%]"
          >
            <span className="text-[clamp(2rem,9vw,3rem)] font-extrabold leading-none">
              {copy.posterTitle}
            </span>
            <span className="font-mono text-[0.62rem] font-medium tracking-[0.3em] text-dim">
              {copy.posterNote}
            </span>
          </div>

          <video
            ref={videoRef}
            className="reel-video absolute inset-0 h-full w-full cursor-pointer object-cover"
            src={media.reel}
            poster={media.poster}
            playsInline
            preload="metadata"
            aria-label={copy.videoLabel}
            onClick={toggle}
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
            onDurationChange={(event) => {
              const next = event.currentTarget.duration;
              setDuration(Number.isFinite(next) ? next : 0);
            }}
            onTimeUpdate={(event) => {
              if (!scrubbing.current) setTime(event.currentTarget.currentTime);
            }}
            onPlay={() => setStatus("playing")}
            onPlaying={() => {
              setStatus("playing");
              setBuffering(false);
            }}
            onPause={(event) => {
              if (!event.currentTarget.ended) setStatus("paused");
            }}
            onWaiting={() => setBuffering(true)}
            onCanPlay={() => setBuffering(false)}
            onEnded={() => {
              setStatus("ended");
              setBuffering(false);
            }}
            onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
            onError={() => {
              setStatus("error");
              setBuffering(false);
            }}
          />

          {showCentre ? (
            <button
              type="button"
              onClick={toggle}
              aria-label={ended ? copy.replay : copy.play}
              className="absolute left-1/2 top-1/2 grid h-[4.75rem] w-[4.75rem] -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white text-charcoal shadow-[0_18px_50px_-12px_rgba(0,0,0,0.85)] transition-transform duration-300 ease-soft hover:scale-105"
            >
              {ended ? (
                <RotateCcw className="h-7 w-7" aria-hidden="true" />
              ) : (
                <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
              )}
            </button>
          ) : null}

          {showSpinner ? (
            <div
              role="status"
              className="pointer-events-none absolute inset-0 grid place-items-center bg-black/35"
            >
              <LoaderCircle className="spinner h-10 w-10" aria-hidden="true" />
              <span className="sr-only">{copy.loading}</span>
            </div>
          ) : null}

          {failed ? (
            <div
              role="alert"
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-charcoal/92 px-6 text-center"
            >
              <TriangleAlert className="h-8 w-8 text-steel" aria-hidden="true" />
              <p className="text-[1.15rem] font-bold leading-snug">{copy.error}</p>
              <button type="button" className="btn btn-light min-h-12 px-6" onClick={retry}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {copy.retry}
              </button>
            </div>
          ) : null}
        </div>

        <div className="reel-controls px-1.5 pb-0.5 pt-1">
          <div
            role="slider"
            tabIndex={0}
            aria-label={copy.progress}
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${formatClock(time)} / ${total}`}
            aria-disabled={duration <= 0}
            onPointerDown={onScrubStart}
            onPointerMove={onScrubMove}
            onPointerUp={onScrubEnd}
            onPointerCancel={onScrubEnd}
            className="group relative flex h-11 cursor-pointer touch-none items-center rounded-full px-1.5"
          >
            <div className="relative h-1 w-full rounded-full bg-white/15">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white"
                style={{ width: percent }}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.14)] transition-transform duration-200 ease-soft group-hover:scale-125 group-focus-visible:scale-125"
                style={{ left: percent }}
              />
            </div>
          </div>

          <div className="-mt-1 flex items-center gap-0.5">
            <button
              type="button"
              className="icon-btn"
              onClick={toggle}
              disabled={failed}
              aria-label={playing ? copy.pause : ended ? copy.replay : copy.play}
            >
              {playing ? (
                <Pause className="h-5 w-5 fill-current" aria-hidden="true" />
              ) : (
                <Play className="h-5 w-5 fill-current" aria-hidden="true" />
              )}
            </button>
            <p className="numeral ml-1 mr-auto whitespace-nowrap text-[0.78rem] font-medium text-steel">
              <span className="text-caption">{formatClock(time)}</span>
              <span aria-hidden="true"> / </span>
              <span>{total}</span>
            </p>
            <button
              type="button"
              className="icon-btn"
              onClick={toggleMute}
              aria-label={muted ? copy.unmute : copy.mute}
              aria-pressed={muted}
            >
              {muted ? (
                <VolumeX className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Volume2 className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? copy.exitFullscreen : copy.enterFullscreen}
            >
              {fullscreen ? (
                <Minimize className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Maximize className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
