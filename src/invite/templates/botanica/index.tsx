import { petals } from "../../runtime/effects";
import { metaFor } from "../catalog";
import type { Template } from "../types";
import { Backdrop, Divider, Hero, Ornament } from "./art";
import { Cover } from "./cover";

import "./botanica.css";

// Falling leaves in the painted greens. The effect elements live inside the
// invitation root, so the palette variables resolve.
const LEAVES = [
  "color-mix(in srgb, var(--accent) 76%, var(--ink))",
  "var(--accent)",
  "color-mix(in srgb, var(--accent) 58%, var(--soft))",
  "color-mix(in srgb, var(--accent) 55%, var(--bg))",
];

export const botanica: Template = {
  meta: metaFor("botanica"),
  Hero,
  Cover,
  Divider,
  Ornament,
  Backdrop,
  celebrate: (root) => petals(root, { count: 24, colors: LEAVES }),
};
