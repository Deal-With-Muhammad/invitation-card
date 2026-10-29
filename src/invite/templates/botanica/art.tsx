import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";

// Botanica: eucalyptus and olive painted in loose watercolour. Every branch is
// grown from a seeded generator at import, so server thumbnails and the live card
// draw exactly the same leaves. A leaf is four layers: a translucent wash, a
// darker pool of pigment along one side, a dried edge and a fine vein.

export type Pt = [number, number];
type Kind = "olive" | "euca";

const f = (n: number) => Math.round(n * 10) / 10;

/** mulberry32: small, fast, deterministic. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const bez = (p: Pt[], t: number): Pt => {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]];
};

const bezD = (p: Pt[], t: number): Pt => {
  const u = 1 - t;
  const a = 3 * u * u, b = 6 * u * t, c = 3 * t * t;
  return [
    a * (p[1][0] - p[0][0]) + b * (p[2][0] - p[1][0]) + c * (p[3][0] - p[2][0]),
    a * (p[1][1] - p[0][1]) + b * (p[2][1] - p[1][1]) + c * (p[3][1] - p[2][1]),
  ];
};

const pt = ([x, y]: Pt) => `${f(x)} ${f(y)}`;

export type Leaf = { wash: string; pool: string; vein: string; tone: number; op: number };
export type Built = { stem: string; leaves: Leaf[]; fruit: { x: number; y: number; rx: number; ry: number; a: number }[]; twigs: string; berries: Pt[]; base: Pt };

/** One leaf, base at `at`, pointing along `ang`. `bend` curls it sideways. */
function leaf(at: Pt, ang: number, len: number, wid: number, bend: number, kind: Kind, tone: number, op: number): Leaf {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const by = (x: number) => (bend * x * x) / len;
  const W = (x: number, y: number): Pt => {
    const yy = y + by(x);
    return [at[0] + x * c - yy * s, at[1] + x * s + yy * c];
  };
  const L = len;
  const up: Pt[] =
    kind === "olive"
      ? [W(0.22 * L, -1.05 * wid), W(0.62 * L, -0.95 * wid), W(L, 0)]
      : [W(0.02 * L, -1.12 * wid), W(0.84 * L, -1.2 * wid), W(L, 0)];
  const lo: Pt[] =
    kind === "olive"
      ? [W(0.66 * L, 0.9 * wid), W(0.24 * L, 1.02 * wid), W(0, 0)]
      : [W(0.9 * L, 1.1 * wid), W(0.06 * L, 1.08 * wid), W(0, 0)];
  const o = W(0, 0);
  const wash = `M${pt(o)}C${pt(up[0])} ${pt(up[1])} ${pt(up[2])}C${pt(lo[0])} ${pt(lo[1])} ${pt(lo[2])}Z`;
  // The centre line of a bent leaf is the parabola y = bend·x²/len: a quadratic
  // from base to tip with its control point at the middle of the chord.
  const pool = `M${pt(o)}C${pt(up[0])} ${pt(up[1])} ${pt(up[2])}Q${pt(W(L / 2, -by(L / 2)))} ${pt(o)}Z`;
  const x0 = 0.06 * L;
  const x1 = 0.86 * L;
  const xm = (x0 + x1) / 2;
  const ym = by(x0) + ((2 * bend * x0) / len) * (xm - x0);
  const vein = `M${pt(W(x0, 0))}Q${pt(W(xm, ym - by(xm)))} ${pt(W(x1, 0))}`;
  return { wash, pool, vein, tone, op };
}

/** A tapered stem: offset both sides of the curve and close the outline. */
function stemPath(p: Pt[], w0: number, w1: number) {
  const N = 22;
  const l: Pt[] = [];
  const r: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [x, y] = bez(p, t);
    const [dx, dy] = bezD(p, t);
    const m = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * t) / 2;
    l.push([x - (dy / m) * w, y + (dx / m) * w]);
    r.push([x + (dy / m) * w, y - (dx / m) * w]);
  }
  return `M${l.map(pt).join("L")}L${r.reverse().map(pt).join("L")}Z`;
}

