// One-off celebration effects, plain DOM so a template's `celebrate` can call them.
// They read the palette from the invitation root and clean up after themselves.

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const paletteOf = (root: HTMLElement) => {
  const s = getComputedStyle(root);
  return ["--accent", "--soft", "--ink"].map((v) => s.getPropertyValue(v).trim()).filter(Boolean);
};

function layer(root: HTMLElement, className: string) {
  const el = document.createElement("div");
  el.className = `inv-fx ${className}`;
  el.setAttribute("aria-hidden", "true");
  root.appendChild(el);
  return el;
}

/** Petals drifting down. `shape`: "petal" (rounded leaf) or "dot". */
export function petals(root: HTMLElement, { count = 34, colors, shape = "petal" }: { count?: number; colors?: string[]; shape?: "petal" | "dot" } = {}) {
  if (reduced()) return;
  const tones = colors?.length ? colors : paletteOf(root);
  const el = layer(root, "inv-fx-petals");
  let longest = 0;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("i");
    const dur = 3.4 + Math.random() * 2.8;
    const delay = Math.random() * 1.2;
    longest = Math.max(longest, dur + delay);
    const size = 8 + Math.random() * 10;
    p.className = shape;
    p.style.cssText = [
      `left:${Math.random() * 100}%`,
      `width:${size}px`,
      `height:${shape === "dot" ? size * 0.5 : size * 0.8}px`,
      `--drift:${(Math.random() - 0.5) * 160}px`,
      `--spin:${(Math.random() - 0.5) * 900}deg`,
      `background:${tones[i % tones.length]}`,
      `animation-duration:${dur}s`,
      `animation-delay:${delay}s`,
    ].join(";");
    el.appendChild(p);
  }
  window.setTimeout(() => el.remove(), (longest + 0.4) * 1000);
}

/** A burst of paper confetti from the middle of the screen. */
export function confetti(root: HTMLElement, { count = 90, colors }: { count?: number; colors?: string[] } = {}) {
  if (reduced()) return;
  const tones = colors?.length ? colors : paletteOf(root);
  const el = layer(root, "inv-fx-confetti");
  for (let i = 0; i < count; i++) {
    const p = document.createElement("i");
    const angle = Math.random() * Math.PI * 2;
    const dist = 140 + Math.random() * 260;
    const w = 6 + Math.random() * 6;
    p.style.cssText = [
      `width:${w}px`,
      `height:${Math.random() > 0.5 ? w : w * 0.45}px`,
      `border-radius:${Math.random() > 0.7 ? "50%" : "2px"}`,
      `--x:${Math.cos(angle) * dist}px`,
      `--y:${Math.sin(angle) * dist - 120}px`,
      `--r:${(Math.random() - 0.5) * 1080}deg`,
      `background:${tones[i % tones.length]}`,
      `animation-delay:${Math.random() * 0.15}s`,
      `animation-duration:${1.6 + Math.random() * 1.2}s`,
    ].join(";");
    el.appendChild(p);
  }
  window.setTimeout(() => el.remove(), 3400);
}

/** Tiny twinkling sparkles scattered over the screen for a few seconds. */
export function sparkles(root: HTMLElement, { count = 40, color }: { count?: number; color?: string } = {}) {
  if (reduced()) return;
  const tone = color ?? paletteOf(root)[0];
  const el = layer(root, "inv-fx-sparkles");
  for (let i = 0; i < count; i++) {
    const p = document.createElement("i");
    const s = 3 + Math.random() * 5;
    p.style.cssText = [
      `left:${Math.random() * 100}%`,
      `top:${Math.random() * 100}%`,
      `width:${s}px`,
      `height:${s}px`,
      `background:${tone}`,
      `animation-delay:${Math.random() * 2}s`,
    ].join(";");
    el.appendChild(p);
  }
  window.setTimeout(() => el.remove(), 4600);
}
