import { makeStationery } from "../stationery/kit";
import { Card, Liner } from "./art";

import "./rosestudy.css";

export const rosestudy = makeStationery("rosestudy", { Card, Liner, surface: "marble", seal: "foil" });
