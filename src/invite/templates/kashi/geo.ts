// Geometry for Kashi: Multani blue-pottery flowers, leaves and vines, painted with a
// little seeded wobble so every petal is slightly different, yet the server and the
// phone draw exactly the same picture.

export type Pt = [number, number];

const f = (n: number) => Math.round(n * 100) / 100;
const pt = ([x, y]: Pt) => `${f(x)} ${f(y)}`;

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rot = (c: Pt, a: number) => ([x, y]: Pt): Pt => [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)];

/** One rounded petal along +x from r0 to r, half-width w, mapped by `t`. */
function petal(r0: number, r: number, w: number, t: (p: Pt) => Pt) {
  const P = (x: number, y: number) => pt(t([x, y]));
  return (
    `M${P(r0, 0)}C${P(r0 + 0.12 * r, -w * 0.8)} ${P(0.58 * r, -w * 1.2)} ${P(0.86 * r, -w * 0.82)}` +
    `C${P(1.03 * r, -w * 0.5)} ${P(1.03 * r, w * 0.5)} ${P(0.86 * r, w * 0.82)}` +
    `C${P(0.58 * r, w * 1.2)} ${P(r0 + 0.12 * r, w * 0.8)} ${P(r0, 0)}Z`
  );
}

/** A pointed inner petal (the cobalt stroke painted inside each petal). */
function spear(r0: number, r: number, w: number, t: (p: Pt) => Pt) {
  const P = (x: number, y: number) => pt(t([x, y]));
  return `M${P(r0, 0)}Q${P((r0 + r) / 2, -w)} ${P(r, 0)}Q${P((r0 + r) / 2, w)} ${P(r0, 0)}Z`;
}

export type Flower = { outer: string; inner: string; core: string; ring: string; dots: Pt[]; c: Pt; r: number };

/** A Multani flower: n rounded turquoise petals, a cobalt spear in each, a cobalt heart. */
export function flower(cx: number, cy: number, r: number, n: number, seed: number, turn = 0): Flower {
  const rand = rng(seed);
  let outer = "";
  let inner = "";
  for (let i = 0; i < n; i++) {
    const a = turn + (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.08;
    const rr = r * (0.94 + rand() * 0.1);
    const w = ((Math.PI * r) / n) * (0.74 + rand() * 0.1);
    const t = rot([cx, cy], a);
    outer += petal(r * 0.26, rr, w, t);
    inner += spear(r * 0.36, rr * 0.76, w * 0.34, t);
  }
  const cr = r * 0.3;
  const core = `M${f(cx + cr)} ${f(cy)}A${f(cr)} ${f(cr)} 0 1 0 ${f(cx - cr)} ${f(cy)}A${f(cr)} ${f(cr)} 0 1 0 ${f(cx + cr)} ${f(cy)}Z`;
  const rr2 = cr * 0.5;
  const ring = `M${f(cx + rr2)} ${f(cy)}A${f(rr2)} ${f(rr2)} 0 1 0 ${f(cx - rr2)} ${f(cy)}A${f(rr2)} ${f(rr2)} 0 1 0 ${f(cx + rr2)} ${f(cy)}Z`;
  const dots: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = turn + ((i + 0.5) / n) * Math.PI * 2;
    dots.push([cx + Math.cos(a) * r * 0.36, cy + Math.sin(a) * r * 0.36]);
  }
  return { outer, inner, core, ring, dots, c: [cx, cy], r };
}

export type Leaf = { leaf: string; vein: string };

/** A long, curved, pointed leaf from (x, y) at angle `deg`, bending by `bend`. */
export function leaf(x: number, y: number, len: number, deg: number, bend: number, seed: number, wide = 0.2): Leaf {
  const rand = rng(seed);
  const L = len * (0.95 + rand() * 0.1);
  const w = L * wide * (0.9 + rand() * 0.2);
  const b = L * bend;
  const t = rot([x, y], (deg * Math.PI) / 180);
  const P = (px: number, py: number) => pt(t([px, py]));
  return {
    leaf:
      `M${P(0, 0)}C${P(L * 0.22, -w * 1.1)} ${P(L * 0.7, -w * 0.9 + b)} ${P(L, b)}` +
      `C${P(L * 0.72, w * 0.7 + b)} ${P(L * 0.25, w * 1.05)} ${P(0, 0)}Z`,
    vein: `M${P(L * 0.08, 0)}Q${P(L * 0.55, b * 0.45)} ${P(L * 0.86, b * 0.92)}`,
  };
}

const join = (ls: Leaf[]): Leaf => ({ leaf: ls.map((l) => l.leaf).join(""), vein: ls.map((l) => l.vein).join("") });

