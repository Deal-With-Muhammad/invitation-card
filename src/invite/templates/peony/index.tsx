import { makeStationery } from "../stationery/kit";
import { Card, Liner } from "./art";

import "./peony.css";

export const peony = makeStationery("peony", { Card, Liner, surface: "marble", seal: "foil" });
