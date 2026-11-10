"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Rose-gold foil over `children` that the guest scratches away with a finger or the
 * mouse. Once about half is gone the rest fades and `onReveal` runs. Enter or
 * Space reveals it from the keyboard.
 */
export function ScratchCard({ children, onReveal }: { children: ReactNode; onReveal?: (el: HTMLElement) => void }) {
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

    const paint = () => {
      const r = w.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      size = { w: r.width, h: r.height };
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      const g = ctx.createLinearGradient(0, 0, r.width, r.height);
      g.addColorStop(0, "#c9a19a");
      g.addColorStop(0.35, "#f4e1dc");
      g.addColorStop(0.5, "#dcb8b0");
      g.addColorStop(0.7, "#f7e8e4");
      g.addColorStop(1, "#b98d86");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, r.width, r.height);
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 1;
      for (let x = -r.height; x < r.width; x += 6) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + r.height, r.height);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(255,246,243,0.7)";
      ctx.strokeRect(10.5, 10.5, r.width - 21, r.height - 21);
      const serif = getComputedStyle(w).getPropertyValue("--f-cormorant").trim() || "serif";
      ctx.fillStyle = "rgba(110,70,74,0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 15px ${serif}`;
      (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "4px";
      ctx.fillText("SCRATCH HERE", r.width / 2, r.height / 2 - 6);
      ctx.save();
      ctx.translate(r.width / 2, r.height / 2 + 20);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-3.5, -3.5, 7, 7);
      ctx.restore();
    };

    let last: { x: number; y: number } | null = null;
    let moves = 0;

    const cleared = () => {
      const { width, height } = c;
      const data = ctx.getImageData(0, 0, width, height).data;
      let clear = 0;
      let total = 0;
      const step = 12;
      for (let y = 0; y < height; y += step)
        for (let x = 0; x < width; x += step) {
          total++;
          if (data[(y * width + x) * 4 + 3] < 40) clear++;
        }
      return clear / total;
    };

    const reveal = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setDone(true);
      onReveal?.(w);
    };

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 46;
      ctx.beginPath();
      ctx.moveTo(last?.x ?? x, last?.y ?? y);
      ctx.lineTo(x, y);
      ctx.stroke();
      last = { x, y };
      if (++moves % 8 === 0 && cleared() > 0.5) reveal();
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
      scratch(p.x, p.y);
    };
    const move = (e: PointerEvent) => {
      if (doneRef.current || !c.hasPointerCapture(e.pointerId)) return;
      const p = point(e);
      scratch(p.x, p.y);
    };
    const up = () => {
      last = null;
      if (!doneRef.current && cleared() > 0.5) reveal();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        reveal();
      }
    };

    paint();
    void document.fonts?.ready.then(() => !doneRef.current && moves === 0 && paint());
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
    c.addEventListener("keydown", key);
    return () => {
      c.removeEventListener("pointerdown", down);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerup", up);
      c.removeEventListener("pointercancel", up);
      c.removeEventListener("keydown", key);
    };
  }, [onReveal]);

  return (
    <div ref={wrap} className={`anr-scratch${done ? " is-done" : ""}`}>
      {children}
      <canvas ref={canvas} className="anr-foil" role="button" tabIndex={done ? -1 : 0} aria-label="Scratch to reveal the date (or press Enter)" aria-hidden={done || undefined} />
    </div>
  );
}

/** A handful of rose petals thrown up from the middle of `el`. */
export function burst(el: HTMLElement) {
  const box = document.createElement("div");
  box.className = "anr-burst";
  box.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
    const v = 70 + Math.random() * 120;
    const petal = document.createElement("i");
    petal.style.cssText = `--dx:${Math.cos(a) * v}px;--dy:${Math.sin(a) * v + 140}px;--r:${(Math.random() - 0.5) * 540}deg;--s:${0.7 + Math.random() * 0.6};animation-delay:${Math.random() * 0.15}s`;
    box.appendChild(petal);
  }
  el.appendChild(box);
  window.setTimeout(() => box.remove(), 2600);
}
