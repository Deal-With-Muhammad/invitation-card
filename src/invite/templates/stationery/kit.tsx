import type { CSSProperties, FC, ReactNode } from "react";

import type { Resolved } from "../../resolve";
import { Blessing, Names } from "../../runtime/sections";
import { metaFor } from "../catalog";
import type { CoverProps, HeroProps, Template, TemplateParts } from "../types";
import { blossom, leaf, type Layer } from "./flora";

import "./stationery.css";

// The shared stationery suite: a 5 × 7 card resting on its open envelope, on a
// marble, linen or velvet surface. Each design brings its own card face and liner;
// the kit owns the envelope, the opening and the enclosure cards below.
//
// Hero and Cover draw the same scene from the same DOM. The cover starts with the
// envelope closed in the middle of the screen; the flap lifts, the card rises out,
// and both settle exactly where the hero has them, so the cover can simply go.

export type Surface = "marble" | "linen" | "velvet";
export type Seal = "foil" | "wax" | "none";

export type StationeryOpts = {
  /** The card face. It fills a 5 × 7 box; size everything in calc(N * var(--k)) (280 wide). */
  Card: FC<{ r: Resolved }>;
  /** Fills the envelope liner (drawn on the flap and inside the back). */
  Liner: FC;
  surface?: Surface;
  seal?: Seal;
  Divider?: FC<{ index: number }>;
  Ornament?: FC;
  sections?: TemplateParts["sections"];
  celebrate?: TemplateParts["celebrate"];
};

