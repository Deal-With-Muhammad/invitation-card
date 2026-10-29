import type { CSSProperties } from "react";

import { luminance, paletteFor } from "../../look";
import type { Resolved } from "../../resolve";
import { Blessing, Names } from "../../runtime/sections";
import { metaFor } from "../catalog";
import type { HeroProps } from "../types";

// Lantern: fanoos lanterns hanging on chains under a crescent moon.
// Each lantern is pierced brass (an SVG with real holes, fill-rule evenodd) over
// a CSS light: a radial gradient masked to the lantern's silhouette, so the glow
// only shows through the lattice and the pierced stars. No SVG ids anywhere.

type Pt = [number, number];

const f = (n: number) => Math.round(n * 100) / 100;
const circ = (cx: number, cy: number, r: number) =>
  `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;

/** A diamond lattice inside a rectangle: two families of parallel bars, clipped. */
function lattice(x0: number, y0: number, x1: number, y1: number, step: number, m: number) {
  let d = "";
  // bars y = m (x - x0) + c, clipped to the box, plus their mirror image
  for (let c = y0 - m * (x1 - x0) + step / 2; c < y1; c += step) {
    const xa = Math.max(x0, x0 + (y0 - c) / m);
    const xb = Math.min(x1, x0 + (y1 - c) / m);
    if (xb - xa < 0.3) continue;
    const ya = m * (xa - x0) + c;
    const yb = m * (xb - x0) + c;
    d += `M${f(xa)} ${f(ya)}L${f(xb)} ${f(yb)}M${f(x0 + x1 - xa)} ${f(ya)}L${f(x0 + x1 - xb)} ${f(yb)}`;
  }
  return d;
}

/** A pointed (two-centred) arch window, bottom at y1. */
const archWin = (x0: number, x1: number, spring: number, apex: number, y1: number) => {
  const cx = (x0 + x1) / 2;
  const w = x1 - x0;
  return `M${f(x0)} ${f(y1)}V${f(spring)}C${f(x0)} ${f(spring - (spring - apex) * 0.55)} ${f(cx - w * 0.26)} ${f(apex + (spring - apex) * 0.25)} ${f(cx)} ${f(apex)}C${f(cx + w * 0.26)} ${f(apex + (spring - apex) * 0.25)} ${f(x1)} ${f(spring - (spring - apex) * 0.55)} ${f(x1)} ${f(spring)}V${f(y1)}Z`;
};

/** A four-point star, squeezed horizontally by `sx` (foreshortening on a round body). */
const star4 = (x: number, y: number, r: number, sx: number) => {
  const w = r * sx;
  const k = 0.3;
  return `M${f(x)} ${f(y - r)}L${f(x + w * k)} ${f(y - r * k)}L${f(x + w)} ${f(y)}L${f(x + w * k)} ${f(y + r * k)}L${f(x)} ${f(y + r)}L${f(x - w * k)} ${f(y + r * k)}L${f(x - w)} ${f(y)}L${f(x - w * k)} ${f(y - r * k)}Z`;
};

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`;

type Part = { d: string; tone?: "lo" | "hi" };
type LampDef = {
  w: number;
  h: number;
  /** Solid brass pieces; holes are subpaths (evenodd). */
  parts: Part[];
  /** Bars drawn over the glass. */
  bars: string;
  /** Fine highlight lines. */
  hi: string;
  /** Union of the lit areas, for the light's mask. */
  glow: string;
  /** Vertical centre of the light, % of the height. */
  cy: number;
};

// ── Lantern A: a tall hexagonal fanoos with an onion dome and glazed lattice windows (80 × 196)

