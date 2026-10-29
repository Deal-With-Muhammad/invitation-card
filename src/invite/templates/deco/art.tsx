import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";

// Gatsby: an art deco frame drawn in a 300 × 540 box. Everything inside the frame is
// sized in --a (1/300 of the frame width), so it scales with the frame. The sunburst
// rises from the stepped base line under the names; geometry is computed at import
// so server thumbnails and the live card match line for line.

const f = (n: number) => Math.round(n * 10) / 10;

/** A rectangle whose corners step inwards `n` times by `s`. */
export function stepRect(x0: number, y0: number, x1: number, y1: number, s: number, n = 2) {
  type Pt = [number, number];
  // the top-left corner, walked from the left edge round to the top edge
  const c: Pt[] = [];
  for (let i = 0; i < n; i++) c.push([x0 + i * s, y0 + (n - i) * s], [x0 + (i + 1) * s, y0 + (n - i) * s]);
  c.push([x0 + n * s, y0]);
  const mx = (x: number) => x0 + x1 - x;
  const my = (y: number) => y0 + y1 - y;
  const pts: Pt[] = [
    ...c,
    ...[...c].reverse().map(([x, y]): Pt => [mx(x), y]),
    ...c.map(([x, y]): Pt => [mx(x), my(y)]),
    ...[...c].reverse().map(([x, y]): Pt => [x, my(y)]),
  ];
  return `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L")}Z`;
}

const OUTER = stepRect(4, 4, 296, 536, 6);
const INNER = stepRect(9, 9, 291, 531, 6);

/** A quarter fan tucked into the top-left corner; the others are mirrored copies. */
const CORNER_FAN = (() => {
  const cx = 9;
  const cy = 9;
  const arc = (r: number) => `M${cx + r} ${cy}A${r} ${r} 0 0 1 ${cx} ${cy + r}`;
  let rays = "";
  for (let a = 15; a <= 75; a += 15) {
    const t = (a * Math.PI) / 180;
    const r0 = a === 45 ? 19 : 23;
    rays += `M${f(cx + Math.cos(t) * r0)} ${f(cy + Math.sin(t) * r0)}L${f(cx + Math.cos(t) * 37)} ${f(cy + Math.sin(t) * 37)}`;
  }
  return { arcs: arc(23) + arc(37), rays };
})();

const PINSTRIPES = "M17 64V476M21 74V466M25 84V456M283 64V476M279 74V466M275 84V456";

/** The big sunburst: rays from the base diamond to an ellipse, long and short in turn. */
const FAN = (() => {
  const ox = 150;
  const oy = 304;
  const N = 26;
  let long = "";
  let short = "";
  for (let k = 1; k < N; k++) {
    const t = Math.PI + (k / N) * Math.PI;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const isLong = k % 2 === 0;
    const r0x = 50;
    const r0y = 58;
    const L = isLong ? 1 : 0.86;
    const d = `M${f(ox + c * r0x)} ${f(oy + s * r0y)}L${f(ox + c * 114 * L)} ${f(oy + s * 170 * L)}`;
    if (isLong) long += d;
    else short += d;
  }
  return {
    long,
    short,
    arcs: `M${ox - 121} ${oy}A121 178 0 0 1 ${ox + 121} ${oy}M${ox - 44} ${oy}A44 52 0 0 1 ${ox + 44} ${oy}M${ox - 37} ${oy}A37 44 0 0 1 ${ox + 37} ${oy}`,
  };
})();

const BASE =
  "M34 304H134M166 304H266M58 299.5H134M166 299.5H242M58 308.5H134M166 308.5H242M58 299.5V308.5M242 299.5V308.5M150 292L162 304L150 316L138 304Z";

const CHEVRONS = "M128 470L150 486L172 470M134 480L150 492L166 480M122 460L150 480L178 460M64 474H112M188 474H236M84 478H112M188 478H216";

const CREST = (() => {
  let rays = "";
  for (let a = 200; a <= 340; a += 20) {
    const t = (a * Math.PI) / 180;
    rays += `M${f(150 + Math.cos(t) * 9)} ${f(62 + Math.sin(t) * 9)}L${f(150 + Math.cos(t) * 22)} ${f(62 + Math.sin(t) * 22)}`;
  }
  return `${rays}M124 62A26 26 0 0 1 176 62M66 62H118M182 62H234M90 57.5H118M182 57.5H210M90 57.5V62M210 57.5V62`;
})();

