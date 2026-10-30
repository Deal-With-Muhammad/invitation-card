import { boarding } from "./boarding";
import { botanica } from "./botanica";
import { celestial } from "./celestial";
import { cloudnine } from "./cloudnine";
import { confetti } from "./confetti";
import { deco } from "./deco";
import { editorial } from "./editorial";
import { envelope } from "./envelope";
import { filigree } from "./filigree";
import { gilded } from "./gilded";
import { haveli } from "./haveli";
import { jharokha } from "./jharokha";
import { kashi } from "./kashi";
import { lace } from "./lace";
import { marigold } from "./marigold";
import { muguet } from "./muguet";
import { openhouse } from "./openhouse";
import { orchid } from "./orchid";
import { peony } from "./peony";
import { petals } from "./petals";
import { rosestudy } from "./rosestudy";
import { scrapbook } from "./scrapbook";
import { scroll } from "./scroll";
import { seaside } from "./seaside";
import { velvet } from "./velvet";
import { velvetrose } from "./velvetrose";
import { wildflower } from "./wildflower";
import { zardozi } from "./zardozi";
import { zellige } from "./zellige";
import { ghoonghat } from "./ghoonghat";
import { doli } from "./doli";
import { sheeshmahal } from "./sheeshmahal";
import { hilal } from "./hilal";
import { chandelier } from "./chandelier";
import { mangni } from "./mangni";
import { ringbox } from "./ringbox";
import { bagh } from "./bagh";
import { lanterns } from "./lanterns";
import { aatishbazi } from "./aatishbazi";
import { shamiana } from "./shamiana";
import { mor } from "./mor";
import { gulab } from "./gulab";
import { aarsi } from "./aarsi";
import { blushletter } from "./blushletter";
import type { Template } from "./types";
import { TEMPLATE_ORDER } from "@/lib/groups";

const ALL: Template[] = [
  boarding, botanica, celestial, cloudnine, confetti, deco, editorial, envelope, filigree, gilded, jharokha, kashi, lace, marigold,
  muguet, openhouse, orchid, peony, petals, rosestudy, scrapbook, scroll, seaside, velvet, velvetrose, wildflower, zellige, haveli, zardozi,
  ghoonghat, doli, sheeshmahal, hilal, chandelier, mangni, ringbox, bagh, lanterns, aatishbazi, shamiana, mor, gulab, aarsi, blushletter,
];

// Gallery order: see TEMPLATE_ORDER (the wedding functions first).
export const TEMPLATE_LIST: Template[] = TEMPLATE_ORDER.map((id) => ALL.find((t) => t.meta.id === id)).filter((t): t is Template => !!t);

export const TEMPLATES: Record<string, Template> = Object.fromEntries(TEMPLATE_LIST.map((t) => [t.meta.id, t]));

export const getTemplate = (id: string): Template => TEMPLATES[id] ?? TEMPLATE_LIST[0];
