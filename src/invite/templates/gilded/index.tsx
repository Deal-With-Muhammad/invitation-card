import { makeStationery } from "../stationery/kit";
import { Card, Liner } from "./art";

import "./gilded.css";

export const gilded = makeStationery("gilded", { Card, Liner, surface: "marble", seal: "foil" });
