import type { CoverProps } from "../types";
import { Backdrop, Scene } from "./art";

// The same sky as the hero, drawn again with the lanterns unlit (outline only) and
// hung a little higher. A tap lets them drop into place with a swing, the lights
// come on one by one, and the cover fades onto the hero, whose lanterns are lit.

export function Cover({ r, onOpen }: CoverProps) {
  return (
    <div
      className="ln-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <div className="ln-cover-sky">
        <Backdrop r={r} />
      </div>
      <div className="ln-cover-in">
        <Scene r={r} cover />
      </div>
    </div>
  );
}
