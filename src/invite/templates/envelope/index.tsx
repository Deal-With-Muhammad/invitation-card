import { makePainted } from "../painted/kit";
import { EnvelopeFaces } from "./address";

import "./envelope.css";

// Letterpress: a sage cotton envelope addressed by hand to the guest (?to= on the
// link). A filmed opening (public/art/envelope/open.*): the flap lifts and a
// deckle-edged card with a debossed olive branch rises out and fills the screen.
// The greeting is live text over the film's first frame, where the film has
// "Dear friends", so the default greeting hands over to the film seamlessly.

function Olive() {
  return <span className="env-olive" aria-hidden />;
}

export const envelope = makePainted("envelope", {
  cover: { kind: "film", art: "fclosed", hint: "dark", Extra: EnvelopeFaces },
  text: { top: "30.5%", width: 300, glow: false },
  Divider: Olive,
});
