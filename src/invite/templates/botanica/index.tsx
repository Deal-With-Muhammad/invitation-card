import { Art, makePainted } from "../painted/kit";

import "./botanica.css";

// Botanica: walking into a garden. Watercolour olive, eucalyptus and white
// ranunculus cover the screen; the near leaves (soft, out of focus) rush past while
// the garden behind parts like a gate, and the names wait in the light clearing.

function NearLeaves() {
  return (
    <span className="bt-near" aria-hidden>
      <Art id="botanica" name="closed" />
    </span>
  );
}

export const botanica = makePainted("botanica", {
  cover: { kind: "slide", art: "closed", hint: "dark", Extra: NearLeaves },
  text: { top: "27%", width: 286 },
  stripY: "99%",
  stripH: 110,
});
