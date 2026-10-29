import { petals } from "../../runtime/effects";
import { metaFor } from "../catalog";
import type { Template } from "../types";
import { Backdrop, Divider, Hero, Ornament } from "./art";
import { Cover } from "./cover";

import "./marigold.css";

export const marigold: Template = {
  meta: metaFor("marigold"),
  Hero,
  Cover,
  Divider,
  Ornament,
  Backdrop,
  celebrate: (root) => petals(root, { count: 34, colors: ["var(--mg-o)", "var(--mg-y)", "var(--mg-ol)", "var(--mg-yl)", "var(--leaf)"] }),
};
