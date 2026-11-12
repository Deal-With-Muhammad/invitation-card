import type { CSSProperties, FC, KeyboardEvent, ReactNode } from "react";

import type { Resolved } from "../../resolve";
import { Blessing, Names } from "../../runtime/sections";
import { metaFor } from "../catalog";
import type { SectionId } from "../../types";
import type { CoverProps, HeroProps, Template, TemplateParts } from "../types";

import "./painted.css";
import "../premium/body.css";

// The painted kit: designs built on painted or photographed art (public/art/<id>/)
// instead of drawn SVG. The art fills the phone; names, dates and venues are live
// text on top of it. Each design picks one opening from the list below and brings
// its own CSS (fonts, colours, small details) under .t-<id>.
//
// Cover and Hero follow the usual phases: the cover sits fixed over the hero while
// "closed", plays its exit during "opening" (the hero's text rises in underneath),
// and is removed when "open". Everything static is the final state, so gallery
// thumbnails (animations off) show the finished hero.

export type Opening =
  /** The closed art splits down the middle and both halves swing open in 3D. */
  | "doors"
  /** Halves slide apart sideways (lift doors). */
  | "slide"
  /** The closed art lifts straight up and away. */
  | "lift"
  /** The closed art grows toward you and fades (a plate, a rosette). */
  | "zoom"
  /** Hinged at the top edge, it swings up like a box lid. */
  | "hinge"
  /** Hinged at the left edge, it swings open like a book or passport cover. */
  | "swing"
  /** A see-through layer (the cover art) over the hero drifts up and away. */
  | "veil"
  /** Vertical strips that swing apart from the middle (garland strings). */
  | "strips"
  /** Top and bottom halves tear apart (a ticket). */
  | "tear"
  /** An envelope drops away while the card rises out of it. */
  | "envelope"
  /** Light grows from the centre and burns the cover away. */
  | "glow"
  /** A scroll unrolls from the top down. */
  | "unroll"
  /** A wave of foam washes up the screen and back. */
  | "wave"
  /** A filmed opening (public/art/<id>/<film>.webm|mp4) that starts on the closed art
   *  and ends on the hero art, so the card simply plays into itself. openMs = its length. */
  | "film";

export type Seal = {
  /** Centre of the seal in % of the screen. */
  x?: string;
  y?: string;
  /** Diameter in phone px. */
  size?: number;
  look: "foil" | "wax" | "emboss" | "thread" | "ink" | "plain";
};

/** The premium scroll body (templates/premium/body.css). Each premium design picks its own mix,
 *  so no two look alike below the hero. Art: public/art/<id>/trim.webp (a painted trim on a clear
 *  background, laid across band edges), motif.webp (a small emblem above headings), scene.webp (a
 *  second painting, shown in the window above the events and behind the closing) and frame.webp
 *  (a painted frame round the countdown, for `countdown: "frame"`). */
export type BodyOpts = {
  /** Sections set on a full-width band of the design's deep colour (--pb-band). */
  bands?: SectionId[];
  countdown?: "line" | "round" | "tiles" | "arch" | "frame";
  /** The shape of the window the scene painting (and the map) sits in. */
  window?: "arch" | "circle" | "oval" | "rect" | "gothic" | "deco" | "horseshoe" | "cusp";
  heading?: "script" | "serif" | "caps";
  date?: "stack" | "row" | "seal";
  buttons?: "pill" | "square" | "line";
  timeline?: "line" | "rows";
  /** Which pieces of art this design has (default: all four). */
  art?: { trim?: boolean; motif?: boolean; scene?: boolean; frame?: boolean };
  /** Without trim art, the trim is a band cut from the hero painting at this height (e.g. "97%"). */
  trimY?: string;
};

