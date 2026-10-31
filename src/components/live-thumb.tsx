"use client";

import { Spinner } from "@heroui/react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

// A design's thumbnail that plays its opening (public/previews/<id>/loop.*) right in
// the tile. The static hero (rendered on the server) stays underneath and the video
// fades in over it.
//
// As a player (the default) the tile itself is the play button: tap to watch the
// opening from the start with a thin progress bar, tap again to pause, and once it
// ends tap to replay. With a mouse it also plays, looping silently, while the pointer
// is over the card; `autoplay` loops it while it's on screen instead. Hover and
// autoplay respect reduced motion and data saver; a tap always plays. Only one tile
// plays at a time.
//
// The loop is MP4 (H.264) first: some browsers say they can play VP9 WebM and then
// fail to decode it. A WebM fallback and a watchdog make sure the tile never spins
// forever: if nothing plays it settles back to the still.

export type Phase = "idle" | "loading" | "playing" | "paused" | "ended";
type Mode = "hover" | "auto" | "tap";

/** What a separate play button (see ThumbPlayButton) needs to drive a tile. */
export type ThumbControl = { phase: Phase; action: string; toggle: () => void };

const FORMATS = ["mp4", "webm"] as const;
const WATCHDOG_MS = 9000;

let current: { video: HTMLVideoElement; stop: () => void } | null = null;

const quiet = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

