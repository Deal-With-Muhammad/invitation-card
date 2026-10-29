import type { CSSProperties } from "react";

import type { Resolved } from "../../resolve";
import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";

// Confetti Pop: flat party shapes drawn as stickers (2.5 ink outline, offset solid
// shadow), chunky Shrikhand names and a scalloped badge for the big number.
// Shapes are placed by hand so they hug the edges and leave the middle for type.

type Vars = CSSProperties & Record<`--${string}`, string | number>;

const f = (n: number) => Math.round(n * 100) / 100;

/** A scalloped badge edge: bumps bulging out between points on a circle. */
function scallop(cx: number, cy: number, r: number, n: number) {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
  const chord = 2 * r * Math.sin(Math.PI / n);
  const br = f(chord * 0.56);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i <= n; i++) {
    const [x, y] = pts[i % n];
    d += `A${br} ${br} 0 0 1 ${f(x)} ${f(y)}`;
  }
  return `${d}Z`;
}

const BADGE = scallop(60, 60, 50, 20);

/** A four-point sparkle centred on x,y. */
const sparkle = (x: number, y: number, s: number) =>
  `M${x} ${y - s}C${f(x + s * 0.18)} ${f(y - s * 0.18)} ${f(x + s * 0.18)} ${f(y - s * 0.18)} ${x + s} ${y}C${f(x + s * 0.18)} ${f(y + s * 0.18)} ${f(x + s * 0.18)} ${f(y + s * 0.18)} ${x} ${y + s}C${f(x - s * 0.18)} ${f(y + s * 0.18)} ${f(x - s * 0.18)} ${f(y + s * 0.18)} ${x - s} ${y}C${f(x - s * 0.18)} ${f(y - s * 0.18)} ${f(x - s * 0.18)} ${f(y - s * 0.18)} ${x} ${y - s}Z`;

/** A five-point star centred on x,y with outer radius r. */
function star(x: number, y: number, r: number, turn = 0) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2 + turn;
    const rr = i % 2 ? r * 0.46 : r;
    d += `${i ? "L" : "M"}${f(x + Math.cos(a) * rr)} ${f(y + Math.sin(a) * rr)}`;
  }
  return `${d}Z`;
}

function Balloon({ x, y, rx, ry, tone, string }: { x: number; y: number; rx: number; ry: number; tone: string; string: string }) {
  const b = y + ry;
  return (
    <g className="cf-balloon">
      <path d={string} className="cf-string" />
      <ellipse cx={x + 4} cy={y + 4} rx={rx} ry={ry} className="cf-shadow" />
      <path d={`M${x - 5} ${b + 7}L${x} ${b - 1}L${x + 5} ${b + 7}Z`} className={`cf-o ${tone}`} />
      <ellipse cx={x} cy={y} rx={rx} ry={ry} className={`cf-o ${tone}`} />
      <path d={`M${f(x - rx * 0.62)} ${f(y - ry * 0.18)}C${f(x - rx * 0.6)} ${f(y - ry * 0.55)} ${f(x - rx * 0.32)} ${f(y - ry * 0.78)} ${f(x - rx * 0.02)} ${f(y - ry * 0.8)}`} className="cf-shine" />
    </g>
  );
}

