// Geometry for Zellige. Everything is constructed, not eyeballed: the khatam
// (8-point star, {8/2}) tiles the plane with crosses, the border band is one strip
// of that tiling, and the cover rosette is a 16-fold star with hexagonal petals
// whose sides continue the star's own edges.

export type Pt = [number, number];

const f = (n: number) => Math.round(n * 100) / 100;
const TAU = Math.PI * 2;
const poly = (pts: Pt[]) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L")}Z`;
const at = (r: number, a: number, c: Pt = [0, 0]): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];

/** Inner radius of the star polygon {n/s} with outer radius R. */
export const starInner = (R: number, n: number, s: number) => (R * Math.cos((Math.PI * s) / n)) / Math.cos((Math.PI * (s - 1)) / n);

/** The 8-point khatam {8/2} at (cx, cy), outer radius R, points at `rot` + k·45°. */
export function khatam(cx: number, cy: number, R: number, rot = 0) {
  const r = starInner(R, 8, 2);
  const pts: Pt[] = [];
  for (let k = 0; k < 8; k++) {
    pts.push(at(R, rot + (k * TAU) / 8, [cx, cy]));
    pts.push(at(r, rot + ((k + 0.5) * TAU) / 8, [cx, cy]));
  }
  return poly(pts);
}

// ── backdrop: the star-and-cross tiling ──
// Stars of radius R on a square lattice of pitch 2R touch point to point; the gaps
// are crosses whose inner corners meet the stars' diagonal points. One tile = 2R.

export const TESS = (() => {
  const R = 20;
  const P = 2 * R;
  const corners: Pt[] = [
    [0, 0],
    [P, 0],
    [0, P],
    [P, P],
  ];
  const stars = corners.map(([x, y]) => khatam(x, y, R)).join("");
  const inner = corners.map(([x, y]) => khatam(x, y, R * 0.46, Math.PI / 8)).join("");
  const svgLines =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${P}' height='${P}' viewBox='0 0 ${P} ${P}'>` +
    `<g fill='none' stroke='%23000'><path d='${stars}' stroke-width='1.1'/><path d='${inner}' stroke-width='.7'/></g>` +
    `<path d='${khatam(R, R, 3.2, Math.PI / 8)}'/></svg>`;
  const svgFill = `<svg xmlns='http://www.w3.org/2000/svg' width='${P}' height='${P}' viewBox='0 0 ${P} ${P}'><path d='${stars}'/></svg>`;
  const enc = (s: string) => `url("data:image/svg+xml,${s.replace(/</g, "%3C").replace(/>/g, "%3E")}")`;
  return { lines: enc(svgLines), fill: enc(svgFill), P };
})();

// ── hero panel: a pointed arch whose border band is a strip of khatams ──
// Arch art in a 300 × 200 box; the springing line is the bottom edge (y = 200).
// Each side of the arch is a circular arc centred on the springing line.

export const BAND = 16; // band width, = 2 × star radius, so stars touch both edges
const SR = BAND / 2;
const ARC_C = 190; // centre offset of each arc from the far side; > 150 makes it pointed
const YS = 200;

function archPath(inset: number) {
  // left arc: centre (ARC_C, YS), radius ARC_C − inset; right arc mirrored
  const rr = ARC_C - inset;
  const dy = Math.sqrt(rr * rr - (150 - ARC_C) ** 2);
  const apexY = YS - dy;
  return { d: `M${inset} ${YS}A${f(rr)} ${f(rr)} 0 0 1 150 ${f(apexY)}A${f(rr)} ${f(rr)} 0 0 1 ${300 - inset} ${YS}`, apexY };
}

export const ARCH = (() => {
  const outer = archPath(0);
  const inner = archPath(BAND);
  const line = archPath(BAND + 5);
  // stars along the left arc's midline, from just above the springing to the apex
  const rm = ARC_C - SR;
  const aSpring = Math.PI; // angle of (SR, YS) seen from the centre (ARC_C, YS)
  const aApex = Math.PI + Math.acos((ARC_C - 150) / rm); // where the midline meets x = 150
  const arcLen = (aApex - aSpring) * rm;
  // first star sits half a step above the springing, the last one on the apex
  const n = Math.round((arcLen - SR) / BAND);
  const step = (aApex - aSpring - SR / rm) / n;
  const stars: string[] = [];
  const hearts: string[] = [];
  const centre: Pt = [ARC_C, YS];
  for (let i = 0; i <= n; i++) {
    const a = aSpring + SR / rm + step * i;
    const p = at(rm, a, centre);
    // rotate each star to the band's tangent, so its points meet the band edges
    stars.push(khatam(p[0], p[1], SR, a));
    hearts.push(khatam(p[0], p[1], 2.6, a + Math.PI / 8));
    if (i < n) {
      stars.push(khatam(300 - p[0], p[1], SR, Math.PI - a));
      hearts.push(khatam(300 - p[0], p[1], 2.6, Math.PI - a + Math.PI / 8));
    }
  }
  const fill = `${inner.d}V${YS}Z`;
  const fillLine = line.d;
  return { outer: outer.d, inner: inner.d, line: fillLine, stars: stars.join(""), hearts: hearts.join(""), fill, apexY: outer.apexY, apexInner: inner.apexY };
})();

