import type { Resolved } from "../../resolve";
import { fall, PINK_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import { Chapters } from "./chapters";

import "./shagun.css";

// Shagun Box (a special design): a mother-of-pearl shagun box opens on film and four silk
// envelopes rise out of it, one per function. Below the names, every function is its own
// chapter on its own painted art (themes.ts), then RSVP, wishes and "Save as video".
// Made for Bilal & Muskan's all-functions invitation.

/** The couple's names in the calm silk above the closed box. */
function CoverNames({ r }: { r: Resolved }) {
  return (
    <div className="sg-cover-names" aria-hidden>
      <p>{r.title || r.occasionLabel}</p>
      <strong>{r.names}</strong>
    </div>
  );
}

export const shagun = makePainted("shagun", {
  cover: { kind: "film", art: "closed", hint: "dark", Extra: CoverNames },
  text: { top: "5%", width: 320 },
  stripY: null,
  sections: { events: Chapters },
  celebrate: (root) => {
    fall(root, { pieces: PINK_PETALS, count: 10, spread: 2.2, dur: [5, 8] });
    tapToThrow(root, ".pt-hero", { pieces: PINK_PETALS });
  },
});
