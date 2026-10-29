// A small botanical drawing kit shared by the stationery designs. Every function
// returns SVG path data (strings), computed once at import, so server thumbnails and
// the live card draw exactly the same shapes. Shapes are built from point lists and
// smoothed, with a seeded generator for the "hand-drawn" irregularity.

export type Pt = [number, number];
export type Layer = { d: string; c: string };

export const f = (n: number) => Math.round(n * 10) / 10;
export const P = (p: Pt) => `${f(p[0])} ${f(p[1])}`;

/** Small seeded generator, so the "random" wobble is the same everywhere. */
export function rand(seed: number) {
  let s = Math.abs(Math.floor(seed)) % 2147483647 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const polar = (c: Pt, a: number, r: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];

/** A local frame at `b` facing angle `a`: at(t, s) is t along, s to the side. */
export const frame =
  (b: Pt, a: number) =>
  (t: number, s: number): Pt => [b[0] + Math.cos(a) * t - Math.sin(a) * s, b[1] + Math.sin(a) * t + Math.cos(a) * s];

/** Maps local points through rotation, squash (perspective) and a centre. */
export const place =
  (c: Pt, rot = 0, sy = 1, s = 1) =>
  (p: Pt): Pt => {
    const x = p[0] * s;
    const y = p[1] * s * sy;
    return [c[0] + x * Math.cos(rot) - y * Math.sin(rot), c[1] + x * Math.sin(rot) + y * Math.cos(rot)];
  };

/** A smooth curve through points (Catmull-Rom as cubic Béziers). */
export function smooth(pts: Pt[], closed = true, k = 1) {
  const n = pts.length;
  if (n < 2) return "";
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${P(pts[0])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k];
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k];
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return closed ? `${d}Z` : d;
}

export const circle = (c: Pt, r: number) =>
  `M${P([c[0] - r, c[1]])}a${f(r)} ${f(r)} 0 1 0 ${f(r * 2)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-r * 2)} 0Z`;

export const ellipse = (c: Pt, rx: number, ry: number, rot = 0) => {
  const pts: Pt[] = [];
  for (let i = 0; i < 16; i++) pts.push(place(c, rot)([Math.cos((i / 16) * Math.PI * 2) * rx, Math.sin((i / 16) * Math.PI * 2) * ry]));
  return smooth(pts);
};

// ── cubic helpers for stems ──

export type Curve = [Pt, Pt, Pt, Pt];

export const bez = ([a, b, c, d]: Curve, t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ];
};

export const bezAngle = ([a, b, c, d]: Curve, t: number) => {
  const u = 1 - t;
  const dx = 3 * u * u * (b[0] - a[0]) + 6 * u * t * (c[0] - b[0]) + 3 * t * t * (d[0] - c[0]);
  const dy = 3 * u * u * (b[1] - a[1]) + 6 * u * t * (c[1] - b[1]) + 3 * t * t * (d[1] - c[1]);
  return Math.atan2(dy, dx);
};

export const curve = ([a, b, c, d]: Curve) => `M${P(a)}C${P(b)} ${P(c)} ${P(d)}`;

/** A stem drawn as a filled taper (thick at the base), so it reads as painted. */
export function stem(cv: Curve, w0: number, w1 = w0 * 0.35) {
  const n = 14;
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = bez(cv, t);
    const a = bezAngle(cv, t) + Math.PI / 2;
    const w = (w0 + (w1 - w0) * t) / 2;
    L.push(polar(p, a, w));
    R.push(polar(p, a, -w));
  }
  return smooth([...L, ...R.reverse()], true, 0.9);
}

// ── petals and leaves ──

type PetalOpts = { notch?: number; round?: number; widest?: number; skew?: number; teeth?: number };

/**
 * One petal from `b` pointing along `a`. round: 0 pointed … 1 broad; widest: where the
 * petal is widest (0–1 of its length); notch: depth of a cherry-blossom notch;
 * teeth: a serrated tip (cosmos, cornflower).
 */
