// Geometry for Sehra, computed once at import so server thumbnails and the live
// card draw exactly the same lines. Plain data and path strings, no React.

export type Pt = [number, number];
type Seg = [Pt, Pt, Pt]; // cubic: control 1, control 2, end

const f = (n: number) => Math.round(n * 100) / 100;

const bez = (a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ];
};

type Xf = (p: Pt) => Pt;

export const xf = (dx: number, dy: number, deg = 0, s = 1): Xf => {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a) * s;
  const si = Math.sin(a) * s;
  return ([x, y]) => [dx + x * c - y * si, dy + x * si + y * c];
};

const pathOf = (start: Pt, segs: Seg[], t: Xf, close = true) => {
  const p = t(start);
  let d = `M${f(p[0])} ${f(p[1])}`;
  for (const s of segs) {
    const [a, b, c] = s.map(t);
    d += `C${f(a[0])} ${f(a[1])} ${f(b[0])} ${f(b[1])} ${f(c[0])} ${f(c[1])}`;
  }
  return close ? `${d}Z` : d;
};

/** Points spread along a cubic outline, pushed `off` units outward from `centre`. */
function dotsAlong(start: Pt, segs: Seg[], every: number, off: number, centre: Pt, skip = 0): Pt[] {
  const pts: Pt[] = [];
  let prev = start;
  for (const s of segs) {
    for (let i = 1; i <= 24; i++) pts.push(bez(prev, s[0], s[1], s[2], i / 24));
    prev = s[2];
  }
  // resample by arc length
  const out: Pt[] = [];
  let acc = every * 0.5;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    acc += Math.hypot(x1 - x0, y1 - y0);
    if (acc >= every) {
      acc = 0;
      const dx = x1 - centre[0];
      const dy = y1 - centre[1];
      const l = Math.hypot(dx, dy) || 1;
      out.push([x1 + (dx / l) * off, y1 + (dy / l) * off]);
    }
  }
  return out.slice(skip, out.length - skip);
}

// ── the paisley (buta / kairi) ──
// Drawn pointing up with the tip curling to the right, body centred near (0, 12).

const PAISLEY_START: Pt = [0, 50];
const PAISLEY: Seg[] = [
  [[-30, 50], [-42, 27], [-40, 5]],
  [[-38, -20], [-22, -40], [0, -50]],
  [[12, -55], [24, -53], [25, -45]],
  [[26, -37], [18, -32], [12, -35]],
  [[24, -25], [39, -9], [38, 13]],
  [[37, 36], [22, 50], [0, 50]],
];
const BODY: Pt = [0, 14];

const inner = (k: number): Xf => ([x, y]) => [BODY[0] + (x - BODY[0]) * k, BODY[1] + (y - BODY[1]) * k];

export type Paisley = { outline: string; inner: string; core: string; dots: Pt[]; seeds: Pt[]; flower: Pt; r: number };

/** A paisley at (x, y), rotated `deg`, `size` = height / 100. */
export function paisley(x: number, y: number, deg: number, size: number, mirror = false): Paisley {
  const m: Xf = mirror ? ([px, py]) => [-px, py] : (p) => p;
  const t0 = xf(x, y, deg, size);
  const t: Xf = (p) => t0(m(p));
  const kin = inner(0.66);
  const kcore = inner(0.36);
  const comp = (k: Xf): Xf => (p) => t(k(p));
  const dots = dotsAlong(PAISLEY_START, PAISLEY.slice(0, 2), 9, 6, BODY)
    .concat(dotsAlong(PAISLEY[3][2], PAISLEY.slice(4), 9, 6, BODY))
    .map(t);
  const seeds: Pt[] = [
    [-2, -14],
    [3, -24],
    [9, -31],
  ].map((p) => t(p as Pt));
  return {
    outline: pathOf(PAISLEY_START, PAISLEY, t),
    inner: pathOf(PAISLEY_START, PAISLEY, comp(kin)),
    core: pathOf(PAISLEY_START, PAISLEY, comp(kcore)),
    dots,
    seeds,
    flower: t(BODY),
    r: 9 * size,
  };
}