export type Spec = {
  p: Pt[];
  kind: Kind;
  /** Leaf positions along the stem (pairs for eucalyptus). */
  n: number;
  size: number;
  seed: number;
  /** Olives tucked into the axils. */
  fruit?: number;
  /** Stem width at the base. */
  w?: number;
  /** Seeded eucalyptus: small berry twigs. [t, side] */
  twigs?: [number, number][];
  /** Where along the stem the first leaf grows (0–1). */
  from?: number;
};

export function grow(b: Spec): Built {
  const r = rng(b.seed);
  const leaves: Leaf[] = [];
  const fruit: Built["fruit"] = [];
  let twigs = "";
  const berries: Pt[] = [];
  const w0 = b.w ?? (b.kind === "olive" ? 1.5 : 1.7) * Math.sqrt(b.size);
  const tones = b.kind === "olive" ? [0, 1, 1, 0, 1, 3] : [2, 2, 1, 3, 2, 0];
  const pick = () => tones[Math.floor(r() * tones.length)];
  const opacity = () => f(0.58 + r() * 0.3);

  const t0 = b.from ?? 0.1;
  for (let i = 0; i < b.n; i++) {
    const t = Math.min(0.95, t0 + ((0.94 - t0) * i) / Math.max(1, b.n - 1) + (r() - 0.5) * 0.04);
    const at = bez(b.p, t);
    const [dx, dy] = bezD(b.p, t);
    const a = Math.atan2(dy, dx);
    const scale = b.size * (1 - 0.42 * t) * (0.88 + r() * 0.24);
    if (b.kind === "olive") {
      const side = i % 2 === 0 ? 1 : -1;
      const spread = (0.5 + r() * 0.32) * side;
      const len = 31 * scale;
      leaves.push(leaf(at, a + spread, len, len * (0.12 + r() * 0.03), (r() - 0.5) * 0.22 - side * 0.06, "olive", pick(), opacity()));
      if (b.fruit && i % 3 === 1 && fruit.length < b.fruit) {
        const fa = a - spread * 1.4;
        const d = 5.4 * scale;
        fruit.push({ x: f(at[0] + Math.cos(fa) * d), y: f(at[1] + Math.sin(fa) * d), rx: f(3.6 * scale), ry: f(4.8 * scale), a: f((fa * 180) / Math.PI + 90) });
      }
    } else {
      // eucalyptus: round leaves in opposite pairs, turning slightly as they climb
      for (const side of [1, -1]) {
        const spread = (1.05 + r() * 0.35) * side;
        const len = 21 * scale * (0.92 + r() * 0.16);
        leaves.push(leaf(at, a + spread, len, len * (0.46 + r() * 0.06), (r() - 0.5) * 0.16, "euca", pick(), opacity()));
      }
    }
  }
  // a terminal bud continues the stem
  const tip = bez(b.p, 1);
  const [tdx, tdy] = bezD(b.p, 1);
  const ta = Math.atan2(tdy, tdx);
  if (b.kind === "olive") leaves.push(leaf(tip, ta + 0.08, 17 * b.size, 2.2 * b.size, 0.05, "olive", 1, 0.8));
  else leaves.push(leaf(tip, ta, 11 * b.size, 5 * b.size, 0, "euca", 3, 0.8));

  for (const [tt, side] of b.twigs ?? []) {
    const at = bez(b.p, tt);
    const [dx, dy] = bezD(b.p, tt);
    const a = Math.atan2(dy, dx) + side * 0.75;
    const len = 26 * b.size;
    const end: Pt = [at[0] + Math.cos(a) * len, at[1] + Math.sin(a) * len];
    const mid: Pt = [at[0] + Math.cos(a - side * 0.2) * len * 0.55, at[1] + Math.sin(a - side * 0.2) * len * 0.55];
    twigs += `M${pt(at)}Q${pt(mid)} ${pt(end)}`;
    for (let k = 0; k < 4; k++) {
      const ka = a + (k - 1.5) * 0.7;
      const kl = 6 * b.size;
      const ke: Pt = [end[0] + Math.cos(ka) * kl, end[1] + Math.sin(ka) * kl];
      twigs += `M${pt(end)}L${pt(ke)}`;
      berries.push([f(ke[0]), f(ke[1])]);
    }
  }

  return { stem: stemPath(b.p, w0, 0.45), leaves, fruit, twigs, berries, base: b.p[0] };
}

