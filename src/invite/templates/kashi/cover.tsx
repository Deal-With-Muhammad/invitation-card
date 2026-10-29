import type { CSSProperties } from "react";

import type { CoverProps } from "../types";
import { Flower, Leaves } from "./art";
import { GRID, LOOSE, SMALL_FLOWER, SMALL_FLOWER_B, TILE } from "./geo";

// One big glazed tile, turned on its point like a diamond, painted with a Multani
// rosette; a few loose tiles lie around it. On a tap the loose tiles skid away and
// the big tile turns over and lifts off, revealing the panel underneath.

const initials = (names: string[]) => names.map((n) => n.trim().charAt(0).toUpperCase()).filter(Boolean);

function SmallTile({ dark, six }: { dark: boolean; six: boolean }) {
  return (
    <svg viewBox="-30 -30 60 60" fill="none" className={dark ? "ks-dark" : undefined} aria-hidden>
      <rect x="-28.5" y="-28.5" width="57" height="57" rx="4" className="ks-tilebody" />
      <rect x="-24" y="-24" width="48" height="48" rx="2.5" className="ks-tqline" />
      <Flower f={six ? SMALL_FLOWER_B : SMALL_FLOWER} />
    </svg>
  );
}

function BigTile() {
  const t = TILE;
  return (
    <svg viewBox="-122 -122 244 244" fill="none" aria-hidden>
      <rect x="-118" y="-118" width="236" height="236" rx="9" className="ks-tilebody ks-tilebody-big" />
      <rect x="-109" y="-109" width="218" height="218" rx="5" className="ks-tqline" />
      <Leaves l={t.edgeLeaves} />
      {t.corners.map((c, i) => (
        <g key={i}>
          <Leaves l={c.lv} tone="t" />
          <Flower f={c.fl} />
        </g>
      ))}
      <Flower f={t.big} />
      <Flower f={t.second} />
      <circle r="35" className="ks-glazefill ks-line-bold" />
      <circle r="30.5" className="ks-tqline" />
    </svg>
  );
}

export function Cover({ r, onOpen }: CoverProps) {
  const ini = initials(r.people.map((p) => p.name));
  return (
    <div
      className="ks-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <div className="ks-backing">
        <div className="ks-grid" style={{ ["--grid" as string]: GRID.url }} />
      </div>
      {LOOSE.map(([x, y, s, turn, dark], i) => {
        const l = Math.hypot(x, y) || 1;
        const style = {
          "--x": x,
          "--y": y,
          "--s": s,
          "--turn": `${turn}deg`,
          "--dx": `${((x / l) * 300).toFixed(1)}`,
          "--dy": `${((y / l) * 300).toFixed(1)}`,
          "--dl": `${(i * 0.045).toFixed(3)}s`,
        } as CSSProperties;
        return (
          <div key={i} className="ks-loose" style={style}>
            <SmallTile dark={dark} six={i % 2 === 1} />
          </div>
        );
      })}
      <div className="ks-big">
        <div className="ks-big-tile">
          <BigTile />
        </div>
        <span className="ks-mono">
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
      <span className="ks-tap">{r.t.tapToOpen}</span>
    </div>
  );
}
