import { makePainted } from "../painted/kit";

import "./seaside.css";

// Seaside: a message in a bottle on a beach. A wave washes up over it and, as it
// slides back, your names are left written in the sand of an aerial watercolour
// beach, where the foam keeps lapping gently at the shoreline.

/** The foam at the waterline, lapping slowly. */
function Foam() {
  return <span className="ss-foam" aria-hidden />;
}

export const seaside = makePainted("seaside", {
  cover: { kind: "wave", art: "closed", hint: "dark" },
  text: { top: "7%", width: 300 },
  HeroArt: Foam,
  stripY: "65%",
  stripH: 112,
});
