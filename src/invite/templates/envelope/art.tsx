import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";

// Letterpress: a thick, deckle-edged card on envelope paper. The card is 320 × 512
// phone px at full size; everything on it is sized in --c (1/320 of its width).
// All geometry is computed once at import, so server thumbnails and the live card
// draw exactly the same outline.

type Pt = [number, number];

const f = (n: number) => Math.round(n * 10) / 10;
const f2 = (n: number) => Math.round(n * 100) / 100;

/** Small seeded generator, so the "random" deckle is the same everywhere. */
function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * A deckled outline as a clip-path polygon in % of the card box. Every point sits
 * inside the box. ax/ay: how deep the tearing goes, in % of width / height.
 */
function deckle(seed: number, ax: number, ay: number) {
  const r = rand(seed);
  const pts: string[] = [];
  const edge = (step: number, amp: number, put: (t: number, d: number) => void) => {
    const p1 = r() * 6.28;
    const p2 = r() * 6.28;
    for (let t = 0; t < 100; t += step * (0.55 + r() * 0.9)) {
      const wave = 0.52 + 0.26 * Math.sin(t * 0.23 + p1) + 0.16 * Math.sin(t * 0.71 + p2);
      put(t, amp * Math.min(1, Math.max(0.04, wave + (r() - 0.5) * 0.6)));
    }
  };
  edge(1.3, ay, (t, d) => pts.push(`${f2(t)}% ${f2(d)}%`));
  edge(0.82, ax, (t, d) => pts.push(`${f2(100 - d)}% ${f2(t)}%`));
  edge(1.3, ay, (t, d) => pts.push(`${f2(100 - t)}% ${f2(100 - d)}%`));
  edge(0.82, ax, (t, d) => pts.push(`${f2(d)}% ${f2(100 - t)}%`));
  return `polygon(${pts.join(",")})`;
}

const DECKLE = deckle(7, 1.05, 0.66);
const FRINGE = deckle(31, 0.5, 0.31);

// ── line-drawn botanicals ──

const cubic = (a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ];
};

const cubicAngle = (a: Pt, b: Pt, c: Pt, d: Pt, t: number) => {
  const u = 1 - t;
  const dx = 3 * u * u * (b[0] - a[0]) + 6 * u * t * (c[0] - b[0]) + 3 * t * t * (d[0] - c[0]);
  const dy = 3 * u * u * (b[1] - a[1]) + 6 * u * t * (c[1] - b[1]) + 3 * t * t * (d[1] - c[1]);
  return Math.atan2(dy, dx);
};

const P = (p: Pt) => `${f(p[0])} ${f(p[1])}`;

/** One willow-like leaf: an outline of two curves and a centre vein. */
function leaf(base: Pt, ang: number, len: number, w: number, bend: number) {
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  const at = (t: number, side: number): Pt => [base[0] + dx * len * t - dy * side, base[1] + dy * len * t + dx * side];
  const tip = at(1, bend * w);
  const outline = `M${P(base)}Q${P(at(0.42, w + bend * w))} ${P(tip)}Q${P(at(0.58, -w * 0.82 + bend * w))} ${P(base)}`;
  const vein = `M${P(at(0.08, 0))}Q${P(at(0.5, bend * w * 0.9))} ${P(at(0.82, bend * w * 0.95))}`;
  return outline + vein;
}

type Spray = { leaves: string; stems: string; berries: Pt[] };

/** A branch along a cubic stem with alternating leaves and a few berry stalks. */
function spray(a: Pt, b: Pt, c: Pt, d: Pt, seed: number, n: number, size: number, berryAt: number[]): Spray {
  const r = rand(seed);
  let leaves = "";
  let stems = `M${P(a)}C${P(b)} ${P(c)} ${P(d)}`;
  for (let i = 0; i < n; i++) {
    const t = 0.07 + ((i + 0.35 * r()) / n) * 0.86;
    const side = i % 2 ? 1 : -1;
    const base = cubic(a, b, c, d, t);
    const ang = cubicAngle(a, b, c, d, t) + side * (0.5 + r() * 0.3);
    const len = size * (1 - t * 0.42) * (0.85 + r() * 0.3);
    leaves += leaf(base, ang, len, len * 0.23, side * (0.3 + r() * 0.25));
  }
  // a terminal leaf on the tip
  const endAng = cubicAngle(a, b, c, d, 1);
  leaves += leaf(d, endAng, size * 0.52, size * 0.1, 0.25);
  const berries: Pt[] = [];
  for (const t of berryAt) {
    const base = cubic(a, b, c, d, t);
    const ang = cubicAngle(a, b, c, d, t) - 1.05;
    const len = size * 0.42;
    const end: Pt = [base[0] + Math.cos(ang) * len, base[1] + Math.sin(ang) * len];
    const mid: Pt = [base[0] + Math.cos(ang + 0.25) * len * 0.5, base[1] + Math.sin(ang + 0.25) * len * 0.5];
    stems += `M${P(base)}Q${P(mid)} ${P(end)}`;
    berries.push(end);
    for (const k of [-1, 1]) {
      const a2 = ang + k * 0.75;
      const e2: Pt = [end[0] - Math.cos(ang) * len * 0.22 + Math.cos(a2) * len * 0.34, end[1] - Math.sin(ang) * len * 0.22 + Math.sin(a2) * len * 0.34];
      stems += `M${P([end[0] - Math.cos(ang) * len * 0.22, end[1] - Math.sin(ang) * len * 0.22])}L${P(e2)}`;
      berries.push(e2);
    }
  }
  return { leaves, stems, berries };
}

