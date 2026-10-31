"use client";

import { Spinner } from "@heroui/react";
import { Pause, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

// A design's thumbnail that plays its opening (public/previews/<id>/loop.*) right in
// the tile. The static hero (rendered on the server) stays underneath and the video
// fades in over it.
//
// As a player (the default) the tile itself is the play button: tap to watch the
// opening from the start with a thin progress bar, tap again to pause, and once it
// ends tap to replay. With `href`, tapping the tile opens that page instead (the
// editor) and the corner play icon (or the caption's ThumbPlayButton) plays it. With a mouse it also plays, looping silently, while the pointer
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
  href,
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
  /** Where tapping the tile goes (the design's editor). Play is then the corner icon's job. */
  href?: string;
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
          {href ? (
            <Link
              href={href}
              className="absolute inset-0 z-[1] rounded-[inherit] outline-none focus-visible:ring-3 focus-visible:ring-white/90 focus-visible:ring-inset"
              aria-label={`Use ${name || "this design"}`}
            />
          ) : (
            <button
              type="button"
              onClick={onTap}
              className="absolute inset-0 z-[1] cursor-pointer rounded-[inherit] outline-none focus-visible:ring-3 focus-visible:ring-white/90 focus-visible:ring-inset"
              aria-label={`${action} the opening${name ? ` of ${name}` : ""}`}
            />
          )}
          {(() => {
            // With href and no caption play button, the corner icon is the play button.
            // With href and a caption play button, a bare corner icon would only
            // mislead (tapping there opens the editor), so only a label shows.
            if (href && onControl && !label) return null;
            const asButton = Boolean(href && !onControl);
            const cls = `absolute z-[2] inline-flex items-center justify-center gap-1.5 rounded-full bg-black/40 text-white ring-1 ring-white/20 backdrop-blur-md transition-opacity duration-200 ${
              compact ? "size-8" : label ? (onControl ? "h-7 px-3 text-[12px] font-medium" : "h-7 ps-2.5 pe-3 text-[12px] font-medium") : "size-9"
            } ${indicatorClassName} ${showIcon || asButton ? "opacity-100" : "opacity-0"} ${
              asButton ? "cursor-pointer outline-none before:absolute before:-inset-2 hover:bg-black/55 focus-visible:ring-2 focus-visible:ring-white" : "pointer-events-none"
            }`;
            const inner = (
              <>
                {onControl && label ? null : phase === "loading" ? (
                  <Spinner size="sm" color="current" className="size-3.5" />
                ) : phase === "ended" ? (
                  <RotateCcw className="size-3.5" strokeWidth={2.4} />
                ) : asButton && tapped && phase === "playing" ? (
                  <Pause className="size-3.5 fill-current" strokeWidth={0} />
                ) : (
                  <PlayGlyph className={compact ? "size-3.5" : "size-4"} />
                )}
                {label && !compact && <span>{phase === "ended" && !onControl ? "Watch again" : label}</span>}
              </>
            );
            return asButton ? (
              <button type="button" onClick={onTap} className={cls} aria-label={`${action} the opening${name ? ` of ${name}` : ""}`}>
                {inner}
              </button>
            ) : (
              <span aria-hidden className={cls}>
                {inner}
              </span>
            );
          })()}
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
        <PlayGlyph className="size-4" />
      )}
    </button>
  );
}

/**
 * A play triangle that looks centred in a circle. A triangle's visual weight sits
 * at its centroid, a third of the way in from the flat side, so the triangle is
 * placed with its centroid on the middle of the box (x 8 to 20, centroid at 12).
 */
export function PlayGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M8 5.6v12.8a1.2 1.2 0 0 0 1.8 1l10.2-6.4a1.2 1.2 0 0 0 0-2L9.8 4.6A1.2 1.2 0 0 0 8 5.6Z" />
    </svg>
  );
}
