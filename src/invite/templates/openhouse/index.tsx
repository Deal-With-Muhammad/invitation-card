import { confetti } from "../../runtime/effects";
import { metaFor } from "../catalog";
import type { Template } from "../types";
import { Backdrop, Divider, Hero, Ornament } from "./art";
import { Cover } from "./cover";

import "./openhouse.css";

export const openhouse: Template = {
  meta: metaFor("openhouse"),
  Hero,
  Cover,
  Divider,
  Ornament,
  Backdrop,
  celebrate: (root) => confetti(root, { count: 44 }),
};
