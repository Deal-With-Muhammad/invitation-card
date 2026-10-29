import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";
import { ARCH, BAND_TILE, DIVIDER, khatam, TESS } from "./geo";

// Zellige: a pointed-arch panel whose border is one strip of the star-and-cross
// tiling, set on the full tiling, which fades away toward the middle.

const FINIAL = {
  star: khatam(150, -6, 8.5),
  inner: khatam(150, -6, 3.6, Math.PI / 8),
};

/** The arch top of the panel: band, stars, inner hairline and a star finial. */
function ArchTop() {
  const a = ARCH;
  return (
    <svg className="zl-arch" viewBox="0 -22 300 222" fill="none" aria-hidden>
      <path d={`${a.outer}Z`} className="zl-bandfill" />
      <path d={a.fill} className="zl-cardfill" />
      <path d={a.stars} className="zl-star" />
      <path d={a.hearts} className="zl-gold" />
      <path d={a.outer} className="zl-edge" />
      <path d={a.inner} className="zl-edge" />
      <path d={a.line} className="zl-hair" />
      <path d={`M150 ${a.apexY - 6}V2.5`} className="zl-edge" />
      <path d={FINIAL.star} className="zl-edge zl-bgfill" />
      <path d={FINIAL.inner} className="zl-gold" />
    </svg>
  );
}

export function Hero({ r }: HeroProps) {
  const bism = r.data.bismillah !== "none";
  return (
    <div className="zl-hero">
      <div className="zl-panel" style={{ ["--band" as string]: BAND_TILE }}>
        <ArchTop />
        <div className="zl-body" aria-hidden>
          <i className="zl-band zl-band-s" />
          <i className="zl-band zl-band-e" />
          <i className="zl-band zl-band-b" />
        </div>
        <div className="zl-in">
          {bism ? (
            <Blessing r={r} className="zl-a1" />
          ) : (
            <svg className="zl-mark zl-a1" viewBox="-12 -12 24 24" fill="none" aria-hidden>
              <path d={khatam(0, 0, 11)} className="zl-edge" />
              <path d={khatam(0, 0, 6.4, Math.PI / 8)} className="zl-hair" />
              <path d={khatam(0, 0, 2.8)} className="zl-gold" />
            </svg>
          )}
          <p className="zl-title zl-a2">{r.title}</p>
          <Names r={r} className="zl-names zl-a3" />
          {r.milestone && <p className="zl-milestone zl-a3">{r.milestone}</p>}
          <svg className="zl-rule zl-a4" viewBox="0 0 160 16" fill="none" aria-hidden>
            <path d="M0 8H66M94 8H160" className="zl-hair" />
            <path d={khatam(80, 8, 7)} className="zl-edge" />
            <path d={khatam(80, 8, 2.6, Math.PI / 8)} className="zl-gold" />
            <path d={khatam(60, 8, 2.2)} className="zl-gold" />
            <path d={khatam(100, 8, 2.2)} className="zl-gold" />
          </svg>
          {r.when.date && (
            <div className="zl-when zl-a4">
              {r.when.weekday && <span>{r.when.weekday}</span>}
              <strong>{r.when.date}</strong>
              {r.when.time && <span>{r.when.time}</span>}
            </div>
          )}
          {r.main?.venue && r.oneVenue && <p className="zl-venue zl-a5">{r.main.venue}</p>}
        </div>
      </div>
      <span className="zl-cue" aria-hidden>
        {r.t.scroll}
        <i />
      </span>
    </div>
  );
}

export function Divider({ index }: { index: number }) {
  const d = DIVIDER;
  return (
    <svg className="zl-divider" viewBox="0 0 220 28" fill="none" aria-hidden>
      <path d={d.links} className="zl-hair" />
      <path d={d.stars} className="zl-edge" />
      <path d={d.inner} className="zl-gold" />
      {index % 2 === 0 &&
        d.dots.map(([x, y], i) => <circle key={i} cx={+(x).toFixed(2)} cy={+(y).toFixed(2)} r="1.2" className="zl-gold" />)}
    </svg>
  );
}

export function Ornament() {
  return (
    <svg className="zl-orn" viewBox="0 0 90 16" fill="none" aria-hidden>
      <path d="M0 8H34M56 8H90" className="zl-hair" />
      <path d={khatam(45, 8, 7)} className="zl-edge" />
      <path d={khatam(45, 8, 2.4, Math.PI / 8)} className="zl-gold" />
    </svg>
  );
}

export function Backdrop() {
  return (
    <>
      <Tiling />
      <div className="zl-fade" />
    </>
  );
}

export function Tiling() {
  return <div className="zl-tess" style={{ ["--tess-l" as string]: TESS.lines, ["--tess-f" as string]: TESS.fill }} />;
}
