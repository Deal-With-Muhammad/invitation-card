// Geometry for Marigold, computed once at import so server thumbnails and the
// live card draw the same flowers. Plain data and path strings, no React.

export type Pt = [number, number];

const f = (n: number) => Math.round(n * 100) / 100;

/** Small seeded random, so the "hand-made" wobble is the same on every render. */
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

/** A ruffled ring: n scallops bulging past radius r. */
export function ruffle(cx: number, cy: number, r: number, n: number, rot: number, rand: () => number) {
  const inner = r * 0.84;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const p: Pt = [cx + Math.cos(a) * inner, cy + Math.sin(a) * inner];
    if (i === 0) {
      d += `M${f(p[0])} ${f(p[1])}`;
      continue;
    }
    const am = rot + ((i - 0.5) / n) * Math.PI * 2;
    const k = r * (1.12 + (rand() - 0.5) * 0.12);
    d += `Q${f(cx + Math.cos(am) * k)} ${f(cy + Math.sin(am) * k)} ${f(p[0])} ${f(p[1])}`;
  }
  return `${d}Z`;
}

export type Bloom = { x: number; y: number; r: number; seed: number };

/** Marigolds (genda phool) as five combined layers, so a garland is a handful of paths. */
export function blooms(list: Bloom[]) {
  let r1 = "";
  let r2 = "";
  let r3 = "";
  let c = "";
  let folds = "";
  for (const b of list) {
    const rand = rng(b.seed);
    const rot = rand() * Math.PI;
    r1 += ruffle(b.x, b.y, b.r, 13, rot, rand);
    r2 += ruffle(b.x, b.y, b.r * 0.72, 11, rot + 0.3, rand);
    r3 += ruffle(b.x, b.y, b.r * 0.45, 8, rot + 0.1, rand);
    c += `M${f(b.x + b.r * 0.17)} ${f(b.y)}A${f(b.r * 0.17)} ${f(b.r * 0.17)} 0 1 0 ${f(b.x - b.r * 0.17)} ${f(b.y)}A${f(b.r * 0.17)} ${f(b.r * 0.17)} 0 1 0 ${f(b.x + b.r * 0.17)} ${f(b.y)}Z`;
    // little folds between the outer petals
    for (let i = 0; i < 13; i += 2) {
      const a = rot + (i / 13) * Math.PI * 2;
      const p0: Pt = [b.x + Math.cos(a) * b.r * 0.88, b.y + Math.sin(a) * b.r * 0.88];
      const p1: Pt = [b.x + Math.cos(a + 0.12) * b.r * 0.66, b.y + Math.sin(a + 0.12) * b.r * 0.66];
      folds += `M${f(p0[0])} ${f(p0[1])}L${f(p1[0])} ${f(p1[1])}`;
    }
  }
  return { r1, r2, r3, c, folds };
}

export type Blooms = ReturnType<typeof blooms>;

/** A mango leaf hanging from (x, y), `deg` from straight down. */
export function mangoLeaf(x: number, y: number, len: number, deg: number, bend = 0.12) {
  const w = len * 0.17;
  const b = len * bend;
  const a = (deg * Math.PI) / 180;
  const t = ([px, py]: Pt): Pt => [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)];
  const P = (pts: Pt[]) => pts.map(t).map(([px, py]) => `${f(px)} ${f(py)}`);
  const [p0, c1, c2, tip, c3, c4] = P([
    [0, 0],
    [-w * 1.1, len * 0.24],
    [-w * 0.5 + b * 0.8, len * 0.8],
    [b, len],
    [w * 0.62 + b * 0.75, len * 0.76],
    [w * 1.15, len * 0.22],
  ]);
  const [m0, mc, m1] = P([
    [0, len * 0.05],
    [b * 0.35, len * 0.55],
    [b * 0.96, len * 0.94],
  ]);
  return { leaf: `M${p0}C${c1} ${c2} ${tip}C${c3} ${c4} ${p0}Z`, rib: `M${m0}Q${mc} ${m1}` };
}

const join = (ls: { leaf: string; rib: string }[]) => ({ leaf: ls.map((l) => l.leaf).join(""), rib: ls.map((l) => l.rib).join("") });

// ── the toran across the top of the hero (390 wide) ──

