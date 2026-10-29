"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Slowly scrolls the invitation once it's open. Any touch, wheel or key pauses it;
// it picks up again after a few quiet seconds unless the guest paused it with the
// button. Stops at the bottom.

const PX_PER_SECOND = { 1: 22, 2: 38, 3: 60 } as const;
const RESUME_AFTER_MS = 5000;
const START_AFTER_MS = 1800;

export function useAutoScroll(enabled: boolean, speed: 1 | 2 | 3) {
  const [running, setRunning] = useState(false);
  const manualOff = useRef(false);
  const resumeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    manualOff.current = false;
    const t = window.setTimeout(() => setRunning(true), START_AFTER_MS);
    return () => window.clearTimeout(t);
  }, [enabled]);

  // Pause on interaction, resume later.
  useEffect(() => {
    if (!enabled) return;
    const onUser = () => {
      setRunning(false);
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
      if (manualOff.current) return;
      resumeTimer.current = window.setTimeout(() => {
        if (!manualOff.current) setRunning(true);
      }, RESUME_AFTER_MS);
    };
    const opts = { passive: true } as const;
    window.addEventListener("wheel", onUser, opts);
    window.addEventListener("touchstart", onUser, opts);
    window.addEventListener("keydown", onUser);
    return () => {
      window.removeEventListener("wheel", onUser);
      window.removeEventListener("touchstart", onUser);
      window.removeEventListener("keydown", onUser);
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    };
  }, [enabled]);

  useEffect(() => {
    if (!running || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = performance.now();
    let carry = 0;
    const step = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      carry += (PX_PER_SECOND[speed] * dt) / 1000;
      const px = Math.floor(carry);
      if (px >= 1) {
        carry -= px;
        const el = document.scrollingElement ?? document.documentElement;
        if (el.scrollTop + window.innerHeight >= el.scrollHeight - 2) {
          setRunning(false);
          return;
        }
        window.scrollBy(0, px);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [running, enabled, speed]);

  const toggle = useCallback(() => {
    setRunning((on) => {
      manualOff.current = on;
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
      return !on;
    });
  }, []);

  return { running: running && enabled, toggle };
}
