import { confetti as burst } from "../../runtime/effects";
import { metaFor } from "../catalog";
import type { Template } from "../types";
import { Backdrop, Divider, Hero, Ornament } from "./art";
import { Cover } from "./cover";

import "./confetti.css";

export const confetti: Template = {
  meta: metaFor("confetti"),
  Hero,
  Cover,
  Divider,
  Ornament,
  Backdrop,
  celebrate: (root) => {
    const s = getComputedStyle(root);
    const tone = (v: string) => s.getPropertyValue(v).trim();
    burst(root, { count: 110, colors: [tone("--accent"), tone("--soft"), tone("--ink"), tone("--accent")].filter(Boolean) });
  },
};