export function petal(b: Pt, a: number, len: number, w: number, o: PetalOpts = {}) {
  const at = frame(b, a);
  const round = o.round ?? 0.6;
  const wd = o.widest ?? 0.62;
  const sk = (o.skew ?? 0) * w;
  const tipW = w * (0.15 + round * 0.75);
  if (o.teeth) {
    const n = o.teeth;
    let d = `M${P(b)}C${P(at(len * wd * 0.55, w * 0.9))} ${P(at(len * wd, w))} ${P(at(len * 0.93, tipW + sk))}`;
    for (let i = 0; i < n; i++) {
      const s0 = tipW - (i / n) * tipW * 2 + sk;
      const s1 = tipW - ((i + 1) / n) * tipW * 2 + sk;
      const mid = (s0 + s1) / 2;
      d += `L${P(at(len, mid))}L${P(at(len * (i === n - 1 ? 0.93 : 0.9), s1))}`;
    }
    d += `C${P(at(len * wd, -w))} ${P(at(len * wd * 0.55, -w * 0.9))} ${P(b)}Z`;
    return d;
  }
  if (o.notch) {
    const nt = at(len * (1 - o.notch), sk);
    return (
      `M${P(b)}C${P(at(len * wd * 0.5, w * 1.05))} ${P(at(len * 1.02, w * 0.95 + sk))} ${P(at(len * 0.99, w * 0.28 + sk))}` +
      `Q${P(at(len * 0.98, w * 0.06 + sk))} ${P(nt)}Q${P(at(len * 0.98, -w * 0.06 + sk))} ${P(at(len * 0.99, -w * 0.28 + sk))}` +
      `C${P(at(len * 1.02, -w * 0.95 + sk))} ${P(at(len * wd * 0.5, -w * 1.05))} ${P(b)}Z`
    );
  }
  const tip = at(len, sk);
  return (
    `M${P(b)}C${P(at(len * wd * 0.55, w * 1.08))} ${P(at(len * (0.86 + round * 0.12), tipW + sk))} ${P(tip)}` +
    `C${P(at(len * (0.86 + round * 0.12), -tipW + sk))} ${P(at(len * wd * 0.55, -w * 1.08))} ${P(b)}Z`
  );
}

/** A plain leaf blade. bend curls it sideways. */
export function leaf(b: Pt, a: number, len: number, w: number, bend = 0) {
  const at = frame(b, a);
  const tip = at(len, bend * w * 1.6);
  return (
    `M${P(b)}C${P(at(len * 0.25, w * 1.1 + bend * w * 0.4))} ${P(at(len * 0.72, w * 0.9 + bend * w * 1.4))} ${P(tip)}` +
    `C${P(at(len * 0.7, -w * 0.75 + bend * w * 1.3))} ${P(at(len * 0.28, -w * 1.05 + bend * w * 0.3))} ${P(b)}Z`
  );
}

/** The centre vein of `leaf`. */
export function vein(b: Pt, a: number, len: number, w: number, bend = 0) {
  const at = frame(b, a);
  return `M${P(at(len * 0.04, 0))}Q${P(at(len * 0.55, bend * w * 0.9))} ${P(at(len * 0.9, bend * w * 1.45))}`;
}

/** Side veins of a leaf, for line-drawn and foil leaves. */
export function sideVeins(b: Pt, a: number, len: number, w: number, bend = 0, n = 4) {
  const at = frame(b, a);
  let d = "";
  for (let i = 1; i <= n; i++) {
    const t = 0.15 + (i / (n + 1)) * 0.7;
    const m = at(len * t, bend * w * 1.2 * t);
    for (const s of [1, -1]) d += `M${P(m)}Q${P(at(len * (t + 0.08), s * w * 0.4 + bend * w * t))} ${P(at(len * (t + 0.16), s * w * 0.7 + bend * w * t))}`;
  }
  return d;
}

