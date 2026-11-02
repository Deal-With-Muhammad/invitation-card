import type { ComponentType } from "react";

import type { Palette } from "@/invite/templates/types";

// Custom invitations: one-off pages designed for a client, at
// invite.dealwithmuhammad.com/<slug>. They aren't templates (never in the gallery or
// the editor) and have no visit limit. Each also has a row in the invites table
// (made by hand, max_views 2147483647) so the link is reserved, visits are counted
// and the admin lists it. Art and video live in public/custom/<slug>/.

export type CustomInvite = {
  /** Page and link-preview title. */
  title: string;
  description: string;
  /** Browser bar colour. */
  themeColor: string;
  /** Thumbnail for the admin list. */
  poster: string;
  /** Link preview: colours, art (a 630px-tall JPEG) and the text beside it. */
  og: { p: Palette; art: string; title: string; names: string; date: string; venue: string };
  load: () => Promise<ComponentType>;
};

export const CUSTOM: Record<string, CustomInvite> = {
  "siraj-and-shireen": {
    title: "Nikah & Walima · Siraj & Shireen",
    description: "2 & 4 December 2026 · Hyderabad — tap to open",
    themeColor: "#eee6db",
    poster: "/custom/siraj-and-shireen/poster.webp",
    og: {
      p: { id: "sage", name: "Sage", bg: "#eee6db", ink: "#3f4532", accent: "#7a8556", soft: "#d9d2bf" },
      art: "/custom/siraj-and-shireen/og.jpg",
      title: "Nikah & Walima",
      names: "Siraj & Shireen",
      date: "2 & 4 December 2026",
      venue: "Hyderabad",
    },
    load: () => import("./siraj-and-shireen").then((m) => m.Invite),
  },
};

export const customFor = (slug: string): CustomInvite | null => (Object.hasOwn(CUSTOM, slug) ? CUSTOM[slug] : null);

export const CUSTOM_SLUGS = Object.keys(CUSTOM);
