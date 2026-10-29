import type { Lang } from "../types";
import { ar } from "./ar";
import { bn } from "./bn";
import { en, type Copy } from "./en";
import { es } from "./es";
import { fa } from "./fa";
import { fr } from "./fr";
import { hi } from "./hi";
import { id } from "./id";
import { ms } from "./ms";
import { pt } from "./pt";
import { tr } from "./tr";
import { ur } from "./ur";

export type { Copy, UiKey } from "./en";

export const COPY: Record<Lang, Copy> = { en, ms, id, ur, ar, hi, bn, fa, tr, es, fr, pt };

export const copyFor = (lang: Lang): Copy => COPY[lang] ?? en;

export const isRtl = (lang: Lang) => copyFor(lang).meta.dir === "rtl";