/** One side of a serrated leaflet, between the edge and the vein (for shading). */
export function serratedHalf(b: Pt, a: number, len: number, w: number, seed: number) {
  const r = rand(seed);
  const at = frame(b, a);
  const n = 9;
  let d = `M${P(b)}`;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const half = Math.sin(Math.PI * Math.pow(t, 0.8)) * w;
    d += `L${P(at(len * (t - 0.035), half * 0.9))}L${P(at(len * t, half * (1.06 + r() * 0.06)))}`;
  }
  return `${d}L${P(at(len, 0))}Z`;
}

/** A serrated rose leaflet. */
export function serrated(b: Pt, a: number, len: number, w: number, seed: number) {
  const r = rand(seed);
  const at = frame(b, a);
  const n = 9;
  const side = (s: number) => {
    const pts: Pt[] = [];
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const half = Math.sin(Math.PI * Math.pow(t, 0.8)) * w;
      pts.push(at(len * (t - 0.035), s * half * 0.9));
      pts.push(at(len * t, s * half * (1.06 + r() * 0.06)));
    }
    return pts;
  };
  const R = side(1);
  const L = side(-1).reverse();
  let d = `M${P(b)}`;
  for (const p of R) d += `L${P(p)}`;
  d += `L${P(at(len, 0))}`;
  for (const p of L) d += `L${P(p)}`;
  return `${d}Z`;
}

// ── flowers ──

/** Five notched petals, a centre and stamens: cherry / plum blossom. */
export function blossom(c: Pt, R: number, rot: number, seed: number, o: { petals?: number; notch?: number } = {}) {
  const r = rand(seed);
  const n = o.petals ?? 5;
  let petals = "";
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2 + (r() - 0.5) * 0.16;
    petals += petal(polar(c, a, R * 0.08), a, R * (0.92 + r() * 0.12), R * (0.44 + r() * 0.05), { notch: o.notch ?? 0.12, round: 0.9 });
  }
  let stamens = "";
  const dots: Pt[] = [];
  for (let i = 0; i < 9; i++) {
    const a = rot + (i / 9) * Math.PI * 2 + r() * 0.3;
    const e = polar(c, a, R * (0.38 + r() * 0.12));
    stamens += `M${P(polar(c, a, R * 0.12))}L${P(e)}`;
    dots.push(e);
  }
  return { petals, center: circle(c, R * 0.15), stamens, dots: dots.map((p) => circle(p, R * 0.055)).join("") };
}

/**
 * A layered bloom seen from above: petals spiral in from the outside as crescents,
 * each one tucked under the next, light at the rim and deep at the heart. Returns
 * tone layers (fa outer … fd centre) plus the petal edges (fl).
 */