/** A tendril curl: a loosening spiral starting at p heading `deg`. */
function curl(x: number, y: number, r: number, deg: number, dir = 1) {
  let d = `M${f(x)} ${f(y)}`;
  const a0 = (deg * Math.PI) / 180;
  // centre of the curl sits to one side of the heading
  const cx = x + Math.cos(a0 + (dir * Math.PI) / 2) * r;
  const cy = y + Math.sin(a0 + (dir * Math.PI) / 2) * r;
  const start = a0 - (dir * Math.PI) / 2;
  for (let i = 1; i <= 28; i++) {
    const t = i / 28;
    const a = start + dir * t * Math.PI * 1.7;
    const rr = r * (1 - t * 0.62);
    d += `L${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)}`;
  }
  return d;
}

/** A small closed bud on a short stalk. */
function bud(x: number, y: number, len: number, deg: number) {
  const t = rot([x, y], (deg * Math.PI) / 180);
  const P = (px: number, py: number) => pt(t([px, py]));
  const s = len * 0.45;
  return {
    stalk: `M${P(0, 0)}L${P(s, 0)}`,
    bud: `M${P(s, 0)}C${P(s + len * 0.1, -len * 0.3)} ${P(len * 0.85, -len * 0.28)} ${P(len, 0)}C${P(len * 0.85, len * 0.28)} ${P(s + len * 0.1, len * 0.3)} ${P(s, 0)}Z`,
  };
}

// ── corner spray (top-left, in a 160 box; mirrored by CSS) ──

export const CORNER = (() => {
  const fl = flower(46, 46, 36, 8, 3, 0.2);
  const small = [flower(122, 22, 14, 6, 8, 0.4), flower(22, 122, 14, 6, 9, 1.1)];
  const vines = [
    "M66 30C84 22 100 16 118 22C134 27 144 20 150 12",
    "M30 66C22 84 16 100 22 118C27 134 20 144 12 150",
    curl(150, 12, 6, -60, -1),
    curl(12, 150, 6, 150, 1),
    "M70 58C84 64 92 76 94 92",
    curl(94, 92, 5, 95, 1),
  ];
  const leaves = join([
    leaf(80, 25, 30, -34, 0.14, 11),
    leaf(25, 80, 30, 124, -0.14, 13),
    leaf(76, 66, 34, 46, 0.1, 15, 0.22),
    leaf(140, 18, 18, -18, 0.08, 16),
    leaf(18, 140, 18, 108, -0.08, 17),
  ]);
  const leavesT = join([
    leaf(96, 19, 24, 30, -0.1, 12, 0.2),
    leaf(19, 96, 24, 60, 0.1, 14, 0.2),
    leaf(104, 30, 18, 70, 0.1, 18, 0.24),
    leaf(30, 104, 18, 20, -0.1, 19, 0.24),
  ]);
  const buds = [bud(86, 78, 20, 20), bud(104, 54, 15, -12), bud(54, 104, 15, 102)];
  return { fl, small, vines, leaves, leavesT, buds };
})();

// ── centre spray for the top and bottom edges (a 220 × 90 box, hanging from y = 0) ──

export const SPRAY = (() => {
  const fl = flower(110, 30, 22, 8, 21, 0.39);
  const side = [flower(58, 20, 11, 6, 22, 0.1), flower(162, 20, 11, 6, 23, 0.5)];
  const vines = [
    "M90 22C76 16 66 14 58 20C46 28 30 28 16 18",
    "M130 22C144 16 154 14 162 20C174 28 190 28 204 18",
    curl(16, 18, 5, 200, 1),
    curl(204, 18, 5, -20, -1),
  ];
  const leaves = join([
    leaf(96, 44, 30, 128, -0.12, 31),
    leaf(124, 44, 30, 52, 0.12, 32),
    leaf(42, 26, 18, 160, -0.12, 34),
    leaf(178, 26, 18, 20, 0.12, 35),
  ]);
  const leavesT = join([
    leaf(110, 50, 26, 90, 0, 33, 0.24),
    leaf(74, 14, 18, -150, 0.1, 36, 0.2),
    leaf(146, 14, 18, -30, -0.1, 37, 0.2),
  ]);
  const buds = [bud(30, 22, 13, 150), bud(190, 22, 13, 30)];
  const leavesSide = join([leaf(42, 26, 18, 160, -0.12, 34), leaf(178, 26, 18, 20, 0.12, 35)]);
  return { fl, side, vines, leaves, leavesT, leavesSide, buds };
})();

// ── side vine: a long meander with alternating leaves, clipped to the hero ──

