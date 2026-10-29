import { Blessing } from "../../runtime/sections";
import type { CoverProps } from "../types";
import { Backdrop, flightOf, Plane, Ticket } from "./art";

// A paper ticket jacket with the pass tucked inside, its top peeking out. On tap
// the pass slides up out of the jacket into its place on the page, and the jacket
// drops away. The pass here is the same Ticket the hero draws, so it lands exactly.

export function Cover({ r, onOpen }: CoverProps) {
  const bless = r.data.bismillah !== "none";
  return (
    <div
      className="bp-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <Backdrop />
      <div className={`bp-hero bp-hero-cover${bless ? " has-bless" : ""}`}>
        {bless && <Blessing r={r} className="bp-bless bp-bless-space" />}
        <div className="bp-stage">
          <Ticket r={r} className="bp-ticket-cover" />
          <div className="bp-sleeve">
            <div className="bp-sleeve-in">
              <span className="bp-sl-eyebrow">{r.t.youAreInvited}</span>
              <span className="bp-emblem">
                <svg viewBox="0 0 80 80" fill="none" aria-hidden>
                  <circle cx="40" cy="40" r="38" className="bp-em-ring" />
                  <circle cx="40" cy="40" r="31" className="bp-em-dots" />
                  <path d="M10 52C24 34 52 26 72 30" className="bp-em-path" />
                </svg>
                <Plane />
              </span>
              <p className="bp-sl-names">{r.names}</p>
              <span className="bp-sl-meta">{flightOf(r)}</span>
              <span className="bp-sl-tap">
                <svg viewBox="0 0 12 14" fill="none" aria-hidden>
                  <path d="M6 13V1.5M1.5 6 6 1.5 10.5 6" />
                </svg>
                {r.t.tapToOpen}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
