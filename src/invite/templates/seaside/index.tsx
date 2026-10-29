import { petals } from "../../runtime/effects";
import { metaFor } from "../catalog";
import type { Template } from "../types";
import { Backdrop, Divider, Hero, Ornament } from "./art";
import { Cover } from "./cover";

import "./seaside.css";

// Little bubbles in sea-glass tones. The effect elements live inside the
// invitation root, so the palette variables resolve.
const BUBBLES = [
  "color-mix(in srgb, var(--accent) 45%, var(--bg))",
  "var(--soft)",
  "color-mix(in srgb, var(--accent) 70%, var(--bg))",
  "color-mix(in srgb, var(--accent) 25%, var(--bg))",
];

export const seaside: Template = {
  meta: metaFor("seaside"),
  Hero,
  Cover,
  Divider,
  Ornament,
  Backdrop,
  celebrate: (root) => petals(root, { count: 30, colors: BUBBLES, shape: "dot" }),
};
