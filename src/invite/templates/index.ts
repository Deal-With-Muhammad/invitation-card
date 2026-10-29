import { botanica } from "./botanica";
import { boarding } from "./boarding";
import { celestial } from "./celestial";
import { cloudnine } from "./cloudnine";
import { confetti } from "./confetti";
import { deco } from "./deco";
import { editorial } from "./editorial";
import { envelope } from "./envelope";
import { jharokha } from "./jharokha";
import { kashi } from "./kashi";
import { lantern } from "./lantern";
import { marigold } from "./marigold";
import { openhouse } from "./openhouse";
import { scrapbook } from "./scrapbook";
import { scroll } from "./scroll";
import { seaside } from "./seaside";
import { sehra } from "./sehra";
import { songket } from "./songket";
import { velvet } from "./velvet";
import { zellige } from "./zellige";
import type { Template } from "./types";

// Gallery order: a strong mix up front, then the rest grouped loosely by occasion.
export const TEMPLATE_LIST: Template[] = [
  jharokha,
  envelope,
  marigold,
  confetti,
  songket,
  celestial,
  sehra,
  botanica,
  editorial,
  zellige,
  cloudnine,
  deco,
  kashi,
  lantern,
  velvet,
  boarding,
  seaside,
  scrapbook,
  scroll,
  openhouse,
];

export const TEMPLATES: Record<string, Template> = Object.fromEntries(TEMPLATE_LIST.map((t) => [t.meta.id, t]));

export const getTemplate = (id: string): Template => TEMPLATES[id] ?? TEMPLATE_LIST[0];
