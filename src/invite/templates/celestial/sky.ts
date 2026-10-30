// Shooting stars for Celestial: one crosses the sky after opening, and the guest
// can tap the sky for more (at most one every 900 ms).

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function shoot(root: HTMLElement, x: number, y: number) {
  const layer = document.createElement("div");
  layer.className = "cl-fx";
  layer.setAttribute("aria-hidden", "true");
  const star = document.createElement("i");
  const angle = 140 + Math.random() * 22;
  star.style.cssText = `left:${x}px;top:${y}px;--a:${angle}deg;--len:${200 + Math.random() * 120}px`;
  layer.appendChild(star);
  root.appendChild(layer);
  window.setTimeout(() => layer.remove(), 1600);
}

export function shootingStars(root: HTMLElement) {
  if (reduced()) return;
  window.setTimeout(() => shoot(root, window.innerWidth * 0.86, window.innerHeight * 0.08), 1400);
  let last = 0;
  root.addEventListener("click", (e) => {
    const t = e.target as HTMLElement | null;
    if (!t?.closest(".pt-hero") || t.closest("a, button")) return;
    const now = Date.now();
    if (now - last < 900) return;
    last = now;
    shoot(root, e.clientX, e.clientY);
  });
}
