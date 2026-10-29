import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";

// Songket: gold thread on woven silk. The hero is always 390 phone px wide, so the
// kepala kain bands (a row of pucuk rebung over edge stripes) are one 390 × 120
// drawing, mirrored for the bottom. Bunga tabur are a CSS mask on the backdrop.

const f = (n: number) => Math.round(n * 10) / 10;

const diamond = (x: number, y: number, w: number, h: number) =>
  `M${f(x)} ${f(y - h)}L${f(x + w)} ${f(y)}L${f(x)} ${f(y + h)}L${f(x - w)} ${f(y)}Z`;

/** A small four-petal flower (bunga tampuk) made of diamonds around a dot. */
export const bunga = (x: number, y: number, s: number) =>
  diamond(x, y - 3.2 * s, 1.6 * s, 2.4 * s) +
  diamond(x, y + 3.2 * s, 1.6 * s, 2.4 * s) +
  diamond(x - 3.2 * s, y, 2.4 * s, 1.6 * s) +
  diamond(x + 3.2 * s, y, 2.4 * s, 1.6 * s);

const TW = 65; // one pucuk rebung
const BASE_Y = 22;
const APEX_Y = 104;

/** The kepala kain band: edge stripes, a row of pucuk rebung and a zigzag base. */
const BAND = (() => {
  let shoots = "";
  let inner = "";
  let lattice = "";
  let gaps = "";
  let gapFill = "";
  for (let i = 0; i < 6; i++) {
    const x0 = i * TW;
    const cx = x0 + TW / 2;
    shoots += `M${x0 + 1.5} ${BASE_Y}L${cx} ${APEX_Y}L${x0 + TW - 1.5} ${BASE_Y}`;
    const top = BASE_Y + 5;
    const tip = APEX_Y - 13;
    const half = TW / 2 - 10;
    inner += `M${cx - half} ${top}L${cx} ${tip}L${cx + half} ${top}Z`;
    for (let row = 0, y = top + 6; y < tip - 4; row++, y += 6.4) {
      const hw = (half * (tip - y)) / (tip - top) - 3.2;
      const off = row % 2 ? 3.2 : 0;
      for (let k = -8; k <= 8; k++) {
        const x = cx + off + k * 6.4;
        if (Math.abs(x - cx) <= hw) lattice += diamond(x, y, 1.9, 2.5);
      }
    }
    lattice += diamond(cx, tip + 4.5, 2.4, 3.4);
  }
  // the upward shoots between the big ones, and the halves at each edge
  for (let i = 0; i <= 6; i++) {
    const gx = i * TW;
    gaps += `M${gx - 17} ${APEX_Y - 2}L${gx} ${BASE_Y + 30}L${gx + 17} ${APEX_Y - 2}`;
    gapFill += bunga(gx, APEX_Y - 18, 1.05) + diamond(gx, BASE_Y + 46, 1.8, 2.6);
  }
  let stars = "";
  for (let x = 4.5; x < 390; x += 9) stars += diamond(x, 11.5, 2.6, 3.2);
  let zig = "M0 113";
  for (let x = 0; x < 390; x += 10) zig += `L${x + 5} 108L${x + 10} 113`;
  return {
    stripes: "M0 2.2H390M0 18.6H390",
    thin: "M0 5.6H390M0 15.4H390M0 106.4H390M0 115.6H390",
    stars,
    shoots,
    inner,
    lattice,
    gaps,
    gapFill,
    zig,
  };
})();

export function Band({ className = "" }: { className?: string }) {
  return (
    <svg className={`sk-band ${className}`} viewBox="0 0 390 120" preserveAspectRatio="xMidYMin slice" fill="none" aria-hidden>
      <path d={BAND.stripes} className="sk-line sk-bold" />
      <path d={BAND.thin} className="sk-thin" />
      <path d={BAND.stars} className="sk-fill" />
      <path d={BAND.shoots} className="sk-line" />
      <path d={BAND.inner} className="sk-thin" />
      <path d={BAND.lattice} className="sk-fill" />
      <path d={BAND.gaps} className="sk-thin" />
      <path d={BAND.gapFill} className="sk-fill" />
      <path d={BAND.zig} className="sk-thin" />
    </svg>
  );
}