export const TORAN = (() => {
  const hangs = [0, 97.5, 195, 292.5, 390];
  const top = 5;
  const sag = 34;
  const orange: Bloom[] = [];
  const yellow: Bloom[] = [];
  let seed = 11;
  for (let s = 0; s < 4; s++) {
    const x0 = hangs[s];
    const x1 = hangs[s + 1];
    const list = s % 2 ? yellow : orange;
    // sample the swag by arc length so flowers sit evenly
    const pts: Pt[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      pts.push([x0 + (x1 - x0) * t, top + 4 * sag * t * (1 - t)]);
    }
    let acc = 0;
    const step = 10.6;
    for (let i = 1; i < pts.length; i++) {
      acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (acc >= step && i < pts.length - 4) {
        acc = 0;
        list.push({ x: pts[i][0], y: pts[i][1], r: 8.4 + ((seed * 7) % 5) * 0.18, seed: seed++ });
      }
    }
  }
  // a string of mango leaves along the rope, behind the swags
  const rope: { leaf: string; rib: string }[] = [];
  for (let x = 6; x < 390; x += 13) rope.push(mangoLeaf(x, top - 1, x % 26 < 13 ? 22 : 27, ((x * 37) % 11) - 5, 0.08));
  // leaf clusters and a big flower at every hanging point
  const clusters: { leaf: string; rib: string }[] = [];
  const big: Bloom[] = [];
  hangs.forEach((x, i) => {
    clusters.push(mangoLeaf(x - 4, top + 4, 34, 22), mangoLeaf(x + 4, top + 4, 34, -22), mangoLeaf(x, top + 6, 40, 0, 0.06));
    big.push({ x, y: top + 3, r: 12.5, seed: 100 + i });
  });
  return {
    rope: join(rope),
    clusters: join(clusters),
    orange: blooms(orange),
    yellow: blooms(yellow),
    big: blooms(big),
    hangs,
  };
})();

// ── a ladi: a hanging string of marigolds, drawn long and clipped by the hero ──

export function ladi(x: number, y0: number, count: number, pitch: number, r: number, seed: number, leafEvery = 5) {
  const flowers: Bloom[] = [];
  const leaves: { leaf: string; rib: string }[] = [];
  let y = y0;
  for (let i = 0; i < count; i++) {
    if (i > 0 && i % leafEvery === 0) {
      leaves.push(mangoLeaf(x - 1, y - pitch * 0.3, r * 1.9, 58, 0.1), mangoLeaf(x + 1, y - pitch * 0.3, r * 1.9, -58, -0.1));
      y += pitch * 0.35;
    }
    flowers.push({ x, y, r: r * (0.96 + ((i * 13) % 7) * 0.012), seed: seed + i });
    y += pitch;
  }
  return { flowers: blooms(flowers), leaves: join(leaves), end: y - pitch + r };
}

export const LADIS = {
  outer: ladi(13, 18, 74, 15, 8.2, 300, 6),
  inner: ladi(38, 44, 9, 14.2, 7.2, 500, 4),
};

// ── the mehndi mandala behind the names (centred on 0,0) ──

