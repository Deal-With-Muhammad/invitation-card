import type { CSSProperties } from "react";

import { sparkles } from "../../runtime/effects";
import { makePainted } from "../painted/kit";

import "./cloudnine.css";

// Cloud Nine: a watercolour nursery mobile of felt clouds, a crescent moon and little
// stars. It starts behind a frosted pane (the same painting, out of focus) that lifts
// away and leaves it sharp. The gold stars glint now and then, and
// tapping the card makes a star twinkle where you tapped.

/** The gold stars on the mobile (fractions of the art). */
const STARS = [
  { x: 0.42, y: 0.172 },
  { x: 0.675, y: 0.147 },
  { x: 0.37, y: 0.4 },
  { x: 0.545, y: 0.432 },
  { x: 0.79, y: 0.311 },
];

function Glints() {
  return (
    <>
      {STARS.map((s, i) => (
        <i key={i} className="cn-glint" style={{ "--gx": s.x, "--gy": s.y, "--k": i } as CSSProperties} aria-hidden />
      ))}
    </>
  );
}

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A star that twinkles where the guest taps the hero. At most one every 500 ms. */
function tapToTwinkle(root: HTMLElement) {
  let last = 0;
  root.addEventListener("click", (e) => {
    const t = e.target as HTMLElement | null;
    if (!t?.closest(".pt-hero") || t.closest("a, button") || reduced()) return;
    const now = Date.now();
    if (now - last < 500) return;
    last = now;
    const star = document.createElement("i");
    star.className = "cn-twinkle";
    star.setAttribute("aria-hidden", "true");
    star.style.cssText = `left:${e.clientX}px;top:${e.clientY}px`;
    for (let k = 0; k < 5; k++) {
      const dot = document.createElement("b");
      dot.style.setProperty("--a", `${k * 72 + Math.random() * 30}deg`);
      star.appendChild(dot);
    }
    root.appendChild(star);
    window.setTimeout(() => star.remove(), 1500);
  });
}

export const cloudnine = makePainted("cloudnine", {
  cover: { kind: "lift", hint: "dark" },
  text: { top: "48.5%", width: 290 },
  HeroArt: Glints,
  stripY: "97%",
  stripH: 100,
  celebrate: (root) => {
    sparkles(root, { count: 26, color: "#e3b867" });
    tapToTwinkle(root);
  },
});
