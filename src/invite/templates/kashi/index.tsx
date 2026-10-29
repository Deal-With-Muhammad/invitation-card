import { petals } from "../../runtime/effects";
import { metaFor } from "../catalog";
import type { Template } from "../types";
import { Backdrop, Divider, Hero, Ornament } from "./art";
import { Cover } from "./cover";

import "./kashi.css";

export const kashi: Template = {
  meta: metaFor("kashi"),
  Hero,
  Cover,
  Divider,
  Ornament,
  Backdrop,
  celebrate: (root) =>
    petals(root, { count: 30, colors: ["var(--ink)", "var(--accent)", "color-mix(in srgb, var(--accent) 55%, var(--bg))", "var(--soft)"] }),
};