export const WASH = ["bt-w1", "bt-w2", "bt-w3", "bt-w4"];

/** One painted branch. Leaves behind the stem first, then the stem, then fruit. */
export function Branch({ b }: { b: Built }) {
  return (
    <>
      {b.leaves.map((l, i) => (
        <g key={i}>
          <path d={l.wash} className={`bt-wash ${WASH[l.tone]}`} fillOpacity={l.op} />
          <path d={l.pool} className="bt-pool" />
          <path d={l.vein} className="bt-vein" />
        </g>
      ))}
      {b.stem && <path d={b.stem} className="bt-stem" />}
      {b.twigs && <path d={b.twigs} className="bt-twig" />}
      {b.berries.map(([x, y], i) => (
        <circle key={`b${i}`} cx={x} cy={y} r={1.9 + (i % 3) * 0.35} className="bt-berry" />
      ))}
      {b.fruit.map((o, i) => (
        <g key={`f${i}`}>
          <ellipse cx={+(o.x).toFixed(2)} cy={+(o.y).toFixed(2)} rx={+(o.rx).toFixed(2)} ry={+(o.ry).toFixed(2)} transform={`rotate(${o.a} ${o.x} ${o.y})`} className="bt-olive" />
          <circle cx={f(o.x - o.rx * 0.32)} cy={f(o.y - o.ry * 0.3)} r={f(o.rx * 0.28)} className="bt-shine" />
        </g>
      ))}
    </>
  );
}

/** The heart of a spray: big leaves fanned from one point, so the corner reads lush. */
function heart(at: Pt, from: number, to: number, seed: number, scale: number): Built {
  const r = rng(seed);
  const leaves: Leaf[] = [];
  const steps = 7;
  for (let i = 0; i < steps; i++) {
    const a = from + ((to - from) * (i + r() * 0.4)) / steps;
    const euca = i % 2 === 0;
    const len = (euca ? 30 : 46) * scale * (0.9 + r() * 0.25);
    leaves.push(
      euca
        ? leaf(at, a, len, len * 0.48, (r() - 0.5) * 0.16, "euca", [1, 2, 2][i % 3], f(0.66 + r() * 0.24))
        : leaf(at, a, len, len * 0.15, (r() - 0.5) * 0.24, "olive", [0, 1][i % 2], f(0.7 + r() * 0.2)),
    );
  }
  return { stem: "", leaves, fruit: [], twigs: "", berries: [], base: at };
}

// ── the two corner sprays of the hero (270 × 330 boxes) ──

const TOP_LEFT = [
  { p: [[-4, 46], [44, 8], [110, -8], [196, -4]], kind: "euca", n: 6, size: 1.3, seed: 29 },
  { p: [[18, -8], [0, 96], [10, 196], [42, 276]], kind: "euca", n: 9, size: 1.5, seed: 23 },
  { p: [[-8, 28], [74, 4], [166, 14], [252, 74]], kind: "olive", n: 16, size: 1.5, seed: 11, fruit: 3 },
  { p: [[8, 26], [36, 84], [52, 132], [56, 190]], kind: "olive", n: 8, size: 1.12, seed: 5 },
  { p: [[10, 22], [62, 44], [114, 60], [172, 66]], kind: "euca", n: 5, size: 1.12, seed: 41, twigs: [[0.55, -1]] },
  { p: [[4, 8], [50, 42], [92, 78], [128, 132]], kind: "olive", n: 9, size: 1.2, seed: 37, fruit: 2 },
  { p: [[0, 2], [28, 22], [56, 50], [78, 88]], kind: "euca", n: 4, size: 1.3, seed: 3, twigs: [[0.8, 1]] },
] satisfies Spec[];

