"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The pearl medallion: a pearl foil over `children` that the guest rubs away with a finger
 * or the mouse. Once about half is gone the rest fades. Enter or Space reveals it from the
 * keyboard. `label` is written on the foil ("Scratch to reveal").
 */
export function Scratch({ children, label }: { children: ReactNode; label: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const c = canvas.current;
    const w = wrap.current;
    if (!c || !w) return;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    let size = { w: 0, h: 0 };
    let moves = 0;
    let last: { x: number; y: number } | null = null;

    const paint = () => {
      const r = w.getBoundingClientRect();
      if (!r.width) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      size = { w: r.width, h: r.height };
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      // a soft pearl: pale blush with a slanting band of light
      const g = ctx.createLinearGradient(0, 0, r.width, r.height);
      g.addColorStop(0, "#e9d8df");
      g.addColorStop(0.3, "#fbf3f5");
      g.addColorStop(0.52, "#e2cdd6");
      g.addColorStop(0.74, "#f6ecef");
      g.addColorStop(1, "#d9c2cc");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, r.width, r.height);
      const shine = ctx.createRadialGradient(r.width * 0.34, r.height * 0.28, 0, r.width * 0.34, r.height * 0.28, r.width * 0.7);
      shine.addColorStop(0, "rgba(255,255,255,0.75)");
      shine.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = shine;
      ctx.fillRect(0, 0, r.width, r.height);
      const css = getComputedStyle(w);
      const script = css.getPropertyValue("--f-names").trim() || "cursive";
      ctx.fillStyle = "rgba(96,72,88,0.86)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const words = label.split(" ");
      const lines = words.length > 2 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : [label];
      const px = Math.max(15, Math.min(24, (r.width / Math.max(...lines.map((l) => l.length))) * 2.1));
      ctx.font = `400 ${px}px ${script}`;
      ctx.direction = css.direction === "rtl" ? "rtl" : "ltr";
      lines.forEach((l, i) => ctx.fillText(l, r.width / 2, r.height / 2 + (i - (lines.length - 1) / 2) * px * 1.2));
    };

    const cleared = () => {
      const { width, height } = c;
      if (!width || !height) return 0;
      const data = ctx.getImageData(0, 0, width, height).data;
      let clear = 0;
      let total = 0;
      for (let y = 0; y < height; y += 10)
        for (let x = 0; x < width; x += 10) {
          total++;
          if (data[(y * width + x) * 4 + 3] < 40) clear++;
        }
      return clear / total;
    };

    const reveal = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setDone(true);
    };

    const rub = (x: number, y: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 34;
      ctx.beginPath();
      ctx.moveTo(last?.x ?? x, last?.y ?? y);
      ctx.lineTo(x, y);
      ctx.stroke();
      last = { x, y };
      if (++moves % 6 === 0 && cleared() > 0.45) reveal();
    };

    const point = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * size.w, y: ((e.clientY - r.top) / r.height) * size.h };
    };
    const down = (e: PointerEvent) => {
      if (doneRef.current) return;
      c.setPointerCapture(e.pointerId);
      last = null;
      const p = point(e);
      rub(p.x, p.y);
    };
    const move = (e: PointerEvent) => {
      // a press that began just outside the oval still rubs once it is over the foil
      if (doneRef.current || !(c.hasPointerCapture(e.pointerId) || e.buttons > 0)) return;
      const p = point(e);
      rub(p.x, p.y);
    };
    const up = () => {
      last = null;
      if (!doneRef.current && cleared() > 0.45) reveal();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        reveal();
      }
    };

    paint();
    void document.fonts?.ready.then(() => !doneRef.current && moves === 0 && paint());
    // The medallion is sized by the page width: repaint if that changes before anyone has rubbed it.
    const ro = new ResizeObserver(() => !doneRef.current && moves === 0 && paint());
    ro.observe(w);
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
    c.addEventListener("keydown", key);
    return () => {
      ro.disconnect();
      c.removeEventListener("pointerdown", down);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerup", up);
      c.removeEventListener("pointercancel", up);
      c.removeEventListener("keydown", key);
    };
  }, [label]);

  return (
    <div ref={wrap} className={`nc-scratch${done ? " is-done" : ""}`}>
      <div className="nc-scratch-in">{children}</div>
      <canvas ref={canvas} className="nc-foil" role="button" tabIndex={done ? -1 : 0} aria-label={label} aria-hidden={done || undefined} />
    </div>
  );
}
