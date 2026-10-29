import { petals as fall } from "../../runtime/effects";
import { makeStationery } from "../stationery/kit";
import { Card, Liner } from "./art";

import "./petals.css";

export const petals = makeStationery("petals", { Card, Liner, surface: "marble", seal: "foil", celebrate: (root) => fall(root, { count: 26 }) });
