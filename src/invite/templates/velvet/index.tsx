import { sparkles } from "../../runtime/effects";
import { metaFor } from "../catalog";
import type { Template } from "../types";
import { Backdrop, Divider, Hero, Ornament } from "./art";
import { Cover } from "./cover";

import "./velvet.css";

export const velvet: Template = {
  meta: metaFor("velvet"),
  Hero,
  Cover,
  Divider,
  Ornament,
  Backdrop,
  celebrate: (root) => sparkles(root, { count: 34 }),
};
