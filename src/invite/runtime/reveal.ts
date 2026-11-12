// Scroll reveals for browsers without scroll-driven animations (older iPhones, Firefox).
// Where `animation-timeline: view()` works, CSS does everything and this does nothing.
// Otherwise the invitation root gets `no-st`, and each piece that eases in (.rv and the
// premium body's trims, motifs, counters and programme rows) gets `is-in` the first time
// it comes into view; the styles for both are in base.css and templates/premium/body.css.

const PIECES = ".rv, .pb-trim, .pb-motif, .inv-cd-unit, .inv-sched li";

export function watchReveals(root: HTMLElement): () => void {
  if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) return () => {};
  if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  root.classList.add("no-st");
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  const watch = () => root.querySelectorAll(`${PIECES}`).forEach((el) => !el.classList.contains("is-in") && io.observe(el));
  watch();
  // Sections can change while it is open (a language switch, an edit in the preview).
  const mo = new MutationObserver(watch);
  mo.observe(root, { childList: true, subtree: true });
  return () => {
    io.disconnect();
    mo.disconnect();
    root.classList.remove("no-st");
  };
}