function bloom(c: Pt, R: number, seed: number, rot: number, sy: number, o: { n: number; ruffle: number; cup: number; open: number }): Layer[] {
  const r = rand(seed);
  const map = place(c, rot, sy, R);
  const tone: Record<string, string> = { fa: "", fb: "", fc: "", fd: "" };
  let edges = "";
  let shade = "";
  // a base so the paper never shows through between petals
  const base: Pt[] = [];
  for (let i = 0; i < 18; i++) base.push(polar([0, 0], (i / 18) * Math.PI * 2, 0.62 + (r() - 0.5) * 0.08));
  tone.fb += smooth(base.map(map));
  for (let i = o.n - 1; i >= 0; i--) {
    const k = i / (o.n - 1);
    const rr = 0.08 + 0.92 * Math.pow(k, o.open);
    const a = i * 2.39996 + r() * 0.35;
    const sp = 0.5 + 0.8 * k + (r() - 0.5) * 0.15;
    const m = 12;
    const outer: Pt[] = [];
    const ph = r() * 6;
    for (let j = 0; j <= m; j++) {
      const t = j / m;
      const aa = a - sp + 2 * sp * t;
      const frill = Math.sin(t * 13 + ph) * o.ruffle * k + (r() - 0.5) * o.ruffle * 0.6;
      outer.push(polar([0, 0], aa, rr * (1 + 0.05 * Math.sin(Math.PI * t) + frill)));
    }
    const off = polar([0, 0], a + Math.PI, rr * o.cup);
    const inner: Pt[] = [];
    for (let j = m; j >= 0; j--) {
      const t = j / m;
      inner.push(polar(off, a - sp * 0.82 + 1.64 * sp * t, rr * (0.55 + o.cup * 0.4)));
    }
    const cls = k > 0.72 ? "fa" : k > 0.42 ? "fb" : k > 0.16 ? "fc" : "fd";
    tone[cls] += smooth([...outer, ...inner].map(map));
    // where the petal curls under the next one in: a soft band of shadow
    const band: Pt[] = [];
    for (let j = 0; j <= m; j++) {
      const t = j / m;
      band.push(polar(off, a - sp * 0.8 + 1.6 * sp * t, rr * (0.55 + o.cup * 0.4) * (1.16 + Math.sin(Math.PI * t) * 0.12)));
    }
    shade += smooth([...band, ...inner.slice(1, m)].map(map));
    if (k > 0.1) edges += smooth(outer.slice(2, m - 1).map(map), false);
  }
  return [
    { d: tone.fa, c: "fa" },
    { d: tone.fb, c: "fb" },
    { d: tone.fc, c: "fc" },
    { d: tone.fd, c: "fd" },
    { d: shade, c: "fs" },
    { d: edges, c: "fl" },
  ];
}

/** A garden rose from above (or tilted with sy < 1). */
export const rose = (c: Pt, R: number, seed: number, rot = 0, sy = 0.86) => bloom(c, R, seed, rot, sy, { n: 24, ruffle: 0.014, cup: 0.42, open: 0.72 });

/** A peony: more, looser, ruffled petals. */
export const peony = (c: Pt, R: number, seed: number, rot = 0, sy = 0.84) => bloom(c, R, seed, rot, sy, { n: 30, ruffle: 0.07, cup: 0.36, open: 0.62 });

/** A small rosebud: a closed cup with sepals. a points from the stem to the tip. */
export function bud(b: Pt, a: number, len: number, seed: number): Layer[] {
  const r = rand(seed);
  const at = frame(b, a);
  const w = len * 0.42;
  const body = smooth([at(0, 0), at(len * 0.25, w * 0.9), at(len * 0.75, w * 0.85), at(len * 1.02, w * 0.12), at(len * 0.98, -w * 0.2), at(len * 0.7, -w * 0.9), at(len * 0.25, -w * 0.85)]);
  const fold = `M${P(at(len * 0.3, w * 0.7))}Q${P(at(len * 0.75, w * 0.2))} ${P(at(len * 0.97, -w * 0.15))}`;
  let sepals = "";
  for (const s of [-1, 1, -0.2]) sepals += leaf(at(len * 0.05, 0), a + s * (0.6 + r() * 0.2), len * (0.65 + r() * 0.15), len * 0.08, -s * 0.4);
  return [
    { d: body, c: "fb" },
    { d: smooth([at(len * 0.35, w * 0.1), at(len * 0.8, w * 0.55), at(len * 1.0, w * 0.1), at(len * 0.8, -w * 0.3)]), c: "fc" },
    { d: fold, c: "fl" },
    { d: sepals, c: "lb" },
  ];
}

/** Lily-of-the-valley bell hanging from `top`, opening downward. */
export function bell(top: Pt, h: number, rot = 0) {
  const map = place(top, rot, 1, h);
  const pts: Pt[] = [
    [0, 0],
    [0.28, 0.08],
    [0.46, 0.42],
    [0.56, 0.78],
    [0.66, 0.92],
    [0.42, 0.88],
    [0.3, 1.0],
    [0.12, 0.9],
    [0, 1.02],
    [-0.12, 0.9],
    [-0.3, 1.0],
    [-0.42, 0.88],
    [-0.66, 0.92],
    [-0.56, 0.78],
    [-0.46, 0.42],
    [-0.28, 0.08],
  ];
  return smooth(pts.map(map), true, 0.85);
}