export const SIDE = (() => {
  const h = 1200;
  const x0 = 20;
  let d = `M${x0} 0`;
  const leaves: Leaf[] = [];
  const leavesT: Leaf[] = [];
  const buds: ReturnType<typeof bud>[] = [];
  const flowers: Flower[] = [];
  const step = 62;
  for (let y = 0, i = 0; y < h; y += step, i++) {
    const s = i % 2 ? -1 : 1;
    d += `C${x0 + s * 13} ${y + step * 0.3} ${x0 + s * 13} ${y + step * 0.7} ${x0} ${y + step}`;
    const ly = y + step * 0.5;
    (i % 3 === 1 ? leavesT : leaves).push(leaf(x0 + s * 10, ly, 24, s > 0 ? -32 : 212, s * 0.12, 60 + i, 0.21));
    if (i % 3 === 0) flowers.push(flower(x0 - s * 8, ly + 16, 8, 6, 90 + i, i));
    else if (i % 3 === 2) buds.push(bud(x0 - s * 4, ly + 12, 13, s > 0 ? 150 : 30));
  }
  return { d, leaves: join(leaves), leavesT: join(leavesT), buds, flowers, h };
})();

// ── the cartouche: an ogee medallion (260 × 460, centred on 130, 230) ──

function ogee(W: number, H: number) {
  const c: Pt = [130, 230];
  const P = (x: number, y: number) => pt([c[0] + x, c[1] + y]);
  const right =
    `C${P(W * 0.06, -H * 0.9)} ${P(W * 0.4, -H * 0.86)} ${P(W * 0.66, -H * 0.68)}` +
    `C${P(W * 0.95, -H * 0.48)} ${P(W, -H * 0.24)} ${P(W, 0)}` +
    `C${P(W, H * 0.24)} ${P(W * 0.95, H * 0.48)} ${P(W * 0.66, H * 0.68)}` +
    `C${P(W * 0.4, H * 0.86)} ${P(W * 0.06, H * 0.9)} ${P(0, H)}`;
  const left =
    `C${P(-W * 0.06, H * 0.9)} ${P(-W * 0.4, H * 0.86)} ${P(-W * 0.66, H * 0.68)}` +
    `C${P(-W * 0.95, H * 0.48)} ${P(-W, H * 0.24)} ${P(-W, 0)}` +
    `C${P(-W, -H * 0.24)} ${P(-W * 0.95, -H * 0.48)} ${P(-W * 0.66, -H * 0.68)}` +
    `C${P(-W * 0.4, -H * 0.86)} ${P(-W * 0.06, -H * 0.9)} ${P(0, -H)}`;
  return `M${P(0, -H)}${right}${left}Z`;
}

/** Points along the ogee outline, clockwise from the top tip. */
function ogeePts(W: number, H: number, step: number): Pt[] {
  const c: Pt = [130, 230];
  const segs: [Pt, Pt, Pt, Pt][] = [
    [[0, -H], [W * 0.06, -H * 0.9], [W * 0.4, -H * 0.86], [W * 0.66, -H * 0.68]],
    [[W * 0.66, -H * 0.68], [W * 0.95, -H * 0.48], [W, -H * 0.24], [W, 0]],
  ];
  const bz = (s: [Pt, Pt, Pt, Pt], t: number): Pt => {
    const u = 1 - t;
    const [a, b, cc, d] = s;
    return [
      u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * cc[0] + t * t * t * d[0],
      u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * cc[1] + t * t * t * d[1],
    ];
  };
  const dense: Pt[] = [];
  for (const sg of segs) for (let i = 0; i <= 200; i++) dense.push(bz(sg, i / 200));
  // quarter outline, resampled at even spacing
  const q: Pt[] = [dense[0]];
  let acc = 0;
  for (let i = 1; i < dense.length; i++) {
    acc += Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]);
    if (acc >= step) {
      q.push(dense[i]);
      acc = 0;
    }
  }
  q[q.length - 1] = [W, 0];
  const right = [...q, ...q.slice(0, -1).reverse().map(([x, y]) => [x, -y] as Pt)];
  const all = [...right, ...right.slice(1, -1).reverse().map(([x, y]) => [-x, y] as Pt)];
  return all.map(([x, y]) => [c[0] + x, c[1] + y]);
}

function cusped(W: number, H: number, step: number) {
  const pts = ogeePts(W, H, step);
  let d = `M${pt(pts[0])}`;
  for (let i = 1; i <= pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i % pts.length];
    const r = Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.56;
    d += `A${f(r)} ${f(r)} 0 0 1 ${pt(b)}`;
  }
  return `${d}Z`;
}

