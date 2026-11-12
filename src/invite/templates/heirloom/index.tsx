import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import { ClosingSec, CountdownSec, DetailsSec, DressSec, EventsSec, GiftsSec, InviteSec, Portrait, ScheduleSec } from "./sections";

import "./heirloom.css";

// Heirloom: a salon wall of ivory panelling, and on it a gilded oval frame under a veil of
// silk. On the film (public/art/heirloom/open.*) the gold cord unties and the silk slips off;
// the couple's own photo then develops inside the frame (InviteData.photo, a sample until the
// host adds theirs) and the names appear on the panel below. The page under it is a walk
// through the salon (./sections.tsx), each surface answering the scroll.

export const heirloom = makePainted("heirloom", {
  cover: { kind: "film", art: "closed", hint: "dark" },
  // the panel under the frame
  text: { top: "60.2%", width: 300, glow: false },
  HeroArt: Portrait,
  stripY: null,
  panels: "clear",
  sections: { invite: InviteSec, countdown: CountdownSec, events: EventsSec, schedule: ScheduleSec, dress: DressSec, details: DetailsSec, gifts: GiftsSec, closing: ClosingSec },
  order: ["invite", "countdown", "events", "schedule", "dress", "details", "gifts", "rsvp", "wishes", "contacts", "prayer", "closing"],
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 12 });
  },
});