export const MANDALA = (() => {
  const R = 168;
  let petals = "";
  const n = 28;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const a0 = a - Math.PI / n;
    const a1 = a + Math.PI / n;
    const b0: Pt = [Math.cos(a0) * (R - 22), Math.sin(a0) * (R - 22)];
    const b1: Pt = [Math.cos(a1) * (R - 22), Math.sin(a1) * (R - 22)];
    const tip: Pt = [Math.cos(a) * R, Math.sin(a) * R];
    const c0: Pt = [Math.cos(a0 + 0.02) * (R - 4), Math.sin(a0 + 0.02) * (R - 4)];
    const c1: Pt = [Math.cos(a1 - 0.02) * (R - 4), Math.sin(a1 - 0.02) * (R - 4)];
    petals += `M${f(b0[0])} ${f(b0[1])}Q${f(c0[0])} ${f(c0[1])} ${f(tip[0])} ${f(tip[1])}Q${f(c1[0])} ${f(c1[1])} ${f(b1[0])} ${f(b1[1])}`;
  }
  // a little vein in each petal
  let veins = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    veins += `M${f(Math.cos(a) * (R - 19))} ${f(Math.sin(a) * (R - 19))}L${f(Math.cos(a) * (R - 8))} ${f(Math.sin(a) * (R - 8))}`;
  }
  const dots: Pt[] = [];
  for (let i = 0; i < 56; i++) {
    const a = ((i + 0.5) / 56) * Math.PI * 2;
    dots.push([Math.cos(a) * (R - 29), Math.sin(a) * (R - 29)]);
  }
  // a ring of scallops further in, each holding a dot
  let scallops = "";
  const m = 20;
  const rs = R - 44;
  for (let i = 0; i < m; i++) {
    const a0 = (i / m) * Math.PI * 2;
    const a1 = ((i + 1) / m) * Math.PI * 2;
    const p0: Pt = [Math.cos(a0) * rs, Math.sin(a0) * rs];
    const p1: Pt = [Math.cos(a1) * rs, Math.sin(a1) * rs];
    const rr = rs * Math.sin(Math.PI / m);
    scallops += `${i ? "" : `M${f(p0[0])} ${f(p0[1])}`}A${f(rr)} ${f(rr)} 0 0 0 ${f(p1[0])} ${f(p1[1])}`;
  }
  const inDots: Pt[] = [];
  for (let i = 0; i < m; i++) {
    const a = ((i + 0.5) / m) * Math.PI * 2;
    inDots.push([Math.cos(a) * (rs - 8.5), Math.sin(a) * (rs - 8.5)]);
  }
  let lace = "";
  const k = 56;
  const rl = R - 36;
  for (let i = 0; i < k; i++) {
    const a0 = (i / k) * Math.PI * 2;
    const a1 = ((i + 1) / k) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    lace += `M${f(Math.cos(a0) * rl)} ${f(Math.sin(a0) * rl)}Q${f(Math.cos(am) * (rl + 9))} ${f(Math.sin(am) * (rl + 9))} ${f(Math.cos(a1) * rl)} ${f(Math.sin(a1) * rl)}`;
  }
  // a small paisley drop between every pair of inner scallops
  let drops = "";
  for (let i = 0; i < m; i++) {
    const a = (i / m) * Math.PI * 2;
    const r0 = rs + 2;
    const r1 = rs + 15;
    const p0: Pt = [Math.cos(a) * r0, Math.sin(a) * r0];
    const p1: Pt = [Math.cos(a) * r1, Math.sin(a) * r1];
    const side = (s2: number, rr: number): Pt => [Math.cos(a + s2) * rr, Math.sin(a + s2) * rr];
    const l = side(-0.06, rs + 7);
    const r2 = side(0.06, rs + 7);
    drops += `M${f(p0[0])} ${f(p0[1])}Q${f(l[0])} ${f(l[1])} ${f(p1[0])} ${f(p1[1])}Q${f(r2[0])} ${f(r2[1])} ${f(p0[0])} ${f(p0[1])}Z`;
  }
  return { R, petals, veins, dots, scallops, inDots, lace, drops, rings: [R - 22, R - 36, rs - 16] };
})();

// ── divider: a short string of marigolds with a leaf at each end ──

export const DIVIDER = (() => {
  const o: Bloom[] = [];
  const y: Bloom[] = [];
  for (let i = 0; i < 7; i++) (i % 2 ? y : o).push({ x: 64 + i * 15.3, y: 14 + Math.sin((i / 6) * Math.PI) * 5, r: i === 3 ? 8.6 : 7.2, seed: 40 + i });
  const leaves = join([mangoLeaf(58, 14, 22, 70, 0.1), mangoLeaf(162, 14, 22, -70, -0.1), mangoLeaf(56, 16, 18, 38, 0.1), mangoLeaf(164, 16, 18, -38, -0.1)]);
  return { o: blooms(o), y: blooms(y), leaves };
})();

export const ORN = (() => ({
  bloom: blooms([{ x: 45, y: 9, r: 7.4, seed: 7 }]),
  leaves: join([mangoLeaf(39, 10, 16, 72, 0.12), mangoLeaf(51, 10, 16, -72, -0.12)]),
}))();

// ── backdrop: bandhani tie-dye dots (CSS mask) ──

export const BANDHANI = (() => {
  const w = 34;
  const ring = (x: number, y: number, r: number) => `<circle cx='${x}' cy='${y}' r='${r}' fill='none' stroke='%23000' stroke-width='1.1'/><circle cx='${x}' cy='${y}' r='.55'/>`;
  // chaubundi: four dots round a fifth, like the five on a die
  const cluster = (x: number, y: number) =>
    ring(x, y, 1.7) + ring(x - 3.8, y - 3.8, 1.45) + ring(x + 3.8, y - 3.8, 1.45) + ring(x - 3.8, y + 3.8, 1.45) + ring(x + 3.8, y + 3.8, 1.45);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${w}'>${cluster(8.5, 8.5)}${cluster(25.5, 25.5)}<circle cx='25.5' cy='8.5' r='1'/><circle cx='8.5' cy='25.5' r='1'/></svg>`;
  return { url: `url("data:image/svg+xml,${svg.replace(/</g, "%3C").replace(/>/g, "%3E")}")`, w };
})();