/** A small n-petal flower as one path (petals are pointed ellipses). */
export function flower(cx: number, cy: number, r: number, n = 5, rot = -90) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    const w = (Math.PI / n) * 0.62;
    const tip: Pt = [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    const l: Pt = [cx + Math.cos(a - w) * r * 0.62, cy + Math.sin(a - w) * r * 0.62];
    const rr: Pt = [cx + Math.cos(a + w) * r * 0.62, cy + Math.sin(a + w) * r * 0.62];
    d += `M${f(cx)} ${f(cy)}Q${f(l[0])} ${f(l[1])} ${f(tip[0])} ${f(tip[1])}Q${f(rr[0])} ${f(rr[1])} ${f(cx)} ${f(cy)}Z`;
  }
  return d;
}

// ── rose (a tight spiral of petals) ──

export function rose(cx: number, cy: number, r: number) {
  // outer lobed silhouette
  let out = "";
  const lobes = 5;
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const rr = r * (0.9 + 0.1 * Math.cos(a * lobes));
    out += `${i ? "L" : "M"}${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)}`;
  }
  // inner spiral: three petal arcs, each a little smaller and rotated
  let sp = "";
  for (let k = 0; k < 3; k++) {
    const rr = r * (0.72 - k * 0.2);
    const a0 = (k * 130 - 60) * (Math.PI / 180);
    const a1 = a0 + Math.PI * 1.25;
    const p0: Pt = [cx + Math.cos(a0) * rr, cy + Math.sin(a0) * rr];
    const p1: Pt = [cx + Math.cos(a1) * rr, cy + Math.sin(a1) * rr];
    sp += `M${f(p0[0])} ${f(p0[1])}A${f(rr)} ${f(rr)} 0 1 1 ${f(p1[0])} ${f(p1[1])}`;
  }
  return { out: `${out}Z`, spiral: sp };
}

/** A jasmine bud: a soft teardrop pointing down, top at (cx, y). */
export const bud = (cx: number, y: number, w = 2.9, h = 8.2) =>
  `M${f(cx)} ${f(y)}C${f(cx + w)} ${f(y)} ${f(cx + w * 1.05)} ${f(y + h * 0.46)} ${f(cx + w * 0.7)} ${f(y + h * 0.68)}` +
  `C${f(cx + w * 0.42)} ${f(y + h * 0.84)} ${f(cx + w * 0.18)} ${f(y + h * 0.94)} ${f(cx)} ${f(y + h)}` +
  `C${f(cx - w * 0.18)} ${f(y + h * 0.94)} ${f(cx - w * 0.42)} ${f(y + h * 0.84)} ${f(cx - w * 0.7)} ${f(y + h * 0.68)}` +
  `C${f(cx - w * 1.05)} ${f(y + h * 0.46)} ${f(cx - w)} ${f(y)} ${f(cx)} ${f(y)}Z`;

// ── corner piece (top-left; mirrored by CSS for the others) ──
// Box 0..120. The frame's outer line runs along x = 0 / y = 0, the inner line at 13.
// A quarter lotus sits in the corner; a paisley lies along each edge, its tip
// curling into the card, and a leafy tendril carries on along the frame.

const leafPath = (x: number, y: number, deg: number, s: number) => {
  const t = xf(x, y, deg, s);
  const pts: Pt[] = [
    [0, 0],
    [5, -4.2],
    [12, -3.4],
    [16, 0],
    [12, 3.4],
    [5, 4.2],
  ];
  const [a, b, c, d, e, g] = pts.map(t);
  return `M${f(a[0])} ${f(a[1])}C${f(b[0])} ${f(b[1])} ${f(c[0])} ${f(c[1])} ${f(d[0])} ${f(d[1])}C${f(e[0])} ${f(e[1])} ${f(g[0])} ${f(g[1])} ${f(a[0])} ${f(a[1])}Z`;
};

