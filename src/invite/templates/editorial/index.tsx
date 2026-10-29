import { metaFor } from "../catalog";
import type { Template } from "../types";
import { Divider, Hero, Ornament } from "./art";
import { Cover } from "./cover";

import "./editorial.css";

export const editorial: Template = {
  meta: metaFor("editorial"),
  Hero,
  Cover,
  Divider,
  Ornament,
};
