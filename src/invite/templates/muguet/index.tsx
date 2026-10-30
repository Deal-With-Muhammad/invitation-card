import { Art, makePainted } from "../painted/kit";

import "./muguet.css";

// Lily of the Valley: something blue. A pale blue envelope with a sprig of lily of the
// valley tucked under its flap; the card that rises out is painted in loose
// watercolour, with arching stems of little white bells in both lower corners.
// Tapping the card sets the stems swaying.

/** Copies of the two painted sprays, so each can sway from its base. */
function Sprays() {
  return (
    <>
      <span className="mu-spray is-l" aria-hidden>
        <Art id="muguet" name="hero" />
      </span>
      <span className="mu-spray is-r" aria-hidden>
        <Art id="muguet" name="hero" />
      </span>
    </>
  );
}

function sway(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(".mu-spray").forEach((el) => {
    el.classList.remove("is-swaying");
    void el.offsetWidth;
    el.classList.add("is-swaying");
  });
}

export const muguet = makePainted("muguet", {
  cover: { kind: "envelope", art: "closed", hint: "dark" },
  text: { top: "7.5%", width: 276 },
  HeroArt: Sprays,
  stripY: "97%",
  stripH: 110,
  celebrate: (root) => {
    sway(root);
    let last = 0;
    root.addEventListener("click", (e) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest(".pt-hero") || t.closest("a, button")) return;
      const now = Date.now();
      if (now - last < 1200) return;
      last = now;
      sway(root);
    });
  },
});