const A: LampDef = (() => {
  const domeHoles = [circ(40, 30.6, 1.6), circ(33.4, 38.4, 1.25), circ(40, 38.9, 1.25), circ(46.6, 38.4, 1.25)].join("");
  const crownHoles = [
    "M33.4 68.2V64.4C33.4 63 34.5 62 35.9 62H44.1C45.5 62 46.6 63 46.6 64.4V68.2Z",
    "M23.2 68.2V64.6C23.2 63.4 24 62.6 25.2 62.6H26.6C27.8 62.6 28.4 63.4 28.4 64.6V68.2Z",
    "M51.6 68.2V64.6C51.6 63.4 52.2 62.6 53.4 62.6H54.8C56 62.6 56.8 63.4 56.8 64.6V68.2Z",
  ].join("");
  const winC = archWin(32.4, 47.6, 88, 75, 142);
  const winL = archWin(22.8, 28.3, 90, 79.5, 142);
  const winR = archWin(51.7, 57.2, 90, 79.5, 142);
  const bandHoles = [24.4, 30.6, 36.9, 43.1, 49.4, 55.6].map((x) => circ(x, 149.6, 1.15)).join("");
  const bowlHoles = [ellipse(31.6, 162.6, 1.3, 1.8), ellipse(40, 164.6, 1.5, 2.1), ellipse(48.4, 162.6, 1.3, 1.8)].join("");
  const dome = "M40 18.6C43 23.6 53.6 27.6 55.6 35.6C56.9 40.7 53.5 44.7 50.4 46.6H29.6C26.5 44.7 23.1 40.7 24.4 35.6C26.4 27.6 37 23.6 40 18.6Z";
  const bowl = "M24 158H56C56 165.6 48.4 171.6 43.8 174H36.2C31.6 171.6 24 165.6 24 158Z";
  return {
    w: 80,
    h: 196,
    cy: 55,
    parts: [
      { d: "M38.9 10.4h2.2v5h-2.2z" + circ(40, 17.2, 2.3) },
      { d: dome + domeHoles },
      { d: "M27.2 46.6h25.6v3.2H27.2z", tone: "lo" },
      { d: "M24.4 49.8H55.6L61.4 56.2H18.6Z" },
      { d: "M17.4 56.2h45.2v3.6H17.4z", tone: "lo" },
      { d: "M21.6 59.8h36.8V70H21.6Z" + crownHoles },
      { d: "M20 70H60V146H20Z" + winC + winL + winR },
      { d: "M18.4 146h43.2v7.2H18.4Z" + bandHoles, tone: "lo" },
      { d: "M20.4 153.2H59.6L56 158H24Z" },
      { d: bowl + bowlHoles },
      { d: "M37.4 174h5.2v3.2h-5.2z", tone: "lo" },
      { d: circ(40, 180.6, 3.1) + "M40 183.4L41.3 188.6L40 193.4L38.7 188.6Z" },
      // little beads hanging off the brim
      { d: "M18.4 59.8h.8v2h-.8zM60.8 59.8h.8v2h-.8z" + circ(18.8, 63.2, 1.3) + circ(61.2, 63.2, 1.3) },
    ],
    bars:
      lattice(32.4, 88, 47.6, 142, 6.8, 1.55) +
      "M32.4 88H47.6" +
      circ(40, 82.4, 2.1) +
      "M25.55 79.5V142M22.8 101H28.3M22.8 116H28.3M22.8 131H28.3" +
      "M54.45 79.5V142M51.7 101H57.2M51.7 116H57.2M51.7 131H57.2",
    hi: "M30.2 70.6V145.4M49.8 70.6V145.4M40 21.4C37.6 29 36.2 38 36.4 46.4M40 21.4C42.4 29 43.8 38 43.6 46.4M22 60.6H58M20.6 70.4H59.4",
    glow: [dome, "M21.6 59.8h36.8V70H21.6Z", "M20 70H60V146H20Z", "M18.4 146h43.2v7.2H18.4Z", bowl].join(""),
  };
})();

// ── Lantern B: a round fanoos, glass panels between curved brass ribs (72 × 156)