/** A cosmos / daisy style flower with n petals. */
export function rayFlower(c: Pt, R: number, n: number, seed: number, o: { teeth?: number; w?: number; rot?: number; sy?: number; round?: number } = {}) {
  const r = rand(seed);
  const map = place(c, o.rot ?? 0, o.sy ?? 1);
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.12;
    const len = R * (0.9 + r() * 0.15);
    const w = R * (o.w ?? 0.24) * (0.9 + r() * 0.2);
    const p = petal([0, 0], a, len, w, { teeth: o.teeth, round: o.round ?? 0.8, widest: 0.7 });
    d += mapPath(p, map);
  }
  return d;
}

/** Five round overlapping petals: buttercup / forget-me-not / wild rose. */
export function cupFlower(c: Pt, R: number, seed: number, n = 5, rot = 0) {
  const r = rand(seed);
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2 + (r() - 0.5) * 0.15;
    d += petal(polar(c, a, R * 0.05), a, R * (0.95 + r() * 0.1), R * 0.58, { round: 1, widest: 0.6 });
  }
  return d;
}

/** Four crinkled poppy petals. */
export function poppy(c: Pt, R: number, seed: number, rot = 0, sy = 0.92): Layer[] {
  const r = rand(seed);
  const map = place(c, rot, sy, R);
  let back = "";
  let front = "";
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4 + (r() - 0.5) * 0.3;
    const pts: Pt[] = [];
    const m = 12;
    for (let j = 0; j <= m; j++) {
      const t = j / m;
      const aa = a - 0.95 + 1.9 * t;
      const rr = 1 * (1 + Math.sin(t * 19 + i) * 0.035 + (r() - 0.5) * 0.05) * (0.86 + Math.sin(t * Math.PI) * 0.14);
      pts.push(polar([0, 0], aa, rr));
    }
    pts.push([0, 0]);
    const d = smooth(pts.map(map));
    if (i % 2) front += d;
    else back += d;
  }
  let stamens = "";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    stamens += circle(map(polar([0, 0], a, 0.27)), R * 0.03);
  }
  return [
    { d: back, c: "fb" },
    { d: front, c: "fa" },
    { d: circle(c, R * 0.2), c: "fd" },
    { d: stamens, c: "fd" },
  ];
}

/** Moth orchid: three sepals, two broad petals, the lip and the column. */
export function orchid(c: Pt, R: number, rot = 0, seed = 1): Layer[] {
  const r = rand(seed);
  const map = place(c, rot, 1, R);
  const m = (d: string) => mapPath(d, map);
  const sepals =
    m(petal([0, 0], -Math.PI / 2 + (r() - 0.5) * 0.1, 0.92, 0.26, { round: 0.7, widest: 0.55 })) +
    m(petal([0, 0], Math.PI * 0.78, 0.88, 0.23, { round: 0.6 })) +
    m(petal([0, 0], Math.PI * 0.22, 0.88, 0.23, { round: 0.6 }));
  const petals = m(petal([0, 0], Math.PI * 1.02, 0.95, 0.5, { round: 1, widest: 0.65, skew: -0.15 })) + m(petal([0, 0], -0.02, 0.95, 0.5, { round: 1, widest: 0.65, skew: 0.15 }));
  const lip = m(
    smooth([
      [0, 0.12],
      [0.2, 0.18],
      [0.26, 0.36],
      [0.14, 0.46],
      [0.1, 0.62],
      [0, 0.7],
      [-0.1, 0.62],
      [-0.14, 0.46],
      [-0.26, 0.36],
      [-0.2, 0.18],
    ]),
  );
  const lobes = m(smooth([[0.12, 0.08], [0.34, 0.02], [0.32, 0.22], [0.16, 0.2]])) + m(smooth([[-0.12, 0.08], [-0.34, 0.02], [-0.32, 0.22], [-0.16, 0.2]]));
  let veins = "";
  for (const a of [Math.PI * 1.02, -0.02]) {
    for (const k of [-0.18, 0, 0.18]) {
      const at = frame([0, 0], a);
      veins += m(`M${P(at(0.12, 0))}Q${P(at(0.5, k * 0.9))} ${P(at(0.82, k * 1.6))}`);
    }
  }
  return [
    { d: sepals, c: "fa" },
    { d: petals, c: "fa" },
    { d: veins, c: "fl" },
    { d: lobes, c: "fc" },
    { d: lip, c: "fc" },
    { d: m(ellipse([0, 0.02], 0.08, 0.13)), c: "fd" },
  ];
}