/** The fixed frame: double stepped border, corner fans and pinstripes. */
export function Frame({ crest }: { crest: boolean }) {
  return (
    <svg className="dc-frame" viewBox="0 0 300 540" fill="none" aria-hidden>
      <path d={OUTER} className="dc-line dc-bold" />
      <path d={INNER} className="dc-thin" />
      {["", "matrix(-1 0 0 1 300 0)", "matrix(1 0 0 -1 0 540)", "matrix(-1 0 0 -1 300 540)"].map((t) => (
        <g key={t} transform={t || undefined}>
          <path d={CORNER_FAN.arcs} className="dc-line" />
          <path d={CORNER_FAN.rays} className="dc-thin" />
        </g>
      ))}
      <path d={PINSTRIPES} className="dc-thin" />
      {crest && <path d={CREST} className="dc-line" />}
      <path d={BASE} className="dc-line" />
      <path d="M150 297.5L156.5 304L150 310.5L143.5 304Z" className="dc-fill" />
      <path d={CHEVRONS} className="dc-line" />
    </svg>
  );
}

export function Fan({ className = "" }: { className?: string }) {
  return (
    <svg className={`dc-fan ${className}`} viewBox="0 0 300 540" fill="none" aria-hidden>
      <path d={FAN.short} className="dc-thin" />
      <path d={FAN.long} className="dc-line" />
      <path d={FAN.arcs} className="dc-thin" />
    </svg>
  );
}

export function Hero({ r }: HeroProps) {
  const bism = r.data.bismillah !== "none";
  return (
    <div className="dc-hero">
      <div className="dc-box">
        <Fan />
        <Frame crest={!bism} />
        <div className="dc-in">
          {bism && <Blessing r={r} className="dc-bless dc-a1" />}
          <p className="dc-title dc-a2">{r.title}</p>
          <div className="dc-names-box">
            <Names r={r} className="dc-names dc-a3" />
            {r.milestone && <p className="dc-milestone dc-a3">{r.milestone}</p>}
          </div>
          <div className="dc-lower">
            {r.when.date && (
              <div className="dc-when dc-a4">
                {r.when.weekday && <span>{r.when.weekday}</span>}
                <strong>{r.when.date}</strong>
                {r.when.time && <span>{r.when.time}</span>}
              </div>
            )}
            {r.main?.venue && r.oneVenue && <p className="dc-venue dc-a5">{r.main.venue}</p>}
          </div>
        </div>
      </div>
      <span className="dc-cue" aria-hidden>
        {r.t.scroll}
        <i />
      </span>
    </div>
  );
}

export function Divider({ index }: { index: number }) {
  return (
    <svg className="dc-divider" viewBox="0 0 240 24" fill="none" aria-hidden>
      <path d="M0 12H96M144 12H240M36 7.5H96M144 7.5H204M36 16.5H96M144 16.5H204M36 7.5V16.5M204 7.5V16.5M96 7.5V16.5M144 7.5V16.5" className="dc-line" />
      <path d="M120 0L132 12L120 24L108 12Z" className="dc-line" />
      {index % 2 === 0 ? (
        <path d="M120 5L127 12L120 19L113 12Z" className="dc-fill" />
      ) : (
        <path d="M120 7L125 12L120 17L115 12ZM104 12H100M136 12H140" className="dc-line" />
      )}
    </svg>
  );
}

export function Ornament() {
  return (
    <svg className="dc-orn" viewBox="0 0 120 14" fill="none" aria-hidden>
      <path d="M0 7H48M72 7H120M24 3.5H48M72 3.5H96M24 10.5H48M72 10.5H96" className="dc-thin" />
      <path d="M60 0L67 7L60 14L53 7Z" className="dc-line" />
      <path d="M60 3.5L63.5 7L60 10.5L56.5 7Z" className="dc-fill" />
    </svg>
  );
}

export function Backdrop() {
  return (
    <>
      <div className="dc-scales" />
      <div className="dc-vignette" />
    </>
  );
}
