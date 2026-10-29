import { metaFor } from "../catalog";
import type { Template } from "../types";
import { Backdrop, Divider, Hero, Ornament } from "./art";
import { Cover } from "./cover";

import "./scrapbook.css";

export const scrapbook: Template = {
  meta: metaFor("scrapbook"),
  Hero,
  Cover,
  Divider,
  Ornament,
  Backdrop,
};
