import type { CoverProps } from "../types";
import { Valance } from "./art";

// The closed curtains fill the stage under the same valance the hero has. Tapping
// draws them apart: each half gathers towards its side (scaleX compresses the folds
// like real fabric bunching, a little skew lets the hem trail), then they melt into
// the tied-back swags of the hero while the spotlight comes up.

export function Cover({ r, onOpen }: CoverProps) {
  return (
    <div
      className="vv-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <div className="vv-cstage">
        <div className="vv-curtain vv-curtain-l" />
        <div className="vv-curtain vv-curtain-r" />
        <div className="vv-cover-glow" />
        <Valance />
        <span className="vv-tap">
          <i />
          {r.t.tapToOpen}
          <i />
        </span>
      </div>
    </div>
  );
}