/** The star tile for the straight parts of the band, as a CSS mask (16 × 16). */
export const BAND_TILE = (() => {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${BAND}' height='${BAND}' viewBox='0 0 ${BAND} ${BAND}'>` +
    `<path d='${khatam(SR, SR, SR - 0.35)}' fill='none' stroke='%23000' stroke-width='.8'/>` +
    `<path d='${khatam(SR, SR, 2.6, Math.PI / 8)}'/></svg>`;
  return `url("data:image/svg+xml,${svg.replace(/</g, "%3C").replace(/>/g, "%3E")}")`;
})();

// ── cover: a 16-fold girih rosette made of separate pieces ──
// Central star {16/5}. Each petal is a centrally symmetric hexagon sitting in a
// notch of the star: two sides are the star's own edges, the opposite two are
// parallel to them, and the long sides run parallel to the petal's axis. Between
// the petals, a shield opens from every star point out to the rim circle.

export type Piece = { d: string; a: number; ring: number; k: number };

export const ROSETTE = (() => {
  const n = 16;
  const A = 62; // star point radius
  const B = starInner(A, n, 5);
  const th = (k: number) => (k * TAU) / n - Math.PI / 2;
  const P = (k: number) => at(A, th(k));
  const Q = (k: number) => at(B, th(k + 0.5));
  const tipR = 1.98 * A;
  const rho = (tipR + B) / 2; // petal centre radius
  const O = (k: number) => at(rho, th(k + 0.5));
  const mirror = (o: Pt, p: Pt): Pt => [2 * o[0] - p[0], 2 * o[1] - p[1]];
  const E = tipR;
  const pieces: Piece[] = [];
  for (let k = 0; k < n; k++) {
    pieces.push({ d: poly([[0, 0], Q(k - 1), P(k), Q(k)]), a: th(k), ring: 0, k });
  }
  const petal = (k: number) => {
    const o = O(k);
    return { q: Q(k), p0: P(k), p1: P(k + 1), x0: mirror(o, P(k + 1)), x1: mirror(o, P(k)), t: mirror(o, Q(k)) };
  };
  for (let k = 0; k < n; k++) {
    const h = petal(k);
    pieces.push({ d: poly([h.q, h.p1, h.x1, h.t, h.x0, h.p0]), a: th(k + 0.5), ring: 1, k });
  }
  for (let k = 0; k < n; k++) {
    const a = petal(k - 1); // the petal before this star point
    const b = petal(k); // the petal after it
    let d = `M${f(b.p0[0])} ${f(b.p0[1])}L${f(b.x0[0])} ${f(b.x0[1])}L${f(b.t[0])} ${f(b.t[1])}`;
    d += `A${f(E)} ${f(E)} 0 0 0 ${f(a.t[0])} ${f(a.t[1])}L${f(a.x1[0])} ${f(a.x1[1])}Z`;
    pieces.push({ d, a: th(k), ring: 2, k });
  }
  return { pieces, A, B, E };
})();

// ── divider and ornament ──

export const DIVIDER = (() => {
  const xs = [30, 70, 110, 150, 190];
  const rs = [4.2, 5.6, 8, 5.6, 4.2];
  const stars = xs.map((x, i) => khatam(x, 14, rs[i], i === 2 ? 0 : Math.PI / 8)).join("");
  const inner = khatam(110, 14, 3.4, Math.PI / 8);
  let links = "";
  for (let i = 0; i < xs.length - 1; i++) links += `M${xs[i] + rs[i] + 2} 14H${xs[i + 1] - rs[i + 1] - 2}`;
  return { stars, inner, links, dots: xs.slice(0, -1).map((x, i) => [(x + xs[i + 1]) / 2, 14] as Pt) };
})();
