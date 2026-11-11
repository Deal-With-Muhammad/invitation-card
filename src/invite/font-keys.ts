// Font names and CSS variables without the fonts themselves, for code that only needs to
// name a font (colours, previews, image routes). The fonts are declared in ./fonts.ts.

export const FONT_KEYS = [
  "great-vibes", "pinyon", "parisienne", "allura", "alex-brush", "italianno", "delafield", "doulaise", "petit-formal",
  "caveat", "homemade", "sacramento", "cormorant", "cormorant-infant", "playfair", "cinzel", "marcellus", "italiana",
  "bodoni", "fraunces", "yeseva", "rozha", "gloock", "prata", "dm-serif", "poiret", "limelight", "abril", "shrikhand",
  "josefin", "montserrat", "jost", "dm-sans", "outfit", "quicksand", "nunito", "space-mono", "bricolage",
] as const;
export type FontKey = (typeof FONT_KEYS)[number];

export const fontVar = (k: FontKey) => `var(--f-${k})`;

/** Fallback face for each script, appended to every font stack. */
export const SCRIPT_FONT: Record<string, string> = {
  ur: "var(--f-nastaliq)",
  ar: "var(--f-amiri)",
  fa: "var(--f-vazir)",
  bn: "var(--f-bangla)",
  hi: "var(--f-devanagari)",
};