const initials = (r: Resolved) =>
  r.people
    .map((p) => p.name.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .slice(0, 2);

/** The two initials, for monograms and seals. */
export function Monogram({ r, className = "" }: { r: Resolved; className?: string }) {
  const ini = initials(r);
  return (
    <span className={`st-mono ${className}`} aria-hidden>
      {ini[0]}
      {ini[1] && (
        <>
          <i>&amp;</i>
          {ini[1]}
        </>
      )}
    </span>
  );
}

// Script faces that look wrong set in capitals, so designs that capitalise the
// names can step back when the host picks one.
const SCRIPTS = new Set(["great-vibes", "pinyon", "parisienne", "italianno", "petit-formal", "caveat", "shrikhand", "allura", "alex-brush", "delafield", "doulaise", "sacramento"]);
export const scriptNames = (r: Resolved) => SCRIPTS.has(r.data.look.namesFont ?? "");

/**
 * The usual card copy: blessing, the title line, names, date and venue. Designs
 * pick the pieces they want and style them through their own classes.
 */
export function CardText({
  r,
  className = "",
  rule,
  showVenue = true,
  showTitle = true,
}: {
  r: Resolved;
  className?: string;
  rule?: ReactNode;
  showVenue?: boolean;
  showTitle?: boolean;
}) {
  return (
    <div className={`st-text ${className}${scriptNames(r) ? " is-script" : ""}`}>
      {r.data.bismillah !== "none" && <Blessing r={r} className="st-bless" />}
      {showTitle && r.title && <p className="st-title">{r.title}</p>}
      <Names r={r} className="st-names" />
      {r.milestone && <p className="st-milestone">{r.milestone}</p>}
      {rule}
      {r.when.date && (
        <div className="st-when">
          {r.when.weekday && <span className="st-sc">{r.when.weekday}</span>}
          <strong>{r.when.date}</strong>
          {r.when.time && <span className="st-sc">{r.when.time}</span>}
        </div>
      )}
      {showVenue && r.main?.venue && r.oneVenue && <p className="st-venue">{r.main.venue}</p>}
    </div>
  );
}

/** Painted (inline SVG) art: layers of tone classes (fa…fd petals, la/lb leaves, lv veins, sm stems). */
export function Paint({ vb, layers, className = "", style }: { vb: string; layers: Layer[]; className?: string; style?: CSSProperties }) {
  return (
    <svg className={`st-paint ${className}`} viewBox={vb} style={style} aria-hidden>
      {layers.map((l, i) => (l.d ? <path key={i} d={l.d} className={l.c} /> : null))}
    </svg>
  );
}

/** A mask-painted layer: the art is the mask, the CSS background is the ink or foil. */
export function Masked({ url, className = "", style }: { url: string; className?: string; style?: CSSProperties }) {
  return <span className={`st-masked ${className}`} style={{ WebkitMaskImage: url, maskImage: url, ...style }} />;
}

function SurfaceLayer({ kind }: { kind: Surface }) {
  return (
    <div className={`st-surface is-${kind}`}>
      <i />
      <i />
    </div>
  );
}

function SealArt({ r, kind }: { r: Resolved; kind: Seal }) {
  if (kind === "none") return null;
  return (
    <span className={`st-seal is-${kind}`} aria-hidden>
      <Monogram r={r} />
    </span>
  );
}

function Scene({ r, o }: { r: Resolved; o: StationeryOpts }) {
  const { Card, Liner } = o;
  return (
    <div className="st-scene">
      <div className="st-env st-env-back">
        <span className="st-inside" />
        <div className="st-liner st-liner-back">
          <Liner />
        </div>
        <span className="st-inside-shade" />
      </div>

      <div className="st-env st-env-flap">
        <div className="st-flap">
          <div className="st-face st-face-out">
            <svg viewBox="0 0 100 138" preserveAspectRatio="none" aria-hidden>
              <path d="M0 0H100L55 74Q50 80 45 74Z" className="st-paper" />
              <path d="M0 0H100L55 74Q50 80 45 74Z" className="st-flap-shade" />
              <path d="M0.6 0.4H99.4" className="st-fold" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className="st-tex st-tex-flap" />
          </div>
          <div className="st-face st-face-in">
            <span className="st-flap-inside" />
            <div className="st-liner st-liner-flap">
              <Liner />
            </div>
          </div>
          <SealArt r={r} kind={o.seal ?? "foil"} />
        </div>
      </div>

      <div className="st-card-move">
        <div className="st-card">
          <Card r={r} />
        </div>
      </div>

      <div className="st-env st-env-pocket">
        <svg viewBox="0 0 100 138" preserveAspectRatio="none" aria-hidden>
          <path d="M0 0L46.5 66Q50 70.5 53.5 66L100 0V138H0Z" className="st-paper" />
          <path d="M0 0L46.5 66Q50 70.5 50 76L0 138Z" className="st-pk-l" />
          <path d="M100 0L53.5 66Q50 70.5 50 76L100 138Z" className="st-pk-r" />
          <path d="M0 138L45 82Q50 76 55 82L100 138Z" className="st-pk-b" />
          <path d="M0 138L45 82Q50 76 55 82L100 138" className="st-crease" vectorEffect="non-scaling-stroke" />
          <path d="M0 0L46.5 66Q50 70.5 53.5 66L100 0" className="st-lip" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="st-tex st-tex-pocket" />
      </div>
    </div>
  );
}

function makeHero(o: StationeryOpts) {
  return function Hero({ r }: HeroProps) {
    return (
      <div className="st-hero">
        <Scene r={r} o={o} />
        <span className="st-cue" aria-hidden>
          {r.t.scroll}
          <i />
        </span>
      </div>
    );
  };
}

function makeCover(o: StationeryOpts) {
  return function Cover({ r, onOpen }: CoverProps) {
    return (
      <div
        className="st-cover"
        role="button"
        tabIndex={0}
        aria-label={r.t.tapToOpen}
        onClick={onOpen}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      >
        <SurfaceLayer kind={o.surface ?? "marble"} />
        <div className="st-stage">
          <Scene r={r} o={o} />
        </div>
        <span className="st-tap">
          <i />
          {r.t.tapToOpen}
          <i />
        </span>
      </div>
    );
  };
}

// ── default ornaments: a small blossom between two lines ──

const ORN = blossom([30, 7], 5.6, -Math.PI / 2, 4);
const ORN_LEAVES = leaf([22.5, 7.5], Math.PI * 1.04, 7, 1.9, 0.2) + leaf([37.5, 7.5], -Math.PI * 0.04, 7, 1.9, -0.2);

export function DefaultOrnament() {
  return (
    <svg className="st-orn" viewBox="0 0 60 14" aria-hidden>
      <path d="M2 7.5H17M43 7.5H58" className="st-orn-line" />
      <path d={ORN_LEAVES} className="st-orn-fill" />
      <path d={ORN.petals} className="st-orn-fill" />
      <path d={ORN.center} className="st-orn-mid" />
    </svg>
  );
}

export function DefaultDivider() {
  return (
    <svg className="st-divider" viewBox="0 0 60 14" aria-hidden>
      <path d={ORN.petals} className="st-orn-fill" />
      <path d={ORN.center} className="st-orn-mid" />
    </svg>
  );
}

/** Builds a complete template from a card face and a liner. */
export function makeStationery(id: string, o: StationeryOpts): Template {
  const surface = o.surface ?? "marble";
  return {
    meta: metaFor(id),
    Hero: makeHero(o),
    Cover: makeCover(o),
    Backdrop: () => <SurfaceLayer kind={surface} />,
    Divider: o.Divider ?? DefaultDivider,
    Ornament: o.Ornament ?? DefaultOrnament,
    sections: o.sections,
    celebrate: o.celebrate,
  };
}