const B: LampDef = (() => {
  const top = 38.6;
  const bot = 112;
  const cx = 36;
  const hw = (y: number) => 17 + 13 * Math.pow(Math.sin((Math.PI * (y - top)) / (bot - top)), 0.85);
  const N = 28;
  const ys = Array.from({ length: N + 1 }, (_, i) => top + ((bot - top) * i) / N);
  const at = (y: number, deg: number) => `${f(cx + hw(y) * Math.sin((deg * Math.PI) / 180))} ${f(y)}`;
  const body = `M${ys.map((y) => at(y, 90)).join("L")}L${[...ys].reverse().map((y) => at(y, -90)).join("L")}Z`;
  // a glass panel between two meridians, inset from the top and bottom rims
  const panel = (a: number, b: number) => {
    const inner = ys.filter((y) => y > top + 4.6 && y < bot - 4.6);
    return `M${inner.map((y) => at(y, a)).join("L")}L${[...inner].reverse().map((y) => at(y, b)).join("L")}Z`;
  };
  const panels = panel(-19, 19) + panel(29, 63) + panel(-63, -29) + panel(71, 86) + panel(-86, -71);
  const merid = (deg: number) => {
    const inner = ys.filter((y) => y > top + 4 && y < bot - 4);
    return `M${inner.map((y) => at(y, deg)).join("L")}`;
  };
  const band = (y: number, dip: number) => {
    const w = hw(y);
    return `M${f(cx - w)} ${f(y)}Q${f(cx)} ${f(y + dip)} ${f(cx + w)} ${f(y)}`;
  };
  const cap = "M36 18.6C38 25 48.6 28.6 52.6 34.6H19.4C23.4 28.6 34 25 36 18.6Z";
  const bowl = "M19 115.6H53C51 123 43 129.6 36 133.2C29 129.6 21 123 19 115.6Z";
  const scallop = Array.from({ length: 8 }, (_, i) => {
    const x = 16.6 + i * 4.9;
    return `M${f(x)} 38.6a2.45 2.45 0 0 0 4.9 0Z`;
  }).join("");
  const rimHoles = [22, 29, 36, 43, 50].map((x) => circ(x, 36.6, 0.9)).join("");
  return {
    w: 72,
    h: 156,
    cy: 49,
    parts: [
      { d: "M34.9 10.4h2.2v4.2h-2.2z" + circ(36, 16.4, 2.2) },
      { d: cap + circ(36, 27.4, 1.5) + ellipse(30.2, 31.6, 0.9, 1.2) + ellipse(41.8, 31.6, 0.9, 1.2) },
      { d: "M16.4 34.6h39.2v4H16.4z" + rimHoles, tone: "lo" },
      { d: scallop, tone: "lo" },
      { d: body + panels },
      { d: "M17 112h38v3.6H17z", tone: "lo" },
      { d: bowl + circ(28.4, 121, 1.1) + ellipse(36, 122.6, 1.3, 1.8) + circ(43.6, 121, 1.1) },
      { d: circ(36, 136.8, 2.7) + "M36 139.4L37.3 144.8L36 150L34.7 144.8Z" },
    ],
    bars: merid(0) + merid(46) + merid(-46) + band(58, 1.6) + band(92, -1.6) + star4(36, 75, 6.2, 0.9),
    hi: `M36 21.4C35 26 33.4 30.4 31 34.4M17.4 36.6H54.6${merid(24)}${merid(-24)}`,
    glow: [cap, body, bowl].join(""),
  };
})();

const LAMPS = { a: A, b: B };
type Kind = keyof typeof LAMPS;

const maskOf = (L: LampDef) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${L.w} ${L.h}'><path d='${L.glow}'/></svg>`;
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  return { WebkitMaskImage: url, maskImage: url } as CSSProperties;
};
const MASKS = { a: maskOf(A), b: maskOf(B) };

function LampSvg({ kind, line = false }: { kind: Kind; line?: boolean }) {
  const L = LAMPS[kind];
  return (
    <svg className={line ? "ln-outline" : "ln-metal"} viewBox={`0 0 ${L.w} ${L.h}`} aria-hidden>
      <circle cx={L.w / 2} cy="6" r="4.2" className="ln-ring" />
      {L.parts.map((p, i) => (
        <path key={i} d={p.d} fillRule="evenodd" className={p.tone ? `ln-p ln-${p.tone}` : "ln-p"} />
      ))}
      {L.bars && <path d={L.bars} className="ln-bars" />}
      {!line && <path d={L.hi} className="ln-hi" />}
    </svg>
  );
}

