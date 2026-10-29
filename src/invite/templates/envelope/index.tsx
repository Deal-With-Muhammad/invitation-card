import { metaFor } from "../catalog";
import type { Template } from "../types";
import { Backdrop, Divider, Hero, Ornament } from "./art";
import { Cover } from "./cover";

import "./envelope.css";

export const envelope: Template = {
  meta: metaFor("envelope"),
  Hero,
  Cover,
  Divider,
  Ornament,
  Backdrop,
};
