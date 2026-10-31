import type { Resolved } from "../../resolve";
import { makePainted, initials } from "../painted/kit";

import "./filigree.css";

// Gilded Wreath: a thick ivory cotton card with a blind-embossed laurel wreath and a
// thin gold-foil wreath inside it, carrying the couple's monogram in gold foil. It
// comes in a heavy ivory envelope with the initials blind-embossed on the flap; the
// card rises out and a slow glint of light runs across the gold.

function Monogram({ r }: { r: Resolved }) {
  const [a, b] = initials(r);
  return (
    <span className="fl-wreath" aria-hidden>
      <span className="fl-mono">
        {a}
        {b && (
          <>
            <i>&amp;</i>
            {b}
          </>
        )}
      </span>
      <span className="fl-glint" />
    </span>
  );
}

function Laurel({ index }: { index: number }) {
  return <span className={`fl-laurel${index % 2 ? " is-flip" : ""}`} aria-hidden />;
}

export const filigree = makePainted("filigree", {
  cover: { kind: "film", art: "fclosed", hint: "dark", seal: { x: "49.2%", y: "53.6%", size: 66, look: "emboss" } },
  text: { top: "53.5%", width: 320, glow: false },
  HeroArt: Monogram,
  Divider: Laurel,
});
