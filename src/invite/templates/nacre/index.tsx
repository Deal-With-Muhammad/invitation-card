import { makePainted } from "../painted/kit";

import { ClosingSec, CountdownSec, DetailsSec, DressSec, EventsSec, GiftsSec, ScheduleSec } from "./sections";

import "./nacre.css";

// Nacre: everything carved from blush mother-of-pearl. A pearl envelope of magnolia petals with
// a wax seal carrying the initials; on the film (public/art/nacre/open.*) the seal lifts, the flap
// opens, a card tied with an organza bow rises out, the bow unties itself and slips away, and the
// names appear inside the card's carved frame. Below the card every section is a different
// surface (./sections.tsx), in the design's own order.

export const nacre = makePainted("nacre", {
  cover: {
    kind: "film",
    art: "closed",
    hint: "dark",
    // measured on the closed art: the plain face of the wax seal
    seal: { x: "50%", y: "49.6%", size: 104, look: "emboss" },
  },
  text: { top: "26%", width: 208, glow: false },
  stripY: null,
  panels: "clear",
  sections: { countdown: CountdownSec, events: EventsSec, schedule: ScheduleSec, dress: DressSec, details: DetailsSec, gifts: GiftsSec, closing: ClosingSec },
  order: ["countdown", "invite", "events", "schedule", "dress", "details", "gifts", "rsvp", "wishes", "contacts", "prayer", "closing"],
});