const swapXY = (d: string) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${y} ${x}`);
const swapPt = ([x, y]: Pt): Pt => [y, x];

export const CORNER = (() => {
  const o: Pt = [13, 13];
  // quarter lotus: five pointed petals fanning into the card
  let petals = "";
  let petalsIn = "";
  for (let i = 0; i < 5; i++) {
    const a = ((9 + i * 18) * Math.PI) / 180;
    const tip: Pt = [o[0] + Math.cos(a) * 27, o[1] + Math.sin(a) * 27];
    const w = 0.27;
    const l: Pt = [o[0] + Math.cos(a - w) * 19, o[1] + Math.sin(a - w) * 19];
    const r: Pt = [o[0] + Math.cos(a + w) * 19, o[1] + Math.sin(a + w) * 19];
    petals += `M${o[0]} ${o[1]}Q${f(l[0])} ${f(l[1])} ${f(tip[0])} ${f(tip[1])}Q${f(r[0])} ${f(r[1])} ${o[0]} ${o[1]}Z`;
    const tip2: Pt = [o[0] + Math.cos(a) * 17, o[1] + Math.sin(a) * 17];
    const l2: Pt = [o[0] + Math.cos(a - w) * 10, o[1] + Math.sin(a - w) * 10];
    const r2: Pt = [o[0] + Math.cos(a + w) * 10, o[1] + Math.sin(a + w) * 10];
    petalsIn += `M${o[0]} ${o[1]}Q${f(l2[0])} ${f(l2[1])} ${f(tip2[0])} ${f(tip2[1])}Q${f(r2[0])} ${f(r2[1])} ${o[0]} ${o[1]}Z`;
  }
  const arc = `M${o[0] + 33} ${o[1]}A33 33 0 0 1 ${o[0]} ${o[1] + 33}`;
  const arcDots: Pt[] = [];
  for (let i = 0; i <= 8; i++) {
    const a = ((i * 90) / 8) * (Math.PI / 180);
    arcDots.push([o[0] + Math.cos(a) * 38, o[1] + Math.sin(a) * 38]);
  }
  // paisley along the top edge, body near the lotus, tip pointing along the frame
  const p = paisley(62, 27, 90, 0.27);
  const stem = "M74 20C84 17 92 22 100 21C108 20 112 16 118 17";
  const leaves = [leafPath(86, 20, -28, 0.55), leafPath(100, 21, 24, 0.5), leafPath(111, 18, -20, 0.42)];
  const dots: Pt[] = [
    [93, 27],
    [107, 13.5],
    [121, 17],
  ];
  return {
    petals,
    petalsIn,
    arc,
    arcDots,
    paisleys: [p, { ...p, outline: swapXY(p.outline), inner: swapXY(p.inner), core: swapXY(p.core), dots: p.dots.map(swapPt), seeds: p.seeds.map(swapPt), flower: swapPt(p.flower) }],
    stems: [stem, swapXY(stem)],
    leaves: [...leaves, ...leaves.map(swapXY)],
    dots: [...dots, ...dots.map(swapPt)],
    block: flower(6.5, 6.5, 5, 4, 45),
  };
})();

// ── kalgi: the jewelled turban ornament with its plume ──
// Box 120 × 130, centred on x = 60. The base jewel sits at y ≈ 80.

function feather(a: Pt, b: Pt, c: Pt, d: Pt, width: number) {
  const left: Pt[] = [];
  const right: Pt[] = [];
  const barbs: string[] = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = bez(a, b, c, d, t);
    const q = bez(a, b, c, d, Math.min(1, t + 0.01));
    const p0 = bez(a, b, c, d, Math.max(0, t - 0.01));
    const tx = q[0] - p0[0];
    const ty = q[1] - p0[1];
    const l = Math.hypot(tx, ty) || 1;
    const nx = -ty / l;
    const ny = tx / l;
    const w = width * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), 0.7) * (1 - t * 0.35) + 0.4;
    left.push([p[0] + nx * w, p[1] + ny * w]);
    right.push([p[0] - nx * w, p[1] - ny * w]);
    if (i > 2 && i < N - 3 && i % 2 === 0) {
      const bw = w * 0.92;
      barbs.push(`M${f(p[0])} ${f(p[1])}L${f(p[0] + nx * bw - (tx / l) * bw * 0.8)} ${f(p[1] + ny * bw - (ty / l) * bw * 0.8)}`);
      barbs.push(`M${f(p[0])} ${f(p[1])}L${f(p[0] - nx * bw - (tx / l) * bw * 0.8)} ${f(p[1] - ny * bw - (ty / l) * bw * 0.8)}`);
    }
  }
  const pts = [...left, ...right.reverse()];
  const outline = `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L")}Z`;
  const spine = `M${f(a[0])} ${f(a[1])}C${f(b[0])} ${f(b[1])} ${f(c[0])} ${f(c[1])} ${f(d[0])} ${f(d[1])}`;
  return { outline, spine, barbs: barbs.join("") };
}

