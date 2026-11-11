import type { ComponentType } from "react";

// The page of each custom invitation (its details are in ./index.ts). Kept apart from the
// details so routes that only need a title or a preview image don't bundle every page's
// CSS and fonts (the Cloudflare build can't bundle those into a route handler).

export const CUSTOM_PAGES: Record<string, () => Promise<ComponentType>> = {
  "siraj-and-shireen": () => import("./siraj-and-shireen").then((m) => m.Invite),
  "shifa-and-arbaz": () => import("./shifa-and-arbaz").then((m) => m.Invite),
  "aathika-and-dilshad": () => import("./aathika-and-dilshad").then((m) => m.Invite),
  "shifa-and-arbaz-2": () => import("./shifa-and-arbaz-2").then((m) => m.Invite),
  "kagalwala-silver-jubilee": () => import("./kagalwala-silver-jubilee").then((m) => m.Invite),
  "akib-weds-riza": () => import("./akib-weds-riza").then((m) => m.Invite),
};
