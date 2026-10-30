import { Art, makePainted } from "../painted/kit";

import "./marigold.css";

// Marigold: a mehndi-night stage of mustard and parrot-green gota fabric, brass diyas
// along the floor and swags of genda phool across the top. Closed, it is a curtain of
// marigold ladis that swing apart. Tap the stage and the garlands bounce and glint.

/** A copy of the hero's top band (the garland swags), so it can bounce on its own. */
function Garland() {
  return (
    <span className="mg-garland" aria-hidden>
      <Art id="marigold" name="hero" />
    </span>
  );
}

function glints(root: HTMLElement, hero: HTMLElement) {
  const box = hero.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "inv-fx inv-fx-sparkles mg-glints";
  el.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 20; i++) {
    const s = document.createElement("i");
    const size = 8 + Math.random() * 9;
    s.style.cssText = [
      `left:${box.left + Math.random() * box.width}px`,
      `top:${box.top + box.height * (0.02 + Math.random() * 0.16)}px`,
      `width:${size}px`,
      `height:${size}px`,
      `animation-delay:${Math.random() * 0.5}s`,
    ].join(";");
    el.appendChild(s);
  }
  root.appendChild(el);
  window.setTimeout(() => el.remove(), 3800);
}

function bounce(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>(".pt-hero");
  const g = hero?.querySelector<HTMLElement>(".mg-garland");
  if (!hero || !g) return;
  g.classList.remove("is-bouncing");
  void g.offsetWidth;
  g.classList.add("is-bouncing");
  glints(root, hero);
}

export const marigold = makePainted("marigold", {
  cover: { kind: "strips", art: "curtain", strips: 12, hint: "light" },
  text: { top: "25%", width: 240 },
  HeroArt: Garland,
  stripY: "99%",
  stripH: 96,
  celebrate: (root) => {
    window.setTimeout(() => bounce(root), 300);
    let last = 0;
    root.addEventListener("click", (e) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest(".pt-hero") || t.closest("a, button")) return;
      const now = Date.now();
      if (now - last < 900) return;
      last = now;
      bounce(root);
    });
  },
});
