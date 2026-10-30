// Effects for painted designs, plain DOM so `celebrate` can call them. Pieces are
// either cut-out images (sprites) or gold-leaf flakes drawn in CSS.

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export type Piece = { src?: string; gold?: boolean; w: number; h: number };

/** The rose-petal cut-outs in public/art/petals (p1–p12). Pink ones: 3, 5, 7, 8, 11. */
export const petal = (n: number, w = 30): Piece => ({ src: `/art/petals/p${n}.webp`, w, h: w });
export const RED_PETALS = [1, 2, 4, 6, 9, 10, 12].map((n) => petal(n));
export const PINK_PETALS = [3, 5, 7, 8, 11].map((n) => petal(n));

type FallOpts = {
  pieces: Piece[];
  count?: number;
  /** Where pieces start: across the top edge, or bursting from a point (px). */
  from?: "top" | { x: number; y: number };
  /** Seconds a piece takes to fall. */
  dur?: [number, number];
  /** Spread of the delays, in seconds. */
  spread?: number;
};

/** Pieces falling (from the top) or thrown (from a point) across the screen. */
export function fall(root: HTMLElement, { pieces, count = 24, from = "top", dur = [3.6, 6.2], spread = 1.2 }: FallOpts) {
  if (reduced() || !pieces.length) return;
  const el = document.createElement("div");
  el.className = "pt-fx";
  el.setAttribute("aria-hidden", "true");
  root.appendChild(el);
  const W = window.innerWidth;
  const H = window.innerHeight;
  let longest = 0;
  for (let i = 0; i < count; i++) {
    const p = pieces[i % pieces.length];
    const s = 0.7 + Math.random() * 0.6;
    const d = dur[0] + Math.random() * (dur[1] - dur[0]);
    const delay = Math.random() * spread;
    longest = Math.max(longest, d + delay);
    const i_ = document.createElement("i");
    let x: number, y: number, dx: number, dy: number;
    if (from === "top") {
      x = Math.random() * W;
      y = -40;
      dx = (Math.random() - 0.5) * 180;
      dy = H + 80;
    } else {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
      const v = 120 + Math.random() * 220;
      x = from.x;
      y = from.y;
      dx = Math.cos(a) * v;
      dy = H - from.y + 60;
    }
    i_.style.cssText = [
      `left:${x}px`,
      `top:${y}px`,
      `width:${p.w * s}px`,
      `height:${p.h * s}px`,
      p.src ? `background-image:url(${p.src})` : "",
      `--dx:${dx}px`,
      `--dy:${dy}px`,
      `--spin:${(Math.random() - 0.5) * 720}deg`,
      `animation-duration:${d}s`,
      `animation-delay:${delay}s`,
      from === "top" ? "" : "animation-timing-function:cubic-bezier(.25,.6,.5,1)",
    ]
      .filter(Boolean)
      .join(";");
    if (p.gold) i_.className = "is-gold";
    el.appendChild(i_);
  }
  window.setTimeout(() => el.remove(), (longest + 0.5) * 1000);
}

/**
 * Lets the guest tap the hero (or anything matching `selector`) to throw pieces from
 * where they tapped. At most one throw every `gap` ms.
 */
export function tapToThrow(root: HTMLElement, selector: string, opts: Omit<FallOpts, "from">, gap = 650) {
  let last = 0;
  root.addEventListener("click", (e) => {
    const t = e.target as HTMLElement | null;
    if (!t?.closest(selector) || t.closest("a, button")) return;
    const now = Date.now();
    if (now - last < gap) return;
    last = now;
    fall(root, { count: 10, spread: 0.15, dur: [2.2, 3.4], ...opts, from: { x: e.clientX, y: e.clientY } });
  });
}

/** Gold-leaf flakes for `fall`. */
export const GOLD: Piece[] = [
  { gold: true, w: 12, h: 9 },
  { gold: true, w: 8, h: 7 },
  { gold: true, w: 14, h: 10 },
];
