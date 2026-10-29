import type { CoverProps } from "../types";
import { Backdrop, Scene } from "./art";

// The scroll, rolled up on its two rollers and tied with a ribbon, sits in the
// middle of the desk. A tap slips the ribbon off, the roll rises to where the
// hero's top roller is, the bottom roller drops and pulls the parchment open,
// and the cover fades onto the written-out hero underneath.

export function Cover({ r, onOpen }: CoverProps) {
  return (
    <div
      className="sc-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <div className="sc-cover-desk">
        <Backdrop />
      </div>
      <div className="sc-cover-in">
        <Scene r={r} cover />
      </div>
    </div>
  );
}
