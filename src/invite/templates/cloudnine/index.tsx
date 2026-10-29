import { petals } from "../../runtime/effects";
import { metaFor } from "../catalog";
import type { Template } from "../types";
import { Backdrop, Divider, Hero, Ornament } from "./art";
import { Cover } from "./cover";

import "./cloudnine.css";

// Soft pastel dots drifting down. The effect elements live inside the invitation
// root, so the palette variables resolve.
const PASTELS = [
  "color-mix(in srgb, var(--accent) 45%, var(--bg))",
  "color-mix(in srgb, var(--accent) 25%, var(--bg))",
  "color-mix(in srgb, var(--accent) 65%, var(--bg))",
  "color-mix(in srgb, var(--soft) 70%, var(--accent))",
];

export const cloudnine: Template = {
  meta: metaFor("cloudnine"),
  Hero,
  Cover,
  Divider,
  Ornament,
  Backdrop,
  celebrate: (root) => petals(root, { count: 30, colors: PASTELS, shape: "dot" }),
};
