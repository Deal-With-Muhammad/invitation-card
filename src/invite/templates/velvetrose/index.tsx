import { makeStationery } from "../stationery/kit";
import { Card, Liner } from "./art";

import "./velvetrose.css";

export const velvetrose = makeStationery("velvetrose", { Card, Liner, surface: "velvet", seal: "wax" });
