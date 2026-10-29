import { petals } from "../../runtime/effects";
import { metaFor } from "../catalog";
import type { Template } from "../types";
import { Backdrop, Divider, Hero, Ornament } from "./art";
import { Cover } from "./cover";

import "./sehra.css";

export const sehra: Template = {
  meta: metaFor("sehra"),
  Hero,
  Cover,
  Divider,
  Ornament,
  Backdrop,
  celebrate: (root) =>
    petals(root, {
      count: 30,
      colors: [
        "var(--accent)",
        "color-mix(in srgb, var(--accent) 55%, var(--bg))",
        "var(--jas)",
        "color-mix(in srgb, var(--soft) 50%, var(--accent))",
      ],
    }),
};
