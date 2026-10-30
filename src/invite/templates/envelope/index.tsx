import { makePainted } from "../painted/kit";
import { EnvelopeFaces } from "./address";

import "./envelope.css";

// Letterpress: a sage cotton envelope addressed by hand to the guest (?to= on the
// link), which turns over to its red wax seal. The seal cracks, the envelope drops
// away and a deckle-edged 600gsm card with a debossed olive branch rises out.

function Olive() {
  return <span className="env-olive" aria-hidden />;
}

export const envelope = makePainted("envelope", {
  cover: { kind: "envelope", art: "front", pos: "62% 50%", hint: "dark", Extra: EnvelopeFaces },
  text: { top: "30.5%", width: 300, glow: false },
  Divider: Olive,
});