/** A tulip seen from the side, cup up. b is where the stem meets the flower. */
export function tulip(b: Pt, h: number, a = -Math.PI / 2, seed = 1) {
  const r = rand(seed);
  const map = place(b, a + Math.PI / 2, 1, h);
  const side = (s: number) =>
    smooth([
      [0, 0],
      [s * 0.38, -0.1],
      [s * 0.5, -0.5],
      [s * (0.34 + r() * 0.06), -1.02],
      [s * 0.1, -0.7],
      [0, -0.2],
    ]).replace(/[\d.-]+ [\d.-]+/g, (pt) => {
      const [x, y] = pt.split(" ").map(Number);
      return P(map([x, y]));
    });
  const front = smooth(
    [
      [0, 0.02],
      [0.3, -0.12],
      [0.32, -0.62],
      [0.06, -1.06],
      [-0.04, -0.9],
      [-0.3, -0.62],
      [-0.3, -0.12],
    ].map((p) => map(p as Pt)),
  );
  return { back: side(1) + side(-1), front };
}

/** A lavender spike: small buds stacked up a stem, denser at the top. */
export function lavender(cv: Curve, n: number, size: number, seed: number) {
  const r = rand(seed);
  let buds = "";
  for (let i = 0; i < n; i++) {
    const t = 0.35 + (i / n) * 0.65;
    const p = bez(cv, t);
    const a = bezAngle(cv, t);
    for (const s of [-1, 1]) {
      const aa = a + s * (0.5 + r() * 0.3);
      buds += ellipse(polar(p, aa, size * 0.45), size * 0.55, size * 0.32, aa);
    }
  }
  return buds;
}

/** Re-maps every coordinate pair in a path (absolute commands only). */
export function mapPath(d: string, map: (p: Pt) => Pt) {
  return d.replace(/(-?\d*\.?\d+(?:e-?\d+)?) (-?\d*\.?\d+(?:e-?\d+)?)/g, (_, x, y) => P(map([Number(x), Number(y)])));
}

/** Sprinkles leaves along a stem curve, alternating sides. */
export function leavesAlong(cv: Curve, n: number, len: number, seed: number, o: { from?: number; to?: number; spread?: number; w?: number } = {}) {
  const r = rand(seed);
  const from = o.from ?? 0.1;
  const to = o.to ?? 0.95;
  let blades = "";
  let veins = "";
  for (let i = 0; i < n; i++) {
    const t = from + ((i + 0.3 * r()) / n) * (to - from);
    const side = i % 2 ? 1 : -1;
    const base = bez(cv, t);
    const a = bezAngle(cv, t) + side * ((o.spread ?? 0.75) + r() * 0.3);
    const l = len * (1 - t * 0.35) * (0.8 + r() * 0.35);
    const w = l * (o.w ?? 0.26);
    const bend = side * (0.15 + r() * 0.25);
    blades += leaf(base, a, l, w, bend);
    veins += vein(base, a, l, w, bend);
  }
  return { blades, veins };
}

// ── encoding for masks ──