/** Balloons, stars and confetti along the top edge. */
function TopShapes() {
  return (
    <svg className="cf-shapes cf-top" viewBox="0 0 390 300" preserveAspectRatio="xMidYMin meet" aria-hidden>
      <Balloon x={58} y={84} rx={30} ry={36} tone="cf-a" string="M58 128c-9 16 9 28 0 44s8 30-3 48c-6 10-4 20 2 30" />
      <Balloon x={334} y={64} rx={25} ry={30} tone="cf-s" string="M334 101c8 14-8 25 1 39s-6 28 3 44" />
      <path d="M118 50c7-8 15 8 22 0s15 8 22 0s15 8 22 0" className="cf-squig cf-ka" />
      <path d={sparkle(212, 34, 11)} className="cf-o cf-s" />
      <path d={star(268, 132, 13, 0.2)} className="cf-o cf-p" />
      <path d="M150 108l18 4-12 13Z" className="cf-o cf-i" />
      <path d="M244 72l9 15h-18Z" className="cf-o cf-a" />
      <circle cx="110" cy="158" r="6" className="cf-o cf-p" />
      <circle cx="292" cy="22" r="5" className="cf-fill-i" />
      <circle cx="186" cy="88" r="4" className="cf-fill-a" />
      <circle cx="372" cy="150" r="4.5" className="cf-fill-a" />
      <circle cx="18" cy="190" r="4" className="cf-fill-p" />
      <rect x="300" y="168" width="16" height="7" rx="2" transform="rotate(-28 308 171)" className="cf-o cf-a" />
      <rect x="84" y="20" width="15" height="6" rx="2" transform="rotate(24 91 23)" className="cf-o cf-s" />
      <path d="M352 210a14 14 0 0 1 28 0" className="cf-arc cf-ki" />
      <path d={sparkle(30, 236, 7)} className="cf-fill-a" />
    </svg>
  );
}

/** A half-sun, zigzag and more confetti along the bottom edge. */
function BottomShapes() {
  return (
    <svg className="cf-shapes cf-bottom" viewBox="0 0 390 200" preserveAspectRatio="xMidYMax meet" aria-hidden>
      <path d="M-6 206a62 62 0 0 1 124 0Z" className="cf-o cf-s" />
      <path d="M14 206a42 42 0 0 1 84 0" className="cf-arc cf-ka" />
      <path d="M34 206a22 22 0 0 1 44 0Z" className="cf-o cf-a" />
      <path d="M270 168l14-14 14 14 14-14 14 14 14-14 14 14" className="cf-zig cf-ki" />
      <path d={star(350, 104, 15, -0.15)} className="cf-o cf-a" />
      <path d="M150 158c7-8 15 8 22 0s15 8 22 0" className="cf-squig cf-kp" />
      <path d={sparkle(236, 120, 10)} className="cf-o cf-s" />
      <path d="M128 112l8 15h-16Z" className="cf-o cf-p" />
      <circle cx="214" cy="178" r="6" className="cf-o cf-a" />
      <circle cx="300" cy="66" r="4.5" className="cf-fill-i" />
      <circle cx="160" cy="70" r="4" className="cf-fill-a" />
      <circle cx="378" cy="40" r="4" className="cf-fill-p" />
      <circle cx="20" cy="60" r="5" className="cf-o cf-a" />
      <rect x="84" y="40" width="16" height="7" rx="2" transform="rotate(32 92 43)" className="cf-o cf-p" />
      <rect x="250" y="20" width="14" height="6" rx="2" transform="rotate(-18 257 23)" className="cf-o cf-s" />
    </svg>
  );
}

export function Badge({ r }: { r: Resolved }) {
  const m = r.milestone;
  const num = /^(\d+)\s*(.*)$/.exec(m);
  return (
    <div className="cf-badge">
      <svg viewBox="-6 -6 136 136" aria-hidden>
        <path d={BADGE} transform="translate(5 5)" className="cf-shadow" />
        <path d={BADGE} className="cf-o cf-a" />
        <circle cx="60" cy="60" r="38" className="cf-ring" />
      </svg>
      <p className="cf-badge-in" style={{ "--bl": num ? num[1].length : m.length } as Vars}>
        {m ? (
          num ? (
            <>
              <b>{num[1]}</b>
              {num[2] && <small>{num[2]}</small>}
            </>
          ) : (
            <b className="is-text">{m}</b>
          )
        ) : (
          <>
            <b>{(r.main?.start != null && r.main.day) || [...(r.people[0]?.name ?? "")][0] || ""}</b>
            {r.main?.start != null && r.main.monthShort && <small>{r.main.monthShort}</small>}
          </>
        )}
      </p>
    </div>
  );
}