export type PaintedOpts = {
  /** Art name for the hero (public/art/<id>/<name>.webp). */
  hero?: string;
  /** object-position for the hero art. */
  heroPos?: string;
  cover: {
    kind: Opening;
    /** Art name for the closed state; defaults to the hero art. */
    art?: string;
    pos?: string;
    /** Number of strips for "strips". */
    strips?: number;
    /** Video name for "film" (default "open"). */
    film?: string;
    seal?: Seal;
    /** Colour of the "tap to open" line. */
    hint?: "light" | "dark";
    /** Words for the tap line; defaults to "Tap to open" in the guest's language. */
    hintText?: (r: Resolved) => string;
    /** Extra live text or pieces drawn on the cover (an address, a ticket line). */
    Extra?: FC<{ r: Resolved }>;
    /** Runs on the tap that opens it, with the invitation root (a petal burst). */
    onTap?: (root: HTMLElement) => void;
  };
  /** Palette id → different art for that colourway (each colourway is its own painting). */
  variants?: Record<string, { hero?: string; cover?: string; film?: string }>;
  /** Where the hero text sits, in % of the screen height, and how wide it is (phone px). */
  text?: { top?: string; width?: number; tone?: "dark" | "light"; glow?: boolean };
  /** Optional decoration drawn over the hero art (under the text). */
  HeroArt?: FC<{ r: Resolved }>;
  /** Hide pieces of the default hero text. */
  heroShow?: { title?: boolean; venue?: boolean; blessing?: boolean };
  /** Extra content after the date in the hero. */
  HeroAfter?: FC<{ r: Resolved }>;
  /** A painted strip cut from the hero art between sections: the art's vertical
   *  position (background-position-y, e.g. "94%"), or null for a plain ornament. */
  stripY?: string | null;
  /** Height of that strip in px. */
  stripH?: number;
  /** Look of the section panels. */
  panels?: "paper" | "dark" | "clear";
  /** The premium scroll body instead of panels and strips. */
  body?: BodyOpts;
  Divider?: FC<{ index: number }>;
  Ornament?: FC;
  sections?: TemplateParts["sections"];
  /** The design's own order for the sections after the hero. */
  order?: SectionId[];
  celebrate?: TemplateParts["celebrate"];
};

export const artUrl = (id: string, name: string, w?: 720) => `/art/${id}/${name}${w ? `-${w}` : ""}.webp`;

/** A full-bleed art image with a 720/1080 srcset. */
export function Art({ id, name, pos, className = "", priority = false }: { id: string; name: string; pos?: string; className?: string; priority?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`pt-img ${className}`}
      src={artUrl(id, name)}
      srcSet={`${artUrl(id, name, 720)} 720w, ${artUrl(id, name)} 1080w`}
      sizes="min(100vw, 480px)"
      alt=""
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      draggable={false}
      style={pos ? { objectPosition: pos } : undefined}
    />
  );
}

