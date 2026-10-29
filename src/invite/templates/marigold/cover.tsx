import type { CSSProperties } from "react";

import type { CoverProps } from "../types";
import { Flowers, Leaves, Toran } from "./art";
import { blooms, mangoLeaf, rng, ruffle } from "./geo";

// A curtain of marigold strings, orange and yellow by turns, hangs under a toran.
// A big marigold badge carries the initials. On a tap the strings rise in a wave
// from the middle outward, like a curtain going up.

const COUNT = 41;
const MID = (COUNT - 1) / 2;
const PITCH = 17;
const CYCLE = 6; // five flowers and a pair of leaves per tile
const TILE = PITCH * CYCLE;
const LEN = TILE * 14;

const initials = (names: string[]) => names.map((n) => n.trim().charAt(0).toUpperCase()).filter(Boolean);

const TILE_ART = (() => {
  const fl = blooms(Array.from({ length: CYCLE - 1 }, (_, i) => ({ x: 12, y: i * PITCH + 9, r: 10.8, seed: 900 + i * 3 })));
  const lv = [mangoLeaf(11, TILE - 13, 13, 62, 0.1), mangoLeaf(13, TILE - 13, 13, -62, -0.1)];
  return { fl, leaves: { leaf: lv.map((l) => l.leaf).join(""), rib: lv.map((l) => l.rib).join("") } };
})();

function StringPattern({ v }: { v: number }) {
  return (
    <pattern
      id={`mg-sp${v}`}
      patternUnits="userSpaceOnUse"
      width="24"
      height={TILE}
      patternTransform={v ? `translate(0 ${PITCH / 2 + PITCH * 3})` : undefined}
    >
      <Leaves l={TILE_ART.leaves} />
      <circle cx="12" cy={TILE - 9} r="2.6" className="mg-bead" />
      <Flowers b={TILE_ART.fl} tone={v ? "y" : "o"} />
    </pattern>
  );
}

function Strand({ i }: { i: number }) {
  const off = i - MID;
  const v = Math.abs(off) % 2;
  const style = { "--o": off, "--d": Math.abs(off) } as CSSProperties;
  return (
    <div className="mg-strand" style={style}>
      <svg viewBox="0 0 24 1500" fill="none" aria-hidden>
        <path d={`M12 0V${LEN + 6}`} className="mg-thread" />
        <rect x="0" y="0" width="24" height={LEN} fill={`url(#mg-sp${v})`} />
        <circle cx="12" cy={LEN + 5} r="3" className="mg-bead" />
        <path d={`M9.5 ${LEN + 7.5}l-2.2 13M12 ${LEN + 8}v14M14.5 ${LEN + 7.5}l2.2 13`} className="mg-tassel" />
      </svg>
    </div>
  );
}

const BADGE = (() => {
  const a = ruffle(0, 0, 94, 22, 0, rng(21));
  const b = ruffle(0, 0, 82, 20, 0.14, rng(22));
  const c = ruffle(0, 0, 73, 18, 0.05, rng(23));
  const dots = Array.from({ length: 40 }, (_, i) => {
    const t = (i / 40) * Math.PI * 2;
    return [Math.cos(t) * 57, Math.sin(t) * 57] as [number, number];
  });
  return { a, b, c, dots };
})();

export function Cover({ r, onOpen }: CoverProps) {
  const ini = initials(r.people.map((p) => p.name));
  return (
    <div
      className="mg-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <svg width="0" height="0" style={{ position: "absolute" }} fill="none" aria-hidden>
        <defs>
          <StringPattern v={0} />
          <StringPattern v={1} />
        </defs>
      </svg>
      <div className="mg-backing" />
      <div className="mg-curtain">
        {Array.from({ length: COUNT }, (_, i) => (
          <Strand key={i} i={i} />
        ))}
      </div>
      <div className="mg-valance">
        <Toran />
      </div>
      <div className="mg-badge">
        <svg viewBox="-100 -100 200 200" fill="none" aria-hidden>
          <path d={BADGE.a} className="mg-badge-a" />
          <path d={BADGE.b} className="mg-badge-b" />
          <path d={BADGE.c} className="mg-badge-a" />
          <circle r="64" className="mg-badge-disc" />
          <circle r="60" className="mg-badge-line" />
          {BADGE.dots.map(([x, y], i) => (
            <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r="1" className="mg-badge-dot" />
          ))}
        </svg>
        <span className="mg-mono">
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
        <span className="mg-tap">{r.t.tapToOpen}</span>
      </div>
    </div>
  );
}
