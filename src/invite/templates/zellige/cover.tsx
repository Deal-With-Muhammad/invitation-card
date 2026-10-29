import type { CSSProperties } from "react";

import type { CoverProps } from "../types";
import { Tiling } from "./art";
import { khatam, ROSETTE } from "./geo";

// A 16-fold girih rosette laid in glazed pieces over the middle of the screen,
// the initials at its heart. On a tap it unfolds: the shields go first, then the
// petals, then the star, each piece turning as it flies outward and fades.

const FLY = [230, 190, 160]; // how far each ring travels (star, petals, shields)
const START = [0.5, 0.3, 0.12]; // when each ring starts, in seconds

const initials = (names: string[]) => names.map((n) => n.trim().charAt(0).toUpperCase()).filter(Boolean);

export function Cover({ r, onOpen }: CoverProps) {
  const ini = initials(r.people.map((p) => p.name));
  const { pieces, E } = ROSETTE;
  const rim = Array.from({ length: 32 }, (_, i) => {
    const a = ((i + 0.5) / 32) * Math.PI * 2;
    return [Math.cos(a) * (E + 9), Math.sin(a) * (E + 9)] as [number, number];
  });
  return (
    <div
      className="zl-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <div className="zl-backing">
        <Tiling />
        <div className="zl-fade" />
      </div>
      <div className="zl-rose">
        <svg viewBox="-142 -142 284 284" fill="none" aria-hidden>
          <g className="zl-rim">
            <circle r={+(E + 4).toFixed(2)} className="zl-edge" />
            <circle r={+(E + 14).toFixed(2)} className="zl-hair" />
            {rim.map(([x, y], i) => (
              <path key={i} d={khatam(x, y, 2.4, (i / 32) * Math.PI * 2)} className="zl-gold" />
            ))}
          </g>
          {pieces.map((p, i) => {
            const dist = FLY[p.ring];
            const style = {
              "--tx": `${(Math.cos(p.a) * dist).toFixed(1)}px`,
              "--ty": `${(Math.sin(p.a) * dist).toFixed(1)}px`,
              "--rot": `${p.ring === 1 ? 150 : 110}deg`,
              "--dl": `${(START[p.ring] + p.k * 0.018).toFixed(3)}s`,
            } as CSSProperties;
            return <path key={i} d={p.d} className={`zl-piece zl-ring${p.ring}`} style={style} />;
          })}
          <g className="zl-heart">
            <circle r={+(ROSETTE.B * 0.86).toFixed(2)} className="zl-bgfill" />
            <circle r={+(ROSETTE.B * 0.86 - 4).toFixed(2)} className="zl-hair" />
          </g>
        </svg>
        <span className="zl-mono">
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
      </div>
      <span className="zl-tap">
        <svg viewBox="-6 -6 12 12" fill="none" aria-hidden>
          <path d={khatam(0, 0, 5.5)} className="zl-gold" />
        </svg>
        {r.t.tapToOpen}
        <svg viewBox="-6 -6 12 12" fill="none" aria-hidden>
          <path d={khatam(0, 0, 5.5)} className="zl-gold" />
        </svg>
      </span>
    </div>
  );
}