// The corner sprig, drawn in a 150 × 110 box growing from the top-left corner.
const CORNER = spray([4, 8], [48, 6], [100, 22], [144, 54], 11, 7, 36, [0.33, 0.66]);
// The divider sprig, drawn in a 160 × 28 box, growing left to right.
const LINE = spray([8, 17], [48, 9], [104, 9], [148, 15], 5, 7, 18, [0.5]);

function SprigArt({ s }: { s: Spray }) {
  return (
    <>
      <path d={s.stems} className="lp-stem" />
      <path d={s.leaves} className="lp-leaf" />
      {s.berries.map(([x, y], i) => (
        <circle key={i} cx={f(x)} cy={f(y)} r={i % 3 === 0 ? 2.7 : 2.2} className="lp-berry" />
      ))}
    </>
  );
}

export function Sprig({ className = "" }: { className?: string }) {
  return (
    <svg className={`lp-sprig ${className}`} viewBox="0 0 150 110" fill="none" aria-hidden>
      <SprigArt s={CORNER} />
    </svg>
  );
}

/** The card itself: deckled stock, a blind plate mark, two sprigs and the type. */
export function Card({ r }: { r: HeroProps["r"] }) {
  const bism = r.data.bismillah !== "none";
  return (
    <div className="lp-card-wrap">
      <div className="lp-fringe" style={{ clipPath: FRINGE }} />
      <div className="lp-card" style={{ clipPath: DECKLE }}>
        <span className="lp-grain" />
        <span className="lp-plate" />
        <Sprig className="lp-sprig-a" />
        <Sprig className="lp-sprig-b" />
        <div className="lp-in">
          {bism && <Blessing r={r} className="lp-bless" />}
          <p className="lp-title">{r.title}</p>
          <Names r={r} className="lp-names" />
          {r.milestone && <p className="lp-milestone">{r.milestone}</p>}
          <svg className="lp-knot" viewBox="0 0 60 12" fill="none" aria-hidden>
            <path d="M2 6H22M38 6H58" className="lp-stem" />
            <path d={leaf([30, 6], Math.PI * 1.06, 8, 2.2, 0.2) + leaf([30, 6], -Math.PI * 0.06, 8, 2.2, -0.2)} className="lp-leaf" />
            <circle cx="30" cy="6" r="1.5" className="lp-berry" />
          </svg>
          {r.when.date && (
            <div className="lp-when">
              {r.when.weekday && <span className="lp-sc">{r.when.weekday}</span>}
              <strong>{r.when.date}</strong>
              {r.when.time && <span className="lp-sc">{r.when.time}</span>}
            </div>
          )}
          {r.main?.venue && r.oneVenue && <p className="lp-venue">{r.main.venue}</p>}
        </div>
      </div>
    </div>
  );
}

export function Hero({ r }: HeroProps) {
  return (
    <div className="lp-hero">
      <Card r={r} />
      <span className="lp-cue" aria-hidden>
        {r.t.scroll}
        <i />
      </span>
    </div>
  );
}

export function Divider({ index }: { index: number }) {
  return (
    <svg className={`lp-divider${index % 2 ? " is-flip" : ""}`} viewBox="0 0 160 28" fill="none" aria-hidden>
      <SprigArt s={LINE} />
    </svg>
  );
}

export function Ornament() {
  return (
    <svg className="lp-orn" viewBox="0 0 60 12" fill="none" aria-hidden>
      <path d="M4 6H22M38 6H56" className="lp-stem" />
      <path d={leaf([30, 6], Math.PI * 1.06, 8, 2.2, 0.2) + leaf([30, 6], -Math.PI * 0.06, 8, 2.2, -0.2)} className="lp-leaf" />
      <circle cx="30" cy="6" r="1.5" className="lp-berry" />
    </svg>
  );
}

export function Backdrop() {
  return (
    <>
      <div className="lp-paper" />
      <div className="lp-paper-grain" />
    </>
  );
}