const BOTTOM_RIGHT = [
  { p: [[252, 340], [272, 252], [254, 162], [210, 98]], kind: "euca", n: 7, size: 1.35, seed: 67 },
  { p: [[278, 304], [200, 324], [122, 318], [50, 280]], kind: "olive", n: 13, size: 1.35, seed: 53, fruit: 2 },
  { p: [[262, 312], [214, 298], [170, 292], [118, 296]], kind: "euca", n: 5, size: 1.05, seed: 83, twigs: [[0.5, 1]] },
  { p: [[266, 302], [246, 260], [234, 222], [232, 176]], kind: "olive", n: 7, size: 1.02, seed: 9 },
  { p: [[266, 324], [228, 294], [194, 264], [162, 216]], kind: "olive", n: 8, size: 1.12, seed: 71, fruit: 2 },
  { p: [[270, 330], [246, 310], [222, 300], [196, 296]], kind: "euca", n: 3, size: 1.2, seed: 89 },
] satisfies Spec[];

const TL = [...TOP_LEFT.map((s) => grow(s as Spec)), heart([14, 12], -0.1, 1.75, 211, 1.15)];
const BR = [...BOTTOM_RIGHT.map((s) => grow(s as Spec)), heart([258, 318], Math.PI - 0.1, Math.PI + 1.7, 223, 1.05)];

export function Spray({ corner, className = "" }: { corner: "tl" | "br"; className?: string }) {
  const list = corner === "tl" ? TL : BR;
  return (
    <svg className={`bt-spray bt-${corner} ${className}`} viewBox="0 0 270 330" fill="none" aria-hidden>
      {list.map((b, i) => (
        <g key={i}>
          <Branch b={b} />
        </g>
      ))}
    </svg>
  );
}

// ── small pieces ──

const SPRIG_OLIVE = grow({ p: [[14, 26], [58, 12], [110, 10], [164, 20]], kind: "olive", n: 9, size: 0.7, seed: 101, fruit: 1, w: 1.1 });
const SPRIG_EUCA = grow({ p: [[18, 28], [58, 12], [112, 8], [160, 20]], kind: "euca", n: 4, size: 0.72, seed: 113, w: 1.1, from: 0.16, twigs: [[0.7, 1]] });

export function Divider({ index }: { index: number }) {
  return (
    <svg className="bt-divider" viewBox="0 0 180 40" fill="none" aria-hidden>
      <Branch b={index % 2 === 0 ? SPRIG_OLIVE : SPRIG_EUCA} />
    </svg>
  );
}

const ORN_L = leaf([30, 9], Math.PI + 0.32, 18, 2.6, 0.1, "olive", 0, 0.85);
const ORN_R = leaf([34, 9], -0.32, 18, 2.6, -0.1, "olive", 1, 0.85);

export function Ornament() {
  return (
    <svg className="bt-orn" viewBox="0 0 64 18" fill="none" aria-hidden>
      {[ORN_L, ORN_R].map((l, i) => (
        <g key={i}>
          <path d={l.wash} className={`bt-wash ${WASH[l.tone]}`} fillOpacity={l.op} />
          <path d={l.pool} className="bt-pool" />
          <path d={l.vein} className="bt-vein" />
        </g>
      ))}
      <circle cx="32" cy="9" r="1.9" className="bt-olive" />
    </svg>
  );
}

export const initials = (names: string[]) => names.map((n) => n.trim().charAt(0).toUpperCase()).filter(Boolean);

export function Hero({ r }: HeroProps) {
  return (
    <div className="bt-hero">
      <div className="bt-card">
        <span className="bt-frame" aria-hidden />
        <div className="bt-in">
          <Blessing r={r} className="bt-a1" />
          <p className="bt-title bt-a2">{r.title}</p>
          <Names r={r} className="bt-names bt-a3" />
          {r.milestone && <p className="bt-milestone bt-a3">{r.milestone}</p>}
          <span className="bt-rule bt-a4" aria-hidden>
            <Ornament />
          </span>
          {r.when.date && (
            <div className="bt-when bt-a4">
              {r.when.weekday && <span>{r.when.weekday}</span>}
              <strong>{r.when.date}</strong>
              {r.when.time && <span>{r.when.time}</span>}
            </div>
          )}
          {r.main?.venue && r.oneVenue && <p className="bt-venue bt-a5">{r.main.venue}</p>}
        </div>
      </div>
      <Spray corner="tl" />
      <Spray corner="br" />
    </div>
  );
}

export function Backdrop() {
  return <div className="bt-bloom" />;
}
