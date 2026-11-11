import {
  Abril_Fatface,
  Alex_Brush,
  Allura,
  Amiri,
  Aref_Ruqaa,
  Bodoni_Moda,
  Bricolage_Grotesque,
  Caveat,
  Cinzel,
  Cormorant_Garamond,
  Cormorant_Infant,
  DM_Sans,
  DM_Serif_Display,
  Fraunces,
  Gloock,
  Great_Vibes,
  Hind_Siliguri,
  Homemade_Apple,
  Italiana,
  Italianno,
  Josefin_Sans,
  Jost,
  Limelight,
  Marcellus,
  Monsieur_La_Doulaise,
  Montserrat,
  Mrs_Saint_Delafield,
  Noto_Nastaliq_Urdu,
  Nunito,
  Outfit,
  Parisienne,
  Petit_Formal_Script,
  Pinyon_Script,
  Playfair_Display,
  Poiret_One,
  Prata,
  Quicksand,
  Reem_Kufi,
  Rozha_One,
  Sacramento,
  Shrikhand,
  Space_Mono,
  Tiro_Devanagari_Hindi,
  Vazirmatn,
  Yeseva_One,
} from "next/font/google";

// Every face a template can use. None are preloaded: a browser only downloads the
// files for text that is actually on screen, so an invitation pulls in its own
// two or three fonts and nothing else. Each one is exposed as --f-<key>.

const greatVibes = Great_Vibes({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-great-vibes" });
const pinyon = Pinyon_Script({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-pinyon" });
const parisienne = Parisienne({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-parisienne" });
const allura = Allura({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-allura" });
const alexBrush = Alex_Brush({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-alex-brush" });
const italianno = Italianno({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-italianno" });
const delafield = Mrs_Saint_Delafield({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-delafield" });
const doulaise = Monsieur_La_Doulaise({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-doulaise" });
const petitFormal = Petit_Formal_Script({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-petit-formal" });
const caveat = Caveat({ display: "swap", preload: false, subsets: ["latin"], variable: "--f-caveat" });
const homemade = Homemade_Apple({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-homemade" });
const sacramento = Sacramento({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-sacramento" });

const cormorant = Cormorant_Garamond({
  display: "swap", preload: false,
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--f-cormorant",
});
const cormorantInfant = Cormorant_Infant({
  display: "swap", preload: false,
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--f-cormorant-infant",
});
const playfair = Playfair_Display({ display: "swap", preload: false, style: ["normal", "italic"], subsets: ["latin"], variable: "--f-playfair" });
const cinzel = Cinzel({ display: "swap", preload: false, subsets: ["latin"], variable: "--f-cinzel" });
const marcellus = Marcellus({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-marcellus" });
const italiana = Italiana({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-italiana" });
const bodoni = Bodoni_Moda({ display: "swap", preload: false, style: ["normal", "italic"], subsets: ["latin"], variable: "--f-bodoni" });
const fraunces = Fraunces({ display: "swap", preload: false, style: ["normal", "italic"], subsets: ["latin"], variable: "--f-fraunces" });
const yeseva = Yeseva_One({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-yeseva" });
const rozha = Rozha_One({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-rozha" });
const gloock = Gloock({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-gloock" });
const prata = Prata({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-prata" });
const dmSerif = DM_Serif_Display({ display: "swap", preload: false, weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--f-dm-serif" });
const poiret = Poiret_One({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-poiret" });
const limelight = Limelight({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-limelight" });
const abril = Abril_Fatface({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-abril" });
const shrikhand = Shrikhand({ display: "swap", preload: false, weight: "400", subsets: ["latin"], variable: "--f-shrikhand" });

const josefin = Josefin_Sans({ display: "swap", preload: false, subsets: ["latin"], variable: "--f-josefin" });
const montserrat = Montserrat({ display: "swap", preload: false, subsets: ["latin"], variable: "--f-montserrat" });
const jost = Jost({ display: "swap", preload: false, subsets: ["latin"], variable: "--f-jost" });
const dmSans = DM_Sans({ display: "swap", preload: false, subsets: ["latin"], variable: "--f-dm-sans" });
const outfit = Outfit({ display: "swap", preload: false, subsets: ["latin"], variable: "--f-outfit" });
const quicksand = Quicksand({ display: "swap", preload: false, subsets: ["latin"], variable: "--f-quicksand" });
const nunito = Nunito({ display: "swap", preload: false, subsets: ["latin"], variable: "--f-nunito" });
const spaceMono = Space_Mono({ display: "swap", preload: false, weight: ["400", "700"], subsets: ["latin"], variable: "--f-space-mono" });
const bricolage = Bricolage_Grotesque({ display: "swap", preload: false, subsets: ["latin"], variable: "--f-bricolage" });

const amiri = Amiri({ display: "swap", preload: false, weight: ["400", "700"], subsets: ["arabic", "latin"], variable: "--f-amiri" });
const arefRuqaa = Aref_Ruqaa({ display: "swap", preload: false, weight: ["400", "700"], subsets: ["arabic"], variable: "--f-ruqaa" });
const reemKufi = Reem_Kufi({ display: "swap", preload: false, subsets: ["arabic"], variable: "--f-kufi" });
const nastaliq = Noto_Nastaliq_Urdu({ display: "swap", preload: false, weight: ["400", "700"], subsets: ["arabic"], variable: "--f-nastaliq" });
const vazir = Vazirmatn({ display: "swap", preload: false, subsets: ["arabic", "latin"], variable: "--f-vazir" });
const bangla = Hind_Siliguri({ display: "swap", preload: false, weight: ["400", "500", "600"], subsets: ["bengali", "latin"], variable: "--f-bangla" });
const devanagari = Tiro_Devanagari_Hindi({ display: "swap", preload: false, weight: "400", style: ["normal", "italic"], subsets: ["devanagari", "latin"], variable: "--f-devanagari" });

/** Put on the invitation root so every --f-* variable resolves. */
export const FONT_VARS = [
  greatVibes, pinyon, parisienne, allura, alexBrush, italianno, delafield, doulaise, petitFormal, caveat, homemade, sacramento,
  cormorant, cormorantInfant, playfair, cinzel, marcellus, italiana, bodoni, fraunces, yeseva, rozha, gloock, prata, dmSerif,
  poiret, limelight, abril, shrikhand, josefin, montserrat, jost, dmSans, outfit, quicksand, nunito, spaceMono, bricolage,
  amiri, arefRuqaa, reemKufi, nastaliq, vazir, bangla, devanagari,
]
  .map((f) => f.variable)
  .join(" ");

export { FONT_KEYS, fontVar, SCRIPT_FONT, type FontKey } from "./font-keys";
import type { FontKey } from "./font-keys";

/** The choices offered for the names in the editor. */
export const NAME_FONTS: { key: FontKey; label: string }[] = [
  { key: "great-vibes", label: "Flowing script" },
  { key: "pinyon", label: "Copperplate" },
  { key: "parisienne", label: "Parisian" },
  { key: "italianno", label: "Slim italic" },
  { key: "petit-formal", label: "Formal script" },
  { key: "cormorant", label: "Classic serif" },
  { key: "cinzel", label: "Roman capitals" },
  { key: "playfair", label: "High contrast" },
  { key: "gloock", label: "Bold editorial" },
  { key: "caveat", label: "Handwritten" },
  { key: "shrikhand", label: "Chunky fun" },
  { key: "josefin", label: "Modern sans" },
];