export const CARTOUCHE = (() => {
  const outer = cusped(126, 216, 13);
  const line = ogee(116, 205);
  const inner = ogee(110, 197);
  // trefoil finials on both points
  const fin = (y: number, s: number) => {
    const top = flower(130, y, 9, 3, 77 + s, s > 0 ? -Math.PI / 2 : Math.PI / 2);
    return top;
  };
  return { outer, line, inner, plain: ogee(124, 214), finials: [fin(8, 1), fin(452, -1)] };
})();

// ── the cover tile (240 square, centred on 0,0) ──

export const TILE = (() => {
  const big = flower(0, 0, 74, 8, 101, 0);
  const second = flower(0, 0, 50, 8, 102, Math.PI / 8);
  // corner sprays point into the tile's corners
  const corners = [0, 1, 2, 3].map((q) => {
    const a = (Math.PI / 4) * (2 * q + 1);
    const cx = Math.cos(a) * 92;
    const cy = Math.sin(a) * 92;
    const fl = flower(cx, cy, 14, 6, 110 + q, a);
    const deg = (a * 180) / Math.PI;
    const lv = join([leaf(cx - Math.cos(a) * 16, cy - Math.sin(a) * 16, 20, deg + 140, 0.1, 120 + q), leaf(cx - Math.cos(a) * 16, cy - Math.sin(a) * 16, 20, deg - 140, -0.1, 130 + q)]);
    return { fl, lv };
  });
  // leaves between the rosette's petals and the edges
  const edgeLeaves = join(
    [0, 1, 2, 3].flatMap((q) => {
      const a = (Math.PI / 2) * q;
      const cx = Math.cos(a) * 84;
      const cy = Math.sin(a) * 84;
      const deg = (a * 180) / Math.PI;
      return [leaf(cx, cy, 22, deg + 100, 0.12, 140 + q), leaf(cx, cy, 22, deg - 100, -0.12, 150 + q)];
    }),
  );
  return { big, second, corners, edgeLeaves };
})();

/** Small loose tiles around the big one: [x, y, size, turn, dark?] in cover units. */
export const LOOSE: [number, number, number, number, boolean][] = [
  [-132, -196, 58, 12, true],
  [138, -178, 50, -18, false],
  [-150, 168, 50, 22, false],
  [126, 196, 60, -8, true],
  [-168, -18, 40, 40, false],
  [170, 4, 44, 30, true],
];

export const SMALL_FLOWER = flower(0, 0, 15, 4, 200, Math.PI / 4);
export const SMALL_FLOWER_B = flower(0, 0, 15, 6, 201, 0);

// ── divider: a vine with turquoise leaves and a flower in the middle ──

export const DIVIDER = (() => {
  const vine = "M12 18C34 8 52 8 72 18C82 23 90 23 96 18M124 18C130 23 138 23 148 18C168 8 186 8 208 18";
  const leaves = join([
    leaf(34, 11, 16, -150, 0.12, 301, 0.24),
    leaf(56, 11, 16, -30, -0.12, 302, 0.24),
    leaf(164, 11, 16, -150, 0.12, 303, 0.24),
    leaf(186, 11, 16, -30, -0.12, 304, 0.24),
    leaf(80, 22, 14, 120, -0.1, 305, 0.24),
    leaf(140, 22, 14, 60, 0.1, 306, 0.24),
  ]);
  return { vine, leaves, fl: flower(110, 18, 13, 6, 307, -Math.PI / 2), curls: [curl(12, 18, 4, 200, 1), curl(208, 18, 4, -20, -1)] };
})();

export const ORN = (() => ({
  fl: flower(45, 9, 7.5, 6, 401, -Math.PI / 2),
  leaves: join([leaf(36, 10, 12, 175, -0.1, 402, 0.26), leaf(54, 10, 12, 5, 0.1, 403, 0.26)]),
}))();

// ── backdrop: a faint grid of square tiles with a tiny flower at every joint ──

export const GRID = (() => {
  const s = 56;
  const fl = (x: number, y: number) =>
    [0, 1, 2, 3]
      .map((i) => {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        const t = rot([x, y], a);
        return `M${pt(t([1, 0]))}Q${pt(t([3.6, -2.4]))} ${pt(t([5.4, 0]))}Q${pt(t([3.6, 2.4]))} ${pt(t([1, 0]))}Z`;
      })
      .join("");
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'>` +
    `<path d='M0 .5H${s}M.5 0V${s}' stroke='%23000' stroke-width='1'/>` +
    `<path d='${fl(0, 0)}${fl(s, 0)}${fl(0, s)}${fl(s, s)}'/><circle cx='${s / 2}' cy='${s / 2}' r='1.1'/></svg>`;
  return { url: `url("data:image/svg+xml,${svg.replace(/</g, "%3C").replace(/>/g, "%3E")}")`, s };
})();
