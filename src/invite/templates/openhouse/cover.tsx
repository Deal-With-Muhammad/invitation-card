import type { CoverProps } from "../types";
import { BushPlant, SnakePlant } from "./art";

// A close-up of the front door. A tap swings it inward on its hinges, warm light
// spills out, and the view walks through the doorway (scales up) and fades onto
// the house, where everything has just arrived.

export function Cover({ r, onOpen }: CoverProps) {
  const num = r.main?.day || "";
  return (
    <div
      className="oh-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <div className="oh-cv">
        <div className="oh-cv-wall" />
        <div className="oh-cv-lamp">
          <i className="oh-cv-lamp-glow" />
          <i className="oh-cv-lamp-shade" />
        </div>
        <div className="oh-cv-frame">
          <div className="oh-cv-inside">
            <i className="oh-cv-light" />
            <i className="oh-cv-floor" />
          </div>
          <div className="oh-cv-door">
            <div className="oh-cv-face">
              {num && <span className="oh-cv-num">{num}</span>}
              <span className="oh-cv-lites" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <i className="oh-cv-slot" />
              <i className="oh-cv-handle" />
              <i className="oh-cv-kick" />
            </div>
            <i className="oh-cv-edge" />
          </div>
        </div>
        <div className="oh-cv-step" />
        <div className="oh-cv-mat">
          <span>{r.t.tapToOpen}</span>
        </div>
        <svg className="oh-cv-plants" viewBox="0 0 390 140" preserveAspectRatio="xMidYMax meet" aria-hidden>
          <BushPlant x={34} y={140} s={1.5} />
          <SnakePlant x={356} y={140} s={1.45} />
        </svg>
      </div>
    </div>
  );
}
