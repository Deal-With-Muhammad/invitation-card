import type { CSSProperties } from "react";

import { fontVar, SCRIPT_FONT, type FontKey, FONT_KEYS } from "./fonts";
import type { Palette, TemplateMeta } from "./templates/types";
import type { InviteData, Lang } from "./types";

// Palette + fonts → the CSS variables on the invitation root.

const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (rgb: number[]) => `#${rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")}`;
const mix = (a: string, b: string, t: number) => {
  const x = hex(a);
  const y = hex(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};

/** Relative luminance, 0 (dark) to 1 (light). */
export function luminance(h: string) {
  const [r, g, b] = hex(h).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function paletteFor(meta: TemplateMeta, look: InviteData["look"]): Palette {
  if (look.palette === "custom" && look.colors) {
    const { bg, ink, accent } = look.colors;
    return { id: "custom", name: "Custom", bg, ink, accent, soft: mix(bg, accent, 0.18) };
  }
  return meta.palettes.find((p) => p.id === look.palette) ?? meta.palettes[0];
}

const isFont = (k: string): k is FontKey => (FONT_KEYS as readonly string[]).includes(k);

export function rootStyle(meta: TemplateMeta, look: InviteData["look"], lang: Lang): CSSProperties {
  const p = paletteFor(meta, look);
  const script = SCRIPT_FONT[lang];
  const stack = (k: FontKey, generic: string) => [fontVar(k), script, generic].filter(Boolean).join(", ");
  const names = look.namesFont && isFont(look.namesFont) ? look.namesFont : meta.fonts.names;
  return {
    "--bg": p.bg,
    "--ink": p.ink,
    "--accent": p.accent,
    "--soft": p.soft,
    "--on-accent": luminance(p.accent) > 0.36 ? mix(p.accent, "#1a1410", 0.82) : "#fffdf8",
    "--on-ink": luminance(p.ink) > 0.36 ? mix(p.ink, "#1a1410", 0.85) : "#fffdf8",
    "--f-display": stack(meta.fonts.display, "serif"),
    "--f-names": stack(names, "cursive"),
    "--f-body": stack(meta.fonts.body, "sans-serif"),
  } as CSSProperties;
}

export const isDarkPalette = (p: Palette) => luminance(p.bg) < 0.2;
