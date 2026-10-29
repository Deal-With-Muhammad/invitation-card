import { makeStationery } from "../stationery/kit";
import { Card, Liner } from "./art";

import "./orchid.css";

export const orchid = makeStationery("orchid", { Card, Liner, surface: "marble", seal: "foil" });
