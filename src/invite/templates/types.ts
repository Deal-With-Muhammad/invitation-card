import type { FC, ReactNode } from "react";

import type { FontKey } from "../fonts";
import type { Resolved } from "../resolve";
import type { Occasion, SectionId } from "../types";

/**
 * How a template plugs into the invitation.
 *
 * Phases: "closed" (the cover is up, waiting for a tap), "opening" (the cover is
 * playing its exit for `meta.openMs`; the hero animates in underneath), "open".
 *
 * Rules every template follows:
 * - Hero, Divider, Backdrop and section overrides are plain components (no hooks),
 *   because the gallery renders them on the server as static thumbnails.
 * - Base styles are the final, visible state. Animations start *from* hidden with
 *   `animation-fill-mode: both`, so a thumbnail (animations off) still shows everything.
 * - Hero and Cover are sized in phone units: `calc(N * var(--u))` is N px on a 390px
 *   wide phone and scales with the card. `var(--sh)` is the screen height.
 * - Colours come from --bg, --ink, --accent, --soft (the palette the host picked),
 *   so every palette and custom colour works. Never hard-code black.
 */

export type Phase = "closed" | "opening" | "open";

export type Palette = {
  id: string;
  name: string;
  bg: string;
  ink: string;
  accent: string;
  /** A soft secondary tone. Derived from bg/accent when the host picks custom colours. */
  soft: string;
};

export type TemplateMeta = {
  id: string;
  name: string;
  /** Five to eight words for the gallery card. */
  tagline: string;
  /** Two sentences for the template's own page (SEO). */
  description: string;
  occasions: Occasion[];
  defaultOccasion: Occasion;
  palettes: Palette[];
  fonts: { display: FontKey; names: FontKey; body: FontKey };
  /** What the opening animation does, for the gallery ("Carved doors swing open"). */
  opening: string;
  openMs: number;
  /** Search phrases this design suits, e.g. "mughal wedding card". */
  keywords: string[];
};

export type HeroProps = { r: Resolved; phase: Phase; thumb?: boolean };
export type CoverProps = { r: Resolved; phase: Phase; onOpen: () => void };
export type SectionProps = { r: Resolved };

export type TemplateParts = {
  /** The first screen after opening: title, names, date. Also the gallery thumbnail. */
  Hero: FC<HeroProps>;
  /** The tap-to-open screen. Optional; a simple one is used when missing. */
  Cover?: FC<CoverProps>;
  /** Ornament between sections. `index` lets it vary. */
  Divider?: FC<{ index: number }>;
  /** Decoration fixed behind the whole invitation (patterns, frames, texture). */
  Backdrop?: FC<{ r: Resolved }>;
  /** Small ornament under every section heading. */
  Ornament?: FC;
  /** Replace a whole section with the template's own layout. */
  sections?: Partial<Record<SectionId, FC<SectionProps>>>;
  /** Runs once when the invitation opens (confetti, petals…). */
  celebrate?: (root: HTMLElement) => void;
};

export type Template = { meta: TemplateMeta } & TemplateParts;

export type Children = { children?: ReactNode };
