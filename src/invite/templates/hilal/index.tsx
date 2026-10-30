import { sparkles } from "../../runtime/effects";
import { makePainted } from "../painted/kit";

import "./hilal.css";

// Hilal: clouds part to reveal a crescent moon. A filmed opening (public/art/hilal/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const hilal = makePainted("hilal", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "25%", width: 290 },
  stripY: "97%",
  celebrate: (root) => {
    sparkles(root, { count: 36, color: "#f3d68a" });
  },
});
