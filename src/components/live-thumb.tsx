"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// A design's thumbnail that can play its opening. The static hero (rendered on the
// server) stays underneath; a short silent loop (public/previews/<id>/loop.*) fades in
// over it while it plays: on hover with a mouse, or while it's the tile in view on a
// phone. Only one tile plays at a time, and nothing autoplays with reduced motion or
// data saver on.

let current: HTMLVideoElement | null = null;

const quiet = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true);

export function LiveThumb({ id, children, autoplay = false, className = "" }: { id: string; children: ReactNode; autoplay?: boolean; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);

  const play = () => {
    const v = video.current;
    if (!v || quiet()) return;
    // Load on first play only; setting src starts the download.
    if (!v.getAttribute("src")) v.src = `/previews/${id}/loop.${v.canPlayType('video/webm; codecs="vp9"') ? "webm" : "mp4"}`;
    if (current && current !== v) current.pause();
    current = v;
    v.currentTime = 0;
    void v.play().catch(() => {});
  };
  const stop = () => {
    const v = video.current;
    if (!v) return;
    v.pause();
    setOn(false);
    if (current === v) current = null;
  };

  // Mouse: play while the pointer is over the whole card (the tile's parent, which
  // also holds its buttons).
  useEffect(() => {
    const zone = box.current?.parentElement;
    if (!zone || autoplay || window.matchMedia("(hover: none)").matches) return;
    const enter = (e: PointerEvent) => e.pointerType === "mouse" && play();
    const leave = (e: PointerEvent) => e.pointerType === "mouse" && stop();
    zone.addEventListener("pointerenter", enter);
    zone.addEventListener("pointerleave", leave);
    return () => {
      zone.removeEventListener("pointerenter", enter);
      zone.removeEventListener("pointerleave", leave);
    };
    // play/stop only touch refs and state setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  // Phones (and `autoplay`): play while most of the tile is on screen.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const touch = window.matchMedia("(hover: none)").matches;
    if (!touch && !autoplay) return;
    const io = new IntersectionObserver(([e]) => (e.intersectionRatio >= 0.7 ? play() : stop()), { threshold: [0, 0.7, 1] });
    io.observe(el);
    return () => io.disconnect();
    // play/stop only touch refs and state setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  return (
    <div ref={box} className={`relative ${className}`}>
      {children}
      <video
        ref={video}
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${on ? "opacity-100" : "opacity-0"}`}
        muted
        playsInline
        loop
        preload="none"
        aria-hidden
        tabIndex={-1}
        onPlaying={() => setOn(true)}
        onPause={() => setOn(false)}
      />
    </div>
  );
}