export const initials = (r: Resolved) =>
  r.people
    .map((p) => p.name.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .slice(0, 2);

/** Two initials joined by a small ampersand, for seals and monograms. */
export function Initials({ r, className = "" }: { r: Resolved; className?: string }) {
  const ini = initials(r);
  return (
    <span className={`pt-ini ${className}`} aria-hidden>
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

/** The standard hero copy. Designs restyle it through .pt-* classes. */
export function HeroText({ r, o, children }: { r: Resolved; o: PaintedOpts; children?: ReactNode }) {
  const show = { title: true, venue: true, blessing: true, ...o.heroShow };
  const After = o.HeroAfter;
  return (
    <>
      {show.blessing && r.data.bismillah !== "none" && <Blessing r={r} className="pt-bless" />}
      {show.title && r.title && <p className="pt-title">{r.title}</p>}
      <Names r={r} className="pt-names" />
      {r.milestone && <p className="pt-milestone">{r.milestone}</p>}
      {r.when.date && (
        <div className="pt-when">
          {r.when.weekday && <span className="pt-sc">{r.when.weekday}</span>}
          <strong className="pt-date">{r.when.date}</strong>
          {r.when.time && <span className="pt-sc">{r.when.time}</span>}
        </div>
      )}
      {show.venue && r.main?.venue && r.oneVenue && <p className="pt-venue">{r.main.venue}</p>}
      {After && <After r={r} />}
      {children}
    </>
  );
}

function onKey(e: KeyboardEvent, fn: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
}

const variant = (o: PaintedOpts, r: Resolved) => o.variants?.[r.data.look.palette];
const heroName = (o: PaintedOpts, r: Resolved) => variant(o, r)?.hero ?? o.hero ?? "hero";

function Layers({ id, o, r }: { id: string; o: PaintedOpts; r: Resolved }) {
  const c = o.cover;
  const name = variant(o, r)?.cover ?? c.art ?? heroName(o, r);
  const img = (cls = "") => <Art id={id} name={name} pos={c.pos} className={cls} priority />;
  switch (c.kind) {
    case "doors":
    case "slide":
      return (
        <>
          <span className="pt-half is-l">{img()}</span>
          <span className="pt-half is-r">{img()}</span>
          <span className="pt-bloom" />
        </>
      );
    case "tear":
      return (
        <>
          <span className="pt-tear is-t">{img()}</span>
          <span className="pt-tear is-b">{img()}</span>
        </>
      );
    case "strips": {
      const n = c.strips ?? 10;
      return (
        <>
          {Array.from({ length: n }, (_, i) => (
            <span
              key={i}
              className="pt-strip"
              style={{ "--i": i, "--n": n, "--side": i < n / 2 ? -1 : 1, "--far": Math.abs(i - (n - 1) / 2) } as CSSProperties}
            >
              {img()}
            </span>
          ))}
        </>
      );
    }
    case "veil":
      return <span className="pt-veil">{img()}</span>;
    case "film": {
      const f = variant(o, r)?.film ?? c.film ?? "open";
      return (
        <span className="pt-sheet">
          {img()}
          <video key={f} className="pt-img pt-film" muted playsInline preload="auto" poster={artUrl(id, name, 720)} aria-hidden>
            {/* MP4 first: some browsers claim VP9 WebM and then fail to decode it */}
            <source src={`/art/${id}/${f}.mp4`} type="video/mp4" />
            <source src={`/art/${id}/${f}.webm`} type="video/webm" />
          </video>
        </span>
      );
    }
    case "wave":
      return (
        <>
          <span className="pt-sheet">{img()}</span>
          <span className="pt-foam" />
        </>
      );
    default:
      return <span className="pt-sheet">{img()}</span>;
  }
}

export function makePainted(id: string, o: PaintedOpts): Template {
  const meta = metaFor(id);
  const hero = o.hero ?? "hero";
  const open = { "--open": `${meta.openMs}ms` } as CSSProperties;
  const text = { top: "30%", width: 300, tone: "dark" as const, glow: true, ...o.text };

  function Hero({ r }: HeroProps) {
    const HeroArt = o.HeroArt;
    return (
      <div className="pt-hero" style={open}>
        <Art id={id} name={heroName(o, r)} pos={o.heroPos} className="pt-hero-art" priority />
        {HeroArt && <HeroArt r={r} />}
        <div
          className={`pt-text is-${text.tone}${text.glow ? " has-glow" : ""}`}
          style={{ "--top": text.top, "--tw": text.width } as CSSProperties}
        >
          <HeroText r={r} o={o} />
        </div>
        <span className={`pt-scroll is-${text.tone}`} aria-hidden>
          {r.t.scroll}
        </span>
      </div>
    );
  }

  function Cover({ r, onOpen }: CoverProps) {
    const c = o.cover;
    const Extra = c.Extra;
    const seal = c.seal;
    const go = (el: HTMLElement) => {
      // A filmed opening starts inside the tap itself, so the browser lets it play.
      if (c.kind === "film" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) void el.querySelector("video")?.play().catch(() => {});
      const root = el.closest<HTMLElement>(".inv");
      if (root && c.onTap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) c.onTap(root);
      onOpen();
    };
    return (
      <div
        className={`pt-cover is-${c.kind}`}
        style={open}
        onClick={(e) => go(e.currentTarget)}
        onKeyDown={(e) => onKey(e, () => go(e.currentTarget))}
        role="button"
        tabIndex={0}
        aria-label={r.t.tapToOpen}
      >
        <Layers id={id} o={o} r={r} />
        {c.kind === "film" && (
          // The names rise in over the film's second half (see .pt-twin in painted.css).
          <div className="pt-twin" aria-hidden>
            <div className={`pt-text is-${text.tone}${text.glow ? " has-glow" : ""}`} style={{ "--top": text.top, "--tw": text.width } as CSSProperties}>
              <HeroText r={r} o={o} />
            </div>
          </div>
        )}
        {seal && (
          <span
            className={`pt-seal is-${seal.look}`}
            style={{ "--sx": seal.x ?? "50%", "--sy": seal.y ?? "50%", "--ss": seal.size ?? 70 } as CSSProperties}
          >
            <Initials r={r} />
          </span>
        )}
        {Extra && <Extra r={r} />}
        <span className={`pt-tap is-${c.hint ?? "light"}`}>{c.hintText ? c.hintText(r) : r.t.tapToOpen}</span>
      </div>
    );
  }

  function Backdrop({ r }: { r: Resolved }) {
    return (
      <div className="pt-backdrop">
        <Art id={id} name={heroName(o, r)} pos={o.heroPos} className="pt-backdrop-art" />
      </div>
    );
  }

  // The premium scroll body: its trim is the divider, its motif the heading ornament.
  const b = o.body;
  const art = { trim: true, motif: true, scene: true, frame: true, ...b?.art };
  const bodyClass = b
    ? [
        "pb",
        `pb-cd-${b.countdown ?? "line"}`,
        `pb-win-${b.window ?? "arch"}`,
        `pb-h-${b.heading ?? "serif"}`,
        `pb-date-${b.date ?? "stack"}`,
        `pb-btn-${b.buttons ?? "pill"}`,
        `pb-tl-${b.timeline ?? "line"}`,
        art.scene ? "pb-has-scene" : "",
        ...(b.bands ?? []).map((s) => `pbb-${s}`),
      ]
        .filter(Boolean)
        .join(" ")
    : "";
  const Trim = () =>
    art.trim ? (
      <span className="pb-trim">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artUrl(id, "trim")} alt="" loading="lazy" decoding="async" draggable={false} />
      </span>
    ) : (
      <span className="pb-trim is-strip" style={{ backgroundImage: `url(${artUrl(id, hero, 720)})`, backgroundPositionY: b?.trimY ?? "96%" }} />
    );
  const Motif = () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="pb-motif" src={artUrl(id, "motif")} alt="" loading="lazy" decoding="async" draggable={false} />
  );

  const stripY = o.stripY === undefined ? "96%" : o.stripY;
  const Divider =
    o.Divider ??
    (b
      ? Trim
      : stripY
      ? function Strip({ index }: { index: number }) {
          return (
            <span
              className="pt-strip-div"
              style={
                {
                  backgroundImage: `url(${artUrl(id, hero, 720)})`,
                  backgroundPositionY: stripY,
                  "--sh-h": `${o.stripH ?? 92}px`,
                  transform: index % 2 ? "scaleX(-1)" : undefined,
                } as CSSProperties
              }
            />
          );
        }
      : undefined);

  return {
    meta,
    Hero,
    Cover,
    Backdrop,
    Divider,
    Ornament: o.Ornament ?? (b && art.motif ? Motif : undefined),
    sections: o.sections,
    order: o.order,
    celebrate: o.celebrate,
    rootClass: `pk pk-${b ? "clear" : (o.panels ?? "paper")} pk-open-${o.cover.kind}${bodyClass ? ` ${bodyClass}` : ""}`,
  };
}
