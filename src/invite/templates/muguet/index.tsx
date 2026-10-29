import { makeStationery } from "../stationery/kit";
import { Card, Liner } from "./art";

import "./muguet.css";

export const muguet = makeStationery("muguet", { Card, Liner, surface: "marble", seal: "foil" });
