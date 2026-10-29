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
import { zellige } from "./zellige";
import type { Template } from "./types";

// Gallery order: the stationery wedding cards first, then the rest grouped loosely
// by occasion.
export const TEMPLATE_LIST: Template[] = [
  gilded,
  rosestudy,
  orchid,
  wildflower,
  lace,
  filigree,
  muguet,
  peony,
  petals,
  velvetrose,
  jharokha,
  envelope,
  marigold,
  confetti,
  celestial,
  botanica,
  editorial,
  zellige,
  cloudnine,
  deco,
  kashi,
  velvet,
  boarding,
  seaside,
  scrapbook,
  scroll,
  openhouse,
];

export const TEMPLATES: Record<string, Template> = Object.fromEntries(TEMPLATE_LIST.map((t) => [t.meta.id, t]));

export const getTemplate = (id: string): Template => TEMPLATES[id] ?? TEMPLATE_LIST[0];
