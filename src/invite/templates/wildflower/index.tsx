import { makeStationery } from "../stationery/kit";
import { Card, Liner } from "./art";

import "./wildflower.css";

export const wildflower = makeStationery("wildflower", { Card, Liner, surface: "marble", seal: "foil" });
