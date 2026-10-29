import type { CSSProperties } from "react";

import type { CoverProps } from "../types";
import { band } from "./art";

// The whole screen is sea: seven bands of water, lightest at the horizon, each
// with a foam line. A sand-dollar seal floats in the middle. On tap the seal
// slips under and the bands roll down and away one after another, swaying.

// Crest of each band, as a share of the screen height, and the way it sways.
const ROWS = [0, 0.13, 0.27, 0.41, 0.55, 0.69, 0.83];
const CRESTS = ROWS.map((_, i) => band(22, 9 + (i % 3) * 2, 150 + ((i * 41) % 80), i * 1.9, 70, 430));

const initials = (names: string[]) => names.map((n) => n.trim().charAt(0).toUpperCase()).filter(Boolean);

export function Cover({ r, onOpen }: CoverProps) {
  const ini = initials(r.people.map((p) => p.name));
  return (
    <div
      className="ss-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      {ROWS.map((top, i) => (
        <div
          key={i}
          className={`ss-wave ss-w${i}`}
          style={{ top: `${top * 100}%`, "--i": i, "--s": i % 2 ? 1 : -1 } as CSSProperties}
        >
          {i > 0 && (
            <svg viewBox="0 0 430 70" preserveAspectRatio="none" aria-hidden>
              <path d={CRESTS[i].fill} className="ss-water" />
              <path d={CRESTS[i].lace} className="ss-lace" vectorEffect="non-scaling-stroke" />
              <path d={CRESTS[i].foam} className="ss-foam" vectorEffect="non-scaling-stroke" />
            </svg>
          )}
        </div>
      ))}
      <div className="ss-seal">
        <svg viewBox="-22 -22 44 44" aria-hidden>
          <circle r="21" className="ss-seal-disc" />
          <circle r="19.2" className="ss-seal-ring" />
          <circle r="17.6" className="ss-seal-dots" />
          {[0, 1, 2, 3, 4].map((k) => (
            <path key={k} transform={`rotate(${-90 + k * 72})`} d="M5.4 0Q10 -2.9 14.6 0Q10 2.9 5.4 0Z" className="ss-seal-petal" />
          ))}
        </svg>
        <span className="ss-seal-ini">
          {ini.length > 1 ? (
            <>
              {ini[0]}
              <i>&amp;</i>
              {ini[1]}
            </>
          ) : (
            (ini[0] ?? "")
          )}
        </span>
        <span className="ss-seal-tap">{r.t.tapToOpen}</span>
      </div>
    </div>
  );
}
