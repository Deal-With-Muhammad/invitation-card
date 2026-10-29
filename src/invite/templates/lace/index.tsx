import { makeStationery } from "../stationery/kit";
import { Card, Liner } from "./art";

import "./lace.css";

export const lace = makeStationery("lace", { Card, Liner, surface: "linen", seal: "foil" });
