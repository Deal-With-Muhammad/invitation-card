import { sparkles } from "../../runtime/effects";
import { metaFor } from "../catalog";
import type { Template } from "../types";
import { Backdrop, Divider, Hero, Ornament } from "./art";
import { Cover } from "./cover";

import "./celestial.css";

export const celestial: Template = {
  meta: metaFor("celestial"),
  Hero,
  Cover,
  Divider,
  Ornament,
  Backdrop,
  celebrate: (root) => sparkles(root, { count: 44 }),
};
