import { Art, makePainted } from "../painted/kit";

import "./scroll.css";

// Scroll: a rolled parchment diploma tied with navy ribbon and a gold seal, on a walnut
// desk. It unrolls down the screen (the bottom roller travels down as the parchment
// opens) to the invitation under a gold laurel. Tap the parchment to toss caps.

/** The bottom roller, cut from the hero, travelling down with the unrolling edge. */
function Roller() {
  return (
    <span className="sc-roller" aria-hidden>
      <Art id="scroll" name="hero" />
    </span>
  );
}

const CAP =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 50"><path d="M15 22v12c0 6 34 6 34 0V22l-17 7z" fill="#16213f"/><path d="M32 4l30 12-30 12L2 16z" fill="#22305a"/><path d="M32 4l30 12-30 12" fill="none" stroke="#3a4a7a" stroke-width="1"/><path d="M32 16l20 6v14" fill="none" stroke="#d8b25a" stroke-width="2"/><rect x="49.5" y="35" width="5" height="9" rx="2" fill="#d8b25a"/><circle cx="32" cy="16" r="2.4" fill="#d8b25a"/></svg>`,
  );

/** Graduation caps thrown up from a point (px), spinning, then falling away. */
function toss(root: HTMLElement, x: number, y: number, count: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el = document.createElement("div");
  el.className = "inv-fx sc-caps";
  el.setAttribute("aria-hidden", "true");
  for (let i = 0; i < count; i++) {
    const c = document.createElement("i");
    const s = 0.8 + Math.random() * 0.5;
    c.style.cssText = [
      `left:${x - 28 * s}px`,
      `top:${y - 22 * s}px`,
      `width:${56 * s}px`,
      `height:${44 * s}px`,
      `--dx:${(Math.random() - 0.5) * 240}px`,
      `--up:${-(220 + Math.random() * 200)}px`,
      `--down:${window.innerHeight - y + 80}px`,
      `--spin:${(Math.random() - 0.5) * 900}deg`,
      `animation-delay:${i * 90}ms`,
    ].join(";");
    const b = document.createElement("b");
    b.style.backgroundImage = `url("${CAP}")`;
    b.style.animationDelay = `${i * 90}ms`;
    c.appendChild(b);
    el.appendChild(c);
  }
  root.appendChild(el);
  window.setTimeout(() => el.remove(), 2600 + count * 90);
}

export const scroll = makePainted("scroll", {
  cover: { kind: "unroll", art: "closed", hint: "light" },
  text: { top: "25%", width: 296 },
  HeroArt: Roller,
  stripY: "1%",
  stripH: 64,
  celebrate: (root) => {
    toss(root, window.innerWidth / 2, window.innerHeight * 0.82, 4);
    let last = 0;
    root.addEventListener("click", (e) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest(".pt-hero, .inv-closing") || t.closest("a, button")) return;
      const now = Date.now();
      if (now - last < 700) return;
      last = now;
      toss(root, e.clientX, e.clientY, 3 + Math.round(Math.random() * 2));
    });
  },
});
