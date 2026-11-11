// The four function themes of the Shagun design. Each event on the invitation gets one,
// by its title ("Mehndi", "Baraat"…) or, failing that, by its place in the list.

export type ThemeId = "mayoun" | "mehndi" | "baraat" | "walima";

export type Theme = {
  id: ThemeId;
  /** The function's name in Urdu, set in Nastaliq above the English title. */
  urdu: string;
  /** Painted background in public/art/shagun/. */
  art: string;
  /** Colours for the live text and buttons on that art (also used by the video). */
  ink: string;
  accent: string;
  /** Text on the accent colour. */
  onAccent: string;
  /** Font keys (see src/invite/fonts.ts) for the title and the details. */
  title: string;
  body: string;
  /** Where the text block sits on the art, in % of the screen height. */
  top: number;
};

export const THEMES: Record<ThemeId, Theme> = {
  mayoun: { id: "mayoun", urdu: "مایوں", art: "mayoun", ink: "#5a3206", accent: "#b8650a", onAccent: "#fff7e8", title: "yeseva", body: "cormorant", top: 24 },
  mehndi: { id: "mehndi", urdu: "مہندی", art: "mehndi", ink: "#3d2457", accent: "#b0216e", onAccent: "#fff4fa", title: "shrikhand", body: "cormorant", top: 24 },
  baraat: { id: "baraat", urdu: "بارات", art: "baraat", ink: "#f6dfa6", accent: "#d9ae58", onAccent: "#4a0b0b", title: "cinzel", body: "cormorant", top: 27 },
  walima: { id: "walima", urdu: "ولیمہ", art: "walima", ink: "#1f4a37", accent: "#2f6b4f", onAccent: "#f4f7f1", title: "italiana", body: "cormorant", top: 24 },
};

const ORDER: ThemeId[] = ["mayoun", "mehndi", "baraat", "walima"];

const MATCH: [RegExp, ThemeId][] = [
  [/may[o]?u?n|maiyun|mayun|haldi|ubtan|tel\b/i, "mayoun"],
  [/meh[e]?n?di|mendhi|henna|sangeet|dholki/i, "mehndi"],
  [/bar[a]+t|shaadi|shadi|rukhsati|nikah|wedding/i, "baraat"],
  [/walima|valima|reception|dawat/i, "walima"],
];

/** Picks each event's theme: by name where it's clear, otherwise the next unused one in order. */
export function themesFor(titles: string[]): Theme[] {
  const used = new Set<ThemeId>();
  const picked: (ThemeId | null)[] = titles.map((t) => {
    const hit = MATCH.find(([re]) => re.test(t))?.[1] ?? null;
    if (hit) used.add(hit);
    return hit;
  });
  return picked.map((id, i) => {
    if (id) return THEMES[id];
    const next = ORDER.find((o) => !used.has(o)) ?? ORDER[i % ORDER.length];
    used.add(next);
    return THEMES[next];
  });
}
