import { makeStationery } from "../stationery/kit";
import { Card, Liner } from "./art";

import "./filigree.css";

export const filigree = makeStationery("filigree", { Card, Liner, surface: "marble", seal: "foil" });
