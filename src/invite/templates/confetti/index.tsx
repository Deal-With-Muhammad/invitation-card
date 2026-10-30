import type { Resolved } from "../../resolve";
import { confetti as burst } from "../../runtime/effects";
import { makePainted } from "../painted/kit";

import "./confetti.css";

// Confetti Pop: a birthday gift in risograph-printed paper with a red satin bow and a
// tag with the birthday child's name and age. The lid flips up, confetti bursts out,
// and inside is a cut-paper party of balloons, bunting and stars. Tapping the party
// throws more confetti from that spot.

const COLOURS = ["#e8432f", "#f6c22b", "#2f54c8", "#5cc8a8", "#ff8fb1"];

function Tag({ r }: { r: Resolved }) {
  const who = r.people[0]?.name ?? "";
  return (
    <span className="cf-lid" aria-hidden>
      <span className="cf-string" />
      <span className="cf-tag">
        <span className="cf-hole" />
        <b>{who}</b>
        {r.milestone && <span className={/^\d{1,3}$/.test(r.milestone) ? "cf-age" : "cf-mile"}>{r.milestone}</span>}
        <small>{r.occasionLabel}</small>
      </span>
    </span>
  );
}

/** Marks a milestone that isn't a short number ("Class of 2026"), so the CSS keeps it a line. */
function Marker({ r }: { r: Resolved }) {
  return r.milestone && !/^\d{1,3}$/.test(r.milestone.trim()) ? <span className="cf-long" hidden /> : null;
}

/** A small handful of paper confetti from a point (px). */
function puff(root: HTMLElement, x: number, y: number) {
  const el = document.createElement("div");
  el.className = "inv-fx inv-fx-confetti";
  el.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 26; i++) {
    const p = document.createElement("i");
    const a = Math.random() * Math.PI * 2;
    const d = 40 + Math.random() * 110;
    const w = 6 + Math.random() * 6;
    p.style.cssText = [
      `left:${x}px`,
      `top:${y}px`,
      `width:${w}px`,
      `height:${Math.random() > 0.5 ? w : w * 0.45}px`,
      `border-radius:${Math.random() > 0.7 ? "50%" : "2px"}`,
      `--x:${Math.cos(a) * d}px`,
      `--y:${Math.sin(a) * d - 160}px`,
      `--r:${(Math.random() - 0.5) * 900}deg`,
      `background:${COLOURS[i % COLOURS.length]}`,
      `animation-duration:${1.3 + Math.random() * 0.9}s`,
    ].join(";");
    el.appendChild(p);
  }
  root.appendChild(el);
  window.setTimeout(() => el.remove(), 2600);
}

export const confetti = makePainted("confetti", {
  cover: {
    kind: "hinge",
    art: "closed",
    hint: "dark",
    Extra: Tag,
    onTap: (root) => window.setTimeout(() => burst(root, { count: 120, colors: COLOURS }), 420),
  },
  text: { top: "21%", width: 300 },
  HeroArt: Marker,
  stripY: "99%",
  stripH: 100,
  celebrate: (root) => {
    let last = 0;
    root.addEventListener("click", (e) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest(".pt-hero, .inv-closing") || t.closest("a, button")) return;
      const now = Date.now();
      if (now - last < 600) return;
      last = now;
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) puff(root, e.clientX, e.clientY);
    });
  },
});
