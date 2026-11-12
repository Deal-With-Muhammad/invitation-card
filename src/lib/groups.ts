import type { Occasion } from "@/invite/types";

/** Premium designs: the most detailed ones, each opening on its own film, with RSVP and wishes.
 *  Their own section, first, in this order. */
export const PREMIUM_DESIGNS = [
  "nacre",
  "heirloom",
  "cypress",
  "arbour",
  "aisle",
  "atelier",
  "porcelain",
  "amalfi",
  "majlis",
  "glasshouse",
  "sakura",
  "hacienda",
  "lacquer",
  "emerald",
  "mandap",
  "songket",
  "savanna",
  "yaadein",
  "shagun",
];

/** Premium designs can take RSVPs and wishes, and include fewer free visits (PREMIUM_VISIT_LIMIT). */
export const isPremium = (template: string) => PREMIUM_DESIGNS.includes(template);

/** The newest designs: light, modern and filmed. They get their own row first. */
export const NEW_DESIGNS = ["noor", "riad", "silkribbon", "blossom", "goldink"];

/** The order designs appear in everywhere: the wedding functions first, then the rest. */
export const TEMPLATE_ORDER = [
  ...PREMIUM_DESIGNS,
  "noor",
  "riad",
  "silkribbon",
  "blossom",
  "goldink",
  "ghoonghat",
  "doli",
  "sheeshmahal",
  "hilal",
  "chandelier",
  "mangni",
  "ringbox",
  "bagh",
  "lanterns",
  "aatishbazi",
  "shamiana",
  "mor",
  "gulab",
  "aarsi",
  "blushletter",
  "haveli",
  "zardozi",
  "peony",
  "petals",
  "velvetrose",
  "jharokha",
  "marigold",
  "lace",
  "gilded",
  "envelope",
  "orchid",
  "filigree",
  "kashi",
  "velvet",
  "rosestudy",
  "muguet",
  "wildflower",
  "botanica",
  "zellige",
  "deco",
  "celestial",
  "editorial",
  "seaside",
  "boarding",
  "confetti",
  "cloudnine",
  "scrapbook",
  "scroll",
  "openhouse",
];

/** Rows by function; a design lands in the first group that lists its main occasion, the rest in the last. */
export const GROUPS: { id: string; title: string; blurb: string; occasions: Occasion[] }[] = [
  { id: "nikah", title: "Nikah, walima & engagement", blurb: "Quiet, warm and made for family.", occasions: ["nikah", "walima", "engagement"] },
  { id: "weddings", title: "Baraat, weddings & receptions", blurb: "For the big day and the dinner after it.", occasions: ["wedding", "reception"] },
  { id: "mehndi", title: "Mehndi & dholki", blurb: "Colour, music and a little noise.", occasions: ["mehndi"] },
  { id: "celebrate", title: "Birthdays, aqiqah & every other reason", blurb: "Baby showers, graduations, housewarmings and parties.", occasions: [] },
];

/** Which group a design with this main occasion belongs to. */
export const groupOf = (occasion: Occasion) => {
  const i = GROUPS.findIndex((g) => g.occasions.includes(occasion));
  return GROUPS[i === -1 ? GROUPS.length - 1 : i].id;
};