/* ── fitting the names ── */

// Advance widths (em, ×100) of Shrikhand, measured in the browser, so the longest
// name is set as large as the column allows without breaking.
const NAME_W = Object.fromEntries(
  "a65,b68,c54,d66,e56,f42,g64,h71,i37,j34,k70,l37,m105,n72,o66,p69,q68,r58,s59,t43,u69,v60,w93,x60,y62,z66,A70,B76,C69,D77,E67,F63,G76,H83,I40,J59,K79,L65,M104,N73,O73,P68,Q73,R76,S69,T76,U79,V73,W114,X81,Y79,Z73, 20,'26,-57,.30,"
    .split(",")
    .filter(Boolean)
    .map((p) => [p[0], Number(p.slice(1)) / 100]),
);

function namesEm(r: Resolved) {
  const own = !r.data.look.namesFont || r.data.look.namesFont === "shrikhand";
  const w = (s: string) => {
    if (!own) return s.length * 0.72;
    let t = 0;
    for (const c of s) t += NAME_W[c] ?? NAME_W[c.normalize("NFD")[0]] ?? 0.72;
    return t;
  };
  // + room for the offset shadow and the slight tilt
  return Math.max(2, ...r.people.map((p) => w(p.name))) * 1.08 + 0.12;
}

export function Hero({ r }: HeroProps) {
  const bless = r.data.bismillah !== "none";
  const day = r.main?.start != null && !r.when.multi ? [r.when.weekday, r.main.day, r.main.monthShort].filter(Boolean).join(" ") : r.when.date;
  const date = r.milestone ? [day, r.when.time].filter(Boolean).join(" · ") : r.when.multi ? r.when.date : [r.when.weekday, r.when.time].filter(Boolean).join(" · ");
  return (
    <div className="cf-hero">
      <TopShapes />
      <BottomShapes />
      <div className="cf-in">
        {bless && <Blessing r={r} className="cf-bless cf-a1" />}
        <p className="cf-title cf-a1">{r.title}</p>
        <div className="cf-namebox" style={{ "--nw": namesEm(r).toFixed(3) } as Vars}>
          <Names r={r} className={`cf-names cf-a2${r.people.length > 1 ? " is-two" : ""}`} />
        </div>
        <Badge r={r} />
        {date && (
          <p className="cf-date cf-a4" dir="auto">
            {date}
          </p>
        )}
        {r.main?.venue && r.oneVenue && <p className="cf-venue cf-a4">{r.main.venue}</p>}
      </div>
      <span className="cf-cue" aria-hidden>
        {r.t.scroll}
        <svg viewBox="0 0 12 8" fill="none">
          <path d="M1.5 1.5 6 6l4.5-4.5" />
        </svg>
      </span>
    </div>
  );
}

/* ── body pieces ── */

export function Divider({ index }: { index: number }) {
  return (
    <svg className="cf-divider" viewBox="0 0 160 26" aria-hidden>
      <circle cx="14" cy="13" r="5" className={`cf-o ${index % 2 ? "cf-a" : "cf-s"}`} />
      <path d="M40 18l7-12 7 12Z" className="cf-o cf-p" />
      <path d="M66 13c5-6 10 6 15 0s10 6 15 0s10 6 15 0" className="cf-squig cf-ka" />
      <path d={sparkle(130, 13, 7)} className={`cf-o ${index % 2 ? "cf-s" : "cf-a"}`} />
      <circle cx="150" cy="13" r="3" className="cf-fill-i" />
    </svg>
  );
}

export function Ornament() {
  return (
    <svg className="cf-orn" viewBox="0 0 70 12" fill="none" aria-hidden>
      <path d="M3 6c5-5 9 5 14 0s9 5 14 0s9 5 14 0s9 5 14 0s9 5 8 0" />
    </svg>
  );
}

export function Backdrop() {
  return (
    <>
      <div className="cf-dots" />
      <div className="cf-dots cf-dots-2" />
    </>
  );
}
