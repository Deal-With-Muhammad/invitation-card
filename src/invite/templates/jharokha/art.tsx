import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";

// Geometry for a cusped Mughal arch, in a 300 × 520 box. Computed once at import,
// so server thumbnails and the live card draw exactly the same lines.

type Pt = [number, number];

const bez = (a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ];
};

const f = (n: number) => Math.round(n * 10) / 10;

/** The opening: straight jambs, then lobes rising to a pointed apex. */
function cusped(spring: number, x0: number, apexY: number, lobes: number) {
  const a: Pt = [x0, spring];
  const b: Pt = [x0, spring - 68];
  const c: Pt = [(x0 + 150) / 2 - 4, apexY + 36];
  const d: Pt = [150, apexY];
  const left: Pt[] = [];
  for (let i = 0; i <= lobes; i++) left.push(bez(a, b, c, d, i / lobes));
  const right = left.slice(0, -1).reverse().map(([x, y]) => [300 - x, y] as Pt);
  const pts = [...left, ...right];
  let path = `M${x0} 520V${spring}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    const r = Math.hypot(x - px, y - py) * 0.6;
    path += `A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y)}`;
  }
  return `${path}V520`;
}

export const OPENING = cusped(205, 40, 62, 5);
const OPENING_INNER = cusped(209, 47, 74, 5);
const OUTER = "M26 520V198C26 128 84 82 150 44C216 82 274 128 274 198V520";

const MERLONS = Array.from({ length: 14 }, (_, i) => {
  const x = 22 + i * 20;
  return `M${x - 7} 14C${x - 7} 8 ${x - 3} 4 ${x} 0C${x + 3} 4 ${x + 7} 8 ${x + 7} 14`;
}).join("");

function Rosette({ x, y, r }: { x: number; y: number; r: number }) {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const px = x + Math.cos(a) * r * 0.62;
    const py = y + Math.sin(a) * r * 0.62;
    return <ellipse key={i} cx={f(px)} cy={f(py)} rx={f(r * 0.42)} ry={f(r * 0.17)} transform={`rotate(${i * 45} ${f(px)} ${f(py)})`} />;
  });
  return (
    <g className="jh-rosette">
      {petals}
      <circle cx={x} cy={y} r={f(r * 0.2)} className="jh-fill" />
    </g>
  );
}

/** The carved frame: kangura cresting, alfiz border, spandrel rosettes, arch lines, capitals. */
export function ArchFrame({ className = "" }: { className?: string }) {
  return (
    <svg className={`jh-frame ${className}`} viewBox="0 0 300 520" fill="none" aria-hidden>
      <path d={MERLONS} className="jh-thin" />
      <path d="M10 14H290M10 20H290" className="jh-line" />
      <path d="M10 14V520M290 14V520M16 20V520M284 20V520" className="jh-line" />
      <path d={OUTER} className="jh-line jh-bold" />
      <path d={OPENING} className="jh-line jh-bold" />
      <path d={OPENING_INNER} className="jh-thin" />
      <Rosette x={52} y={62} r={16} />
      <Rosette x={248} y={62} r={16} />
      <path d="M36 92C46 110 34 126 20 132M264 92C254 110 266 126 280 132" className="jh-thin" />
      <circle cx="150" cy="30" r="5" className="jh-line" />
      <path d="M150 35V44" className="jh-thin" />
      {/* capitals and plinth */}
      <path d="M30 205H54M30 211H54M246 205H270M246 211H270" className="jh-line" />
      <path d="M16 498H284M16 504H284" className="jh-thin" />
      <path d="M30 498c4-8 8-8 12 0M258 498c4-8 8-8 12 0" className="jh-thin" />
    </svg>
  );
}

const initials = (names: string[]) => names.map((n) => n.trim().charAt(0).toUpperCase()).filter(Boolean);

export function Monogram({ names, className = "" }: { names: string[]; className?: string }) {
  const ini = initials(names);
  return (
    <span className={`jh-mono ${className}`}>
      {ini.length > 1 ? (
        <>
          {ini[0]}
          <i>&amp;</i>
          {ini[1]}
        </>
      ) : (
        ini[0] ?? "✦"
      )}
    </span>
  );
}

export function Hero({ r }: HeroProps) {
  const bism = r.data.bismillah !== "none";
  return (
    <div className="jh-hero">
      <div className="jh-arch">
        <ArchFrame />
        <div className="jh-in">
          {bism ? (
            <Blessing r={r} className="jh-a1" />
          ) : (
            <svg className="jh-star jh-a1" viewBox="-20 -20 40 40" aria-hidden>
              <Rosette x={0} y={0} r={16} />
            </svg>
          )}
          <p className="jh-title jh-a2">{r.title}</p>
          <Names r={r} className="jh-names jh-a3" />
          {r.milestone && <p className="jh-milestone jh-a3">{r.milestone}</p>}
          <span className="jh-rule jh-a4" aria-hidden>
            <i />
          </span>
          {r.when.date && (
            <div className="jh-when jh-a4">
              {r.when.weekday && <span>{r.when.weekday}</span>}
              <strong>{r.when.date}</strong>
              {r.when.time && <span>{r.when.time}</span>}
            </div>
          )}
          {r.main?.venue && r.oneVenue && <p className="jh-venue jh-a5">{r.main.venue}</p>}
        </div>
      </div>
      <span className="jh-cue" aria-hidden>
        {r.t.scroll}
        <i />
      </span>
    </div>
  );
}

export function Divider({ index }: { index: number }) {
  return (
    <svg className="jh-divider" viewBox="0 0 220 28" fill="none" aria-hidden>
      <path d="M0 14H82M138 14H220" className="jh-thin" />
      <path d="M86 14c8-10 16-10 24 0c8 10 16 10 24 0" className="jh-line" />
      {index % 2 === 0 ? <Rosette x={110} y={14} r={8} /> : <circle cx="110" cy="14" r="3" className="jh-fill" />}
      <circle cx="78" cy="14" r="1.6" className="jh-fill" />
      <circle cx="142" cy="14" r="1.6" className="jh-fill" />
    </svg>
  );
}

export function Ornament() {
  return (
    <svg className="jh-orn" viewBox="0 0 90 16" fill="none" aria-hidden>
      <path d="M0 8H30M60 8H90" className="jh-thin" />
      <path d="M33 13V9C33 4 39 2 45 0C51 2 57 4 57 9V13" className="jh-line" />
      <circle cx="45" cy="9" r="1.8" className="jh-fill" />
    </svg>
  );
}

export function Backdrop() {
  return (
    <>
      <div className="jh-jali" />
      <div className="jh-vignette" />
    </>
  );
}