/** One lantern: halo, light (masked gradient) and brass. `state` picks what the cover shows. */
export function Lamp({ kind, state = "lit" }: { kind: Kind; state?: "lit" | "both" }) {
  const L = LAMPS[kind];
  return (
    <span className={`ln-lamp ln-lamp-${kind}`} style={{ "--ar": `${L.w} / ${L.h}`, "--cy": `${L.cy}%` } as CSSProperties}>
      <span className="ln-lit">
        <span className="ln-halo" />
        <span className="ln-light" style={MASKS[kind]} />
        <LampSvg kind={kind} />
      </span>
      {state === "both" && (
        <span className="ln-unlit">
          <LampSvg kind={kind} line />
        </span>
      )}
    </span>
  );
}

// ── the crescent

function crescentPath(R: number, dx: number, dy: number, r: number) {
  const d = Math.hypot(dx, dy);
  const a = (R * R - r * r + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, R * R - a * a));
  const mx = (a * dx) / d;
  const my = (a * dy) / d;
  const p1: Pt = [mx - (h * dy) / d, my + (h * dx) / d];
  const p2: Pt = [mx + (h * dy) / d, my - (h * dx) / d];
  const ang = (p: Pt, cx: number, cy: number) => Math.atan2(p[1] - cy, p[0] - cx);
  const pick = (cx: number, cy: number, rad: number, from: Pt, to: Pt, keep: (x: number, y: number) => boolean) => {
    const s = ang(from, cx, cy);
    let span = ang(to, cx, cy) - s;
    while (span < 0) span += Math.PI * 2;
    // try clockwise (increasing angle) first
    const mid = s + span / 2;
    const cw = keep(cx + rad * Math.cos(mid), cy + rad * Math.sin(mid));
    const sweep = cw ? 1 : 0;
    const len = cw ? span : Math.PI * 2 - span;
    return `A${f(rad)} ${f(rad)} 0 ${len > Math.PI ? 1 : 0} ${sweep} ${f(to[0])} ${f(to[1])}`;
  };
  const outer = pick(0, 0, R, p1, p2, (x, y) => Math.hypot(x - dx, y - dy) > r);
  const inner = pick(dx, dy, r, p2, p1, (x, y) => Math.hypot(x, y) < R);
  return `M${f(p1[0])} ${f(p1[1])}${outer}${inner}Z`;
}

const CRESCENT = crescentPath(40, 17, -12, 35);

export function Moon({ className = "" }: { className?: string }) {
  return (
    <span className={`ln-moon ${className}`}>
      <span className="ln-moon-glow" />
      <svg viewBox="-50 -50 100 100" aria-hidden>
        <path d={CRESCENT} className="ln-moon-face" />
        <path d={star4(26, -26, 7.5, 1)} className="ln-moon-star" />
      </svg>
    </span>
  );
}

// ── the sky

/** Where each lantern hangs: x (% of width), width (phone px), bottom (% of the sky), swing direction. */
const HANG: { kind: Kind; x: number; w: number; drop: number; dir: number; order: number }[] = [
  { kind: "a", x: 14, w: 74, drop: 84, dir: 1, order: 2 },
  { kind: "b", x: 33, w: 52, drop: 47, dir: -1, order: 0 },
  { kind: "a", x: 68, w: 54, drop: 61, dir: 1, order: 3 },
  { kind: "b", x: 86.5, w: 68, drop: 97, dir: -1, order: 1 },
];

/** Little stars: x %, y % of the sky, size (phone px), sparkle or dot. */
const STARS: [number, number, number, 0 | 1][] = [
  [4, 12, 7, 1], [22, 7, 3, 0], [24, 30, 5, 1], [44, 9, 3, 0], [41, 54, 3.5, 0], [57, 66, 6, 1],
  [61, 6, 2.5, 0], [76, 18, 6, 1], [79, 44, 3, 0], [95, 9, 3, 0], [6, 52, 3, 0], [50, 82, 3, 0],
  [97, 33, 5, 1], [28, 76, 3, 0], [70, 88, 4, 1], [36, 20, 2.5, 0], [55, 39, 2.5, 0], [8, 92, 4.5, 1],
];