export function LiveThumb({
  id,
  name = "",
  label,
  children,
  autoplay = false,
  player = true,
  compact = false,
  className = "",
  indicatorClassName = "bottom-2.5 left-2.5",
  barClassName = "inset-x-3 bottom-2.5",
  onControl,
}: {
  id: string;
  /** The design's name, for the play button's label. */
  name?: string;
  /** Shown beside the play icon, e.g. "Filmed opening". */
  label?: string;
  children: ReactNode;
  /** Loop silently while it's on screen (the hero's middle card). */
  autoplay?: boolean;
  /** Tap to play. Off for thumbnails inside links, which only play on hover. */
  player?: boolean;
  /** A smaller play icon, for small cards. */
  compact?: boolean;
  className?: string;
  /** Where the play icon sits. */
  indicatorClassName?: string;
  /** Where the progress bar sits. */
  barClassName?: string;
  /** For a separate play button: called whenever the tile's state changes. The corner
   * pill then becomes a plain label. */
  onControl?: (c: ThumbControl) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const mode = useRef<Mode | null>(null);
  const fmt = useRef(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [tapped, setTapped] = useState(false);

  // start/stop only touch refs, state setters and `id`, so listeners can keep the
  // first render's copies.
  const stop = () => {
    const v = video.current;
    if (!v) return;
    v.pause();
    mode.current = null;
    setPhase("idle");
    setTapped(false);
    if (current?.video === v) current = null;
  };

  // The current format failed to load or decode: try the next one, else give up quietly.
  const fail = () => {
    const v = video.current;
    const how = mode.current;
    if (!v || !how) return;
    if (fmt.current < FORMATS.length - 1) {
      fmt.current += 1;
      v.removeAttribute("src");
      v.load();
      start(how);
    } else stop();
  };

  const claim = (v: HTMLVideoElement) => {
    if (current && current.video !== v) current.stop();
    current = { video: v, stop };
  };

  const start = (how: Mode) => {
    const v = video.current;
    if (!v || (how !== "tap" && quiet())) return;
    // Load on first play only; setting src starts the download.
    if (!v.getAttribute("src")) v.src = `/previews/${id}/loop.${FORMATS[fmt.current]}`;
    claim(v);
    mode.current = how;
    v.loop = how !== "tap";
    v.currentTime = 0;
    if (bar.current) bar.current.style.transform = "scaleX(0)";
    setTapped(how === "tap");
    setPhase((p) => (p === "playing" ? "playing" : "loading"));
    v.play().catch((e: unknown) => {
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (e instanceof DOMException && e.name === "NotSupportedError") fail();
      else stop();
    });
  };

  const onTap = () => {
    const v = video.current;
    if (!v) return;
    // Idle, finished, or only previewing on hover: play the opening from the start.
    if (mode.current !== "tap" || phase === "idle" || phase === "ended") return start("tap");
    if (phase === "paused") {
      claim(v);
      setPhase("loading");
      void v.play().catch(() => {});
      return;
    }
    v.pause();
    setPhase("paused");
  };

  // Mouse: play while the pointer is over the whole card (the tile's parent, which
  // also holds its buttons).
  useEffect(() => {
    const zone = box.current?.parentElement;
    if (!zone || autoplay || window.matchMedia("(hover: none)").matches) return;
    const enter = (e: PointerEvent) => e.pointerType === "mouse" && !mode.current && start("hover");
    const leave = (e: PointerEvent) => e.pointerType === "mouse" && mode.current === "hover" && stop();
    zone.addEventListener("pointerenter", enter);
    zone.addEventListener("pointerleave", leave);
    return () => {
      zone.removeEventListener("pointerenter", enter);
      zone.removeEventListener("pointerleave", leave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see start/stop above
  }, [autoplay]);

  // `autoplay` loops while most of the card is on screen. Anything playing stops once
  // the card has (nearly) scrolled away.
  useEffect(() => {
    const el = box.current;
    const v = video.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (autoplay && e.intersectionRatio >= 0.7 && !mode.current) start("auto");
        else if (autoplay && e.intersectionRatio < 0.7 && mode.current === "auto") stop();
        else if (e.intersectionRatio < 0.2 && mode.current) stop();
      },
      { threshold: [0, 0.2, 0.7, 1] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      v?.pause();
      if (v && current?.video === v) current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see start/stop above
  }, [autoplay]);

  // Never spin forever: if a load hasn't started playing in time, try the other format.
  useEffect(() => {
    if (phase !== "loading") return;
    const t = window.setTimeout(() => {
      const v = video.current;
      if (v && (v.error || v.readyState < 3)) fail();
    }, WATCHDOG_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see start/stop above
  }, [phase]);

  // This format can't load or decode here (or there's no recording yet): try the other,
  // else settle back to the still.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const onErr = () => mode.current && fail();
    v.addEventListener("error", onErr);
    return () => v.removeEventListener("error", onErr);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see start/stop above
  }, []);

  // The progress bar follows the video every frame while a tapped opening plays.
  useEffect(() => {
    if (!tapped || phase !== "playing") return;
    let raf = 0;
    const tick = () => {
      const v = video.current;
      if (v && bar.current && v.duration) bar.current.style.transform = `scaleX(${Math.min(1, v.currentTime / v.duration)})`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [tapped, phase]);

  const shown = phase === "playing" || phase === "paused" || phase === "ended";
  const showIcon = (onControl && label) || phase === "idle" || phase === "paused" || phase === "ended" || (phase === "loading" && tapped);
  const showBar = tapped && (phase === "loading" || phase === "playing" || phase === "paused");
  const action = phase === "ended" ? "Replay" : tapped && phase === "playing" ? "Pause" : tapped && phase === "paused" ? "Resume" : "Play";

  // A separate play button drives the tile through the latest onTap.
  const tapRef = useRef(onTap);
  useEffect(() => {
    tapRef.current = onTap;
  });
  const shownPhase: Phase = !tapped && phase !== "ended" ? (phase === "loading" ? "idle" : phase === "playing" ? "idle" : phase) : phase;
  useEffect(() => {
    onControl?.({ phase: shownPhase, action, toggle: () => tapRef.current() });
  }, [onControl, shownPhase, action]);

  return (
    <div ref={box} className={`relative ${className}`}>
      {children}
      <video
        ref={video}
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
        muted
        playsInline
        preload="none"
        aria-hidden
        tabIndex={-1}
        onPlaying={() => setPhase("playing")}
        onEnded={() => mode.current === "tap" && setPhase("ended")}
      />
      {player && (
        <>
          <button
            type="button"
            onClick={onTap}
            className="absolute inset-0 z-[1] cursor-pointer rounded-[inherit] outline-none focus-visible:ring-3 focus-visible:ring-white/90 focus-visible:ring-inset"
            aria-label={`${action} the opening${name ? ` of ${name}` : ""}`}
          />
          <span
            aria-hidden
            className={`pointer-events-none absolute z-[2] inline-flex items-center justify-center gap-1.5 rounded-full bg-black/40 text-white backdrop-blur-md transition-opacity duration-200 ${
              compact ? "size-7" : label ? (onControl ? "h-7 px-3 text-[12px] font-medium" : "h-7 ps-2.5 pe-3 text-[12px] font-medium") : "size-8"
            } ${indicatorClassName} ${showIcon ? "opacity-100" : "opacity-0"}`}
          >
            {onControl && label ? null : phase === "loading" ? (
              <Spinner size="sm" color="current" className="size-3.5" />
            ) : phase === "ended" ? (
              <RotateCcw className="size-3.5" strokeWidth={2.4} />
            ) : (
              <Play className={`${compact ? "size-3" : "size-3.5"} translate-x-px fill-current`} strokeWidth={0} />
            )}
            {label && !compact && <span>{phase === "ended" && !onControl ? "Watch again" : label}</span>}
          </span>
          <span
            aria-hidden
            className={`pointer-events-none absolute z-[2] h-[3px] overflow-hidden rounded-full bg-white/35 shadow-[0_1px_4px_rgb(0_0_0/0.3)] transition-opacity duration-200 ${barClassName} ${
              showBar ? "opacity-100" : "opacity-0"
            }`}
          >
            <span ref={bar} className="block h-full w-full origin-left rounded-full bg-white" style={{ transform: "scaleX(0)" }} />
          </span>
        </>
      )}
    </div>
  );
}

/** A play button for a tile's caption bar, driven by the tile's `onControl`. */
export function ThumbPlayButton({ control, name, className = "" }: { control: ThumbControl | null; name: string; className?: string }) {
  const phase = control?.phase ?? "idle";
  const action = control?.action ?? "Play";
  return (
    <button
      type="button"
      onClick={() => control?.toggle()}
      aria-label={`${action} the opening of ${name}`}
      className={`pointer-events-auto grid size-9 flex-none place-items-center rounded-full bg-brand text-ivory shadow-[0_4px_10px_-4px_rgb(18_64_60/0.6)] transition-transform duration-200 hover:scale-105 active:scale-95 ${className}`}
    >
      {phase === "loading" ? (
        <Spinner size="sm" color="current" className="size-4" />
      ) : phase === "playing" ? (
        <Pause className="size-3.5 fill-current" strokeWidth={0} />
      ) : phase === "ended" ? (
        <RotateCcw className="size-4" strokeWidth={2.4} />
      ) : (
        <Play className="size-3.5 translate-x-px fill-current" strokeWidth={0} />
      )}
    </button>
  );
}