/** The eight-point bunga medallion: two squares, a ring of petals, a centre. */
const MEDAL = (() => {
  let petals = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x = Math.cos(a) * 15.5;
    const y = Math.sin(a) * 15.5;
    petals += `M${f(Math.cos(a) * 8)} ${f(Math.sin(a) * 8)}Q${f(x + Math.cos(a + 1.2) * 5)} ${f(y + Math.sin(a + 1.2) * 5)} ${f(Math.cos(a) * 22)} ${f(Math.sin(a) * 22)}Q${f(x + Math.cos(a - 1.2) * 5)} ${f(y + Math.sin(a - 1.2) * 5)} ${f(Math.cos(a) * 8)} ${f(Math.sin(a) * 8)}Z`;
  }
  let ring = "";
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 + Math.PI / 16;
    ring += diamond(Math.cos(a) * 29, Math.sin(a) * 29, 1.3, 1.3);
  }
  return {
    ring,
    star: "M0 -46L46 0L0 46L-46 0ZM-32.5 -32.5H32.5V32.5H-32.5Z",
    star2: "M0 -39L39 0L0 39L-39 0ZM-27.5 -27.5H27.5V27.5H-27.5Z",
    petals,
  };
})();

export function Medallion({ className = "", plain = false }: { className?: string; plain?: boolean }) {
  return (
    <svg className={`sk-medal ${className}`} viewBox="-50 -50 100 100" fill="none" aria-hidden>
      <path d={MEDAL.star} className="sk-medal-bg" />
      <path d={MEDAL.star} className="sk-line" />
      <path d={MEDAL.star2} className="sk-thin" />
      {!plain && (
        <>
          <path d={MEDAL.petals} className="sk-fill sk-petal" />
          <circle r="4" className="sk-fill" />
        </>
      )}
      <circle r="24.5" className="sk-thin" />
      {plain && (
        <>
          <circle r="22" className="sk-medal-bg" />
          <path d={MEDAL.ring} className="sk-fill" />
        </>
      )}
    </svg>
  );
}

const MINI = (() => {
  let tri = "";
  let dots = "";
  for (let i = 0; i < 7; i++) {
    const cx = 44 + i * 14;
    tri += `M${cx - 5} 17L${cx} 5.5L${cx + 5} 17Z`;
    if (i < 6) dots += diamond(cx + 7, 14.5, 1.3, 1.8);
  }
  return { tri, dots };
})();

/** A row of small pucuk rebung between two threads. */
export function Shoots({ className = "" }: { className?: string }) {
  return (
    <svg className={`sk-shoots ${className}`} viewBox="0 0 172 22" fill="none" aria-hidden>
      <path d="M0 19.6H172M0 2.4H172" className="sk-thin" />
      <path d={MINI.tri} className="sk-fill" />
      <path d={MINI.dots} className="sk-fill" />
      <path d={bunga(18, 11, 0.9) + bunga(154, 11, 0.9)} className="sk-fill" />
    </svg>
  );
}

export function Hero({ r }: HeroProps) {
  const bism = r.data.bismillah !== "none";
  return (
    <div className="sk-hero">
      <div className="sk-clear" />
      <Band className="sk-band-t" />
      <Band className="sk-band-b" />
      <span className="sk-tepi sk-tepi-l" />
      <span className="sk-tepi sk-tepi-r" />
      <div className="sk-body">
        {bism ? <Blessing r={r} className="sk-bless sk-a1" /> : <Medallion className="sk-crest sk-a1" />}
        <p className="sk-title sk-a2">{r.title}</p>
        <Names r={r} className="sk-names sk-a3" />
        {r.milestone && <p className="sk-milestone sk-a3">{r.milestone}</p>}
        <Shoots className="sk-rule sk-a4" />
        {r.when.date && (
          <div className="sk-when sk-a4">
            {r.when.weekday && <span>{r.when.weekday}</span>}
            <strong>{r.when.date}</strong>
            {r.when.time && <span>{r.when.time}</span>}
          </div>
        )}
        {r.main?.venue && r.oneVenue && <p className="sk-venue sk-a5">{r.main.venue}</p>}
      </div>
    </div>
  );
}

export function Divider({ index }: { index: number }) {
  return <Shoots className={`sk-divider${index % 2 ? " is-flip" : ""}`} />;
}

export function Ornament() {
  return (
    <svg className="sk-orn" viewBox="0 0 80 14" fill="none" aria-hidden>
      <path d="M0 7H26M54 7H80" className="sk-thin" />
      <path d={bunga(40, 7, 0.95)} className="sk-fill" />
      <path d={diamond(30, 7, 1.6, 2.2) + diamond(50, 7, 1.6, 2.2)} className="sk-fill" />
    </svg>
  );
}

export function Backdrop() {
  return (
    <>
      <div className="sk-weave" />
      <div className="sk-tabur" />
    </>
  );
}