function Sky({ lamps }: { lamps: "lit" | "both" }) {
  return (
    <div className="ln-sky">
      {STARS.map(([x, y, s, k], i) => (
        <i
          key={i}
          className={k ? "ln-star is-spark" : "ln-star"}
          style={{ left: `${x}%`, top: `${y}%`, "--s": s, "--i": i % 5 } as CSSProperties}
        />
      ))}
      <Moon />
      {HANG.map((h, i) => (
        <div
          key={i}
          className="ln-hang"
          style={{ left: `${h.x}%`, height: `${h.drop}%`, "--w": h.w, "--dir": h.dir, "--o": h.order, "--n": i } as CSSProperties}
        >
          <div className="ln-sway">
            <i className="ln-chain" />
            <Lamp kind={h.kind} state={lamps} />
          </div>
        </div>
      ))}
    </div>
  );
}

const META = metaFor("lantern");

/** True for light palettes (ivory, or a light custom colour): lanterns switch to dark brass. */
export const isLight = (r: Resolved) => luminance(paletteFor(META, r.data.look).bg) > 0.4;

/** The whole first screen. The cover draws it again with unlit lanterns and no text. */
export function Scene({ r, cover = false }: { r: Resolved; cover?: boolean }) {
  const bism = r.data.bismillah !== "none";
  return (
    <div className={`ln-hero${isLight(r) ? " ln-lt" : ""}${cover ? " ln-hero-cover" : ""}`}>
      <Sky lamps={cover ? "both" : "lit"} />
      <div className="ln-body">
        <div className="ln-in" aria-hidden={cover || undefined}>
          {bism && <Blessing r={r} className="ln-a1" />}
          <p className="ln-title ln-a1">{r.title}</p>
          <Names r={r} className="ln-names ln-a2" />
          {r.milestone && <p className="ln-milestone ln-a2">{r.milestone}</p>}
          <span className="ln-rule ln-a3" aria-hidden>
            <i />
          </span>
          {r.when.date && (
            <div className="ln-when ln-a3">
              {r.when.weekday && <span>{r.when.weekday}</span>}
              <strong>{r.when.date}</strong>
              {r.when.time && <span>{r.when.time}</span>}
            </div>
          )}
          {r.main?.venue && r.oneVenue && <p className="ln-venue ln-a4">{r.main.venue}</p>}
        </div>
        {cover && (
          <span className="ln-tap">
            <i />
            {r.t.tapToOpen}
            <i />
          </span>
        )}
      </div>
      {!cover && (
        <span className="ln-cue" aria-hidden>
          {r.t.scroll}
          <i />
        </span>
      )}
    </div>
  );
}

export function Hero({ r }: HeroProps) {
  return <Scene r={r} />;
}

export function Divider({ index }: { index: number }) {
  return (
    <span className="ln-div">
      <svg className="ln-div-line" viewBox="0 0 240 30" fill="none" aria-hidden>
        <path d="M0 4.5C40 9 80 12 120 12C160 12 200 9 240 4.5" className="ln-thin" />
        <path d="M52 9.6v3M188 9.6v3M86 11.4v2.4M154 11.4v2.4" className="ln-thin" />
        <circle cx="52" cy="14.4" r="1.7" className="ln-dot" />
        <circle cx="188" cy="14.4" r="1.7" className="ln-dot" />
        <circle cx="86" cy="15.2" r="1.2" className="ln-dot" />
        <circle cx="154" cy="15.2" r="1.2" className="ln-dot" />
      </svg>
      <span className="ln-div-lamp">
        <Lamp kind={index % 2 ? "b" : "a"} />
      </span>
    </span>
  );
}

export function Ornament() {
  return (
    <svg className="ln-orn" viewBox="0 0 96 22" fill="none" aria-hidden>
      <path d="M0 11H32M64 11H96" className="ln-thin" />
      <circle cx="28" cy="11" r="1.4" className="ln-dot" />
      <circle cx="68" cy="11" r="1.4" className="ln-dot" />
      <g transform="translate(48 11) scale(.2)">
        <path d={CRESCENT} className="ln-dot" />
        <path d={star4(26, -26, 9, 1)} className="ln-dot" />
      </g>
    </svg>
  );
}

export function Backdrop({ r }: { r: Resolved }) {
  return (
    <div className={`ln-back${isLight(r) ? " ln-lt" : ""}`}>
      <div className="ln-dust" />
      <div className="ln-horizon" />
    </div>
  );
}
