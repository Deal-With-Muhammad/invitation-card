import type { ComponentType } from "react";

import type { InviteData } from "@/invite/types";

// The page of each custom invitation (its details are in ./index.ts). Kept apart from the
// details so routes that only need a title or a preview image don't bundle every page's
// CSS and fonts (the Cloudflare build can't bundle those into a route handler).

/** A page may take its invitation's row data (`data`) to make its details editable, and
 *  `preview` when it runs in the editor (no visit is counted). */
export const CUSTOM_PAGES: Record<string, () => Promise<ComponentType<{ data?: InviteData | null; preview?: boolean }>>> = {
  "siraj-and-shireen": () => import("./siraj-and-shireen").then((m) => m.Invite),
  "shifa-and-arbaz": () => import("./shifa-and-arbaz").then((m) => m.Invite),
  "aathika-and-dilshad": () => import("./aathika-and-dilshad").then((m) => m.Invite),
  "shifa-and-arbaz-2": () => import("./shifa-and-arbaz-2").then((m) => m.Invite),
  "kagalwala-silver-jubilee": () => import("./kagalwala-silver-jubilee").then((m) => m.Invite),
  "akib-weds-riza": () => import("./akib-weds-riza").then((m) => m.Invite),
};

/** Custom pages whose details come from their row, so the editor previews the page itself. */
export const EDITABLE_CUSTOM = new Set(["kagalwala-silver-jubilee"]);
