import type { Resolved } from "../../resolve";
import { makePainted } from "../painted/kit";

import "./lace.css";

// Ivory Lace: a blush card in a sleeve of ivory Chantilly lace, tied with a satin
// bow. The names show faintly through the lace; on the tap the sleeve slips down and
// the card rises out of it, its scalloped lace trims top and bottom.

function Through({ r }: { r: Resolved }) {
  return (
    <span className="lc-through" aria-hidden>
      {r.people.map((p, i) => (
        <span key={i}>
          {i > 0 && <i>&amp;</i>}
          {p.name}
        </span>
      ))}
    </span>
  );
}

export const lace = makePainted("lace", {
  cover: { kind: "envelope", art: "closed", hint: "dark", Extra: Through },
  text: { top: "29%", width: 290 },
  stripY: "3%",
  stripH: 104,
});
