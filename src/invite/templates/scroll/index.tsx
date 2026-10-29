import { confetti } from "../../runtime/effects";
import { metaFor } from "../catalog";
import type { Template } from "../types";
import { Backdrop, Divider, Hero, Ornament } from "./art";
import { Cover } from "./cover";

import "./scroll.css";

export const scroll: Template = {
  meta: metaFor("scroll"),
  Hero,
  Cover,
  Divider,
  Ornament,
  Backdrop,
  celebrate: (root) => {
    const s = getComputedStyle(root);
    const v = (n: string) => s.getPropertyValue(n).trim();
    confetti(root, { count: 80, colors: [v("--accent"), v("--bg"), v("--soft"), v("--accent")].filter(Boolean) });
  },
};
