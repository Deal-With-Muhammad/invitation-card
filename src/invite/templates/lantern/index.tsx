import { sparkles } from "../../runtime/effects";
import { metaFor } from "../catalog";
import type { Template } from "../types";
import { Backdrop, Divider, Hero, Ornament } from "./art";
import { Cover } from "./cover";

import "./lantern.css";

export const lantern: Template = {
  meta: metaFor("lantern"),
  Hero,
  Cover,
  Divider,
  Ornament,
  Backdrop,
  celebrate: (root) => sparkles(root, { count: 36 }),
};