/** An SVG as a CSS url(), for masks and backgrounds (no ids leak into the page). */
export function svgUrl(viewBox: string, body: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Shorthands for mask SVG bodies. */
export const fill = (d: string) => (d ? `<path d="${d}"/>` : "");
export const line = (d: string, w: number) => (d ? `<path d="${d}" fill="none" stroke="#000" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` : "");
export const hole = (d: string) => (d ? `<path d="${d}" fill-rule="evenodd"/>` : "");

/** A compound rose leaf: a stalk with paired serrated leaflets and one at the tip. */
export function roseLeaf(b: Pt, a: number, size: number, seed: number, pairs = 2): Layer[] {
  const r = rand(seed);
  const at = frame(b, a);
  const bend = (r() - 0.5) * 0.3;
  const cv: Curve = [b, at(size * 0.35, size * bend * 0.3), at(size * 0.7, size * bend * 0.6), at(size, size * bend)];
  let blades = "";
  let halves = "";
  let veins = "";
  const add = (p: Pt, ang: number, len: number) => {
    const sd = Math.floor(r() * 1e6);
    blades += serrated(p, ang, len, len * 0.38, sd);
    halves += serratedHalf(p, ang, len, len * 0.38, sd);
    veins += vein(p, ang, len, len * 0.38, 0);
  };
  for (let i = 0; i < pairs; i++) {
    const t = 0.3 + (i / Math.max(1, pairs)) * 0.45;
    const p = bez(cv, t);
    const ang = bezAngle(cv, t);
    const len = size * (0.42 + i * 0.06) * (0.9 + r() * 0.2);
    add(p, ang - 0.95 - r() * 0.2, len);
    add(p, ang + 0.95 + r() * 0.2, len);
  }
  add(cv[3], bezAngle(cv, 1), size * 0.55);
  return [
    { d: stem(cv, size * 0.026, size * 0.012), c: "lb" },
    { d: blades, c: "la" },
    { d: halves, c: "lb" },
    { d: veins, c: "lv" },
  ];
}

/** Little thorns along a stem. */
export function thorns(cv: Curve, n: number, size: number, seed: number) {
  const r = rand(seed);
  let d = "";
  for (let i = 0; i < n; i++) {
    const t = 0.1 + ((i + r() * 0.5) / n) * 0.8;
    const p = bez(cv, t);
    const a = bezAngle(cv, t);
    const s = i % 2 ? 1 : -1;
    const at = frame(p, a);
    d += `M${P(at(-size * 0.5, 0))}L${P(at(size * 0.6, s * size))}L${P(at(size * 0.5, 0))}Z`;
  }
  return d;
}

/** A rose drawn as engraved lines: a spiral heart and loose outer petals (stroke it). */
export function roseLine(c: Pt, R: number, rot = 0, seed = 1) {
  const r = rand(seed);
  const map = place(c, rot, 0.9, R);
  let d = "";
  // the spiral heart
  const sp: Pt[] = [];
  for (let i = 0; i <= 26; i++) {
    const t = i / 26;
    sp.push(polar([0, 0], t * Math.PI * 4.2, 0.06 + t * 0.5));
  }
  d += smooth(sp.map(map), false);
  // overlapping outer petals as open arcs
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + r() * 0.3;
    const arc: Pt[] = [];
    for (let j = 0; j <= 6; j++) {
      const t = j / 6;
      arc.push(polar([0, 0], a - 0.85 + 1.7 * t, (0.78 + Math.sin(t * Math.PI) * 0.22) * (0.95 + r() * 0.08)));
    }
    d += smooth(arc.map(map), false);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.6 + r() * 0.3;
    const arc: Pt[] = [];
    for (let j = 0; j <= 5; j++) arc.push(polar([0, 0], a - 0.7 + 1.4 * (j / 5), 0.62 + Math.sin((j / 5) * Math.PI) * 0.06));
    d += smooth(arc.map(map), false);
  }
  return d;
}

/** Outline of a closed shape for line art: the leaf outline plus its vein. */
export const leafLine = (b: Pt, a: number, len: number, w: number, bend = 0) => leaf(b, a, len, w, bend) + vein(b, a, len, w, bend);