export const KALGI = (() => {
  const plume = feather([60, 68], [50, 50], [47, 24], [58, 10], 5.2);
  // the tip curls over like a heron feather
  const curl = "M58 10C62 4 70 2 74 6C77 9 75 14 71 13C68.5 12.5 68.5 9.5 70.5 9";
  const pearls: Pt[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    pearls.push([60 + Math.cos(a) * 14.5, 82 + Math.sin(a) * 16.5]);
  }
  const fan = [-62, -118].map((deg) => {
    const r = (deg * Math.PI) / 180;
    return paisley(60 + Math.cos(r) * 22, 82 + Math.sin(r) * 22, deg + 90, 0.15, deg < -90).outline;
  });
  const sides = [paisley(34, 86, -112, 0.2, true), paisley(86, 86, 112, 0.2)];
  return {
    plume: plume.outline,
    vein: plume.spine,
    barbs: plume.barbs,
    curl,
    fan,
    sides,
    pearls,
    stone: "M60 70C67 70 71 76 71 82C71 89 66 94 60 94C54 94 49 89 49 82C49 76 53 70 60 70Z",
    facet: "M60 74L66 82L60 90L54 82Z",
    chain: [
      [60, 102],
      [60, 108],
    ] as Pt[],
    drop: "M60 111C64 115 65 120 63 123C61.5 125.5 58.5 125.5 57 123C55 120 56 115 60 111Z",
  };
})();

// ── the hero fringe: short strands of jasmine either side of the kalgi ──
// 240 wide, hanging from y = 0; the kalgi covers the middle strands.

export const FRINGE_PITCH = 9;

export const FRINGE = (() => {
  const n = 25;
  const step = 240 / (n - 1);
  const mid = (n - 1) / 2;
  return Array.from({ length: n }, (_, i) => {
    const d = Math.abs(i - mid);
    const buds = Math.max(2, Math.round(8.2 - d * 0.45) - (d % 2) * 2);
    return { x: i * step, buds, rose: d % 2 === 0 };
  });
})();

// ── divider: two paisleys face each other across a jewel ──

export const DIVIDER = (() => {
  const l = paisley(84, 15, 90, 0.27);
  const r = paisley(136, 15, -90, 0.27, true);
  return { l, r };
})();

// ── background brocade: an ogee jaal with a flower sprig in every cell (CSS mask) ──

export const BROCADE = (() => {
  const w = 60;
  const h = 84;
  const half = (sg: number) => {
    const x = (v: number) => w / 2 + sg * v;
    return `M${x(0)} 0C${x(1.5)} ${h * 0.12} ${x(w * 0.5)} ${h * 0.2} ${x(w * 0.5)} ${h * 0.5}C${x(w * 0.5)} ${h * 0.8} ${x(1.5)} ${h * 0.88} ${x(0)} ${h}`;
  };
  const cx = w / 2;
  const cy = h / 2 + 2;
  const petal = (a: number, len: number, wd: number) => {
    const r = (a * Math.PI) / 180;
    const p = (rr: number, d: number): Pt => [cx + Math.sin(r + d) * rr, cy - 2 - Math.cos(r + d) * rr];
    const t = p(len, 0);
    const n1 = p(len * 0.6, -wd);
    const n2 = p(len * 0.6, wd);
    return `M${cx} ${cy - 2}Q${f(n1[0])} ${f(n1[1])} ${f(t[0])} ${f(t[1])}Q${f(n2[0])} ${f(n2[1])} ${cx} ${cy - 2}Z`;
  };
  const leaf = (sg: number) =>
    `M${cx} ${cy + 8}C${cx + sg * 3} ${cy + 4} ${cx + sg * 8} ${cy + 4} ${cx + sg * 10} ${cy + 7}C${cx + sg * 7} ${cy + 10} ${cx + sg * 3} ${cy + 10} ${cx} ${cy + 8}Z`;
  const solid =
    petal(0, 11, 0.42) + petal(-38, 8.5, 0.5) + petal(38, 8.5, 0.5) + leaf(1) + leaf(-1) +
    flower(w / 2, 0, 5.5, 4, 0) + flower(w / 2, h, 5.5, 4, 0) + flower(0, h / 2, 5.5, 4, 0) + flower(w, h / 2, 5.5, 4, 0) +
    flower(0, 0, 4, 4, 45) + flower(w, 0, 4, 4, 45) + flower(0, h, 4, 4, 45) + flower(w, h, 4, 4, 45);
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>` +
    `<g fill='none' stroke='#000' stroke-width='.9'><path d='${half(1)}${half(-1)}'/><path d='M${cx} ${cy + 14}V${cy - 2}' stroke-width='.8'/></g>` +
    `<path d='${solid}'/></svg>`;
  return { url: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, w, h };
})();
