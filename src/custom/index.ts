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
  "shifa-and-arbaz": {
    title: "Wedding Celebrations · Shifa & Arbaz",
    description: "Nikah, Mehendi, Pithi & Mosaru and Daawat-e-Mehmani · 7–9 January 2027 · Vapi — tap to open",
    themeColor: "#4b1630",
    poster: "/custom/shifa-and-arbaz/poster.webp",
    og: {
      p: { id: "plum", name: "Plum", bg: "#f6efe2", ink: "#3b2630", accent: "#7a2a45", soft: "#e6d3a3" },
      art: "/custom/shifa-and-arbaz/og.jpg",
      title: "Wedding Celebrations",
      names: "Shifa & Arbaz",
      date: "7 – 9 January 2027",
      venue: "Vapi, Gujarat",
    },
    load: () => import("./shifa-and-arbaz").then((m) => m.Invite),
  },
  "aathika-and-dilshad": {
    title: "Nikah · Aathika & Dilshad",
    description: "Friday 20 November 2026 · 4:30 PM · Vellore — tap to open",
    themeColor: "#ece3d4",
    poster: "/custom/aathika-and-dilshad/poster.webp",
    og: {
      p: { id: "ivory", name: "Ivory", bg: "#f3ece0", ink: "#4e3a28", accent: "#a98a5c", soft: "#e2d6c2" },
      art: "/custom/aathika-and-dilshad/og.jpg",
      title: "Nikah",
      names: "Aathika & Dilshad",
      date: "Friday 20 November 2026",
      venue: "Vellore",
    },
    load: () => import("./aathika-and-dilshad").then((m) => m.Invite),
  },
  "shifa-and-arbaz-2": {
    title: "Wedding Celebrations · Shifa & Arbaz",
    description: "Nikah, Mehendi, Pithi & Mosaru and Daawat-e-Mehmani · 7–9 January 2027 · Vapi — tap to open",
    themeColor: "#ece3d4",
    poster: "/custom/shifa-and-arbaz-2/poster.webp",
    og: {
      p: { id: "ivory", name: "Ivory", bg: "#f3ece0", ink: "#4e3a28", accent: "#a98a5c", soft: "#e2d6c2" },
      art: "/custom/shifa-and-arbaz-2/og.jpg",
      title: "Wedding Celebrations",
      names: "Shifa & Arbaz",
      date: "7 – 9 January 2027",
      venue: "Vapi, Gujarat",
    },
    load: () => import("./shifa-and-arbaz-2").then((m) => m.Invite),
  },
  "kagalwala-silver-jubilee": {
    title: "Silver Jubilee · Mr & Mrs Kagalwala",
    description: "25 years together · Sunday 27 December 2026 — tap to open",
    themeColor: "#eeeef0",
    poster: "/custom/kagalwala-silver-jubilee/poster.webp",
    og: {
      p: { id: "silver", name: "Silver", bg: "#f2f2f3", ink: "#2f343c", accent: "#7d838d", soft: "#d9dbdf" },
      art: "/custom/kagalwala-silver-jubilee/og.jpg",
      title: "Silver Jubilee",
      names: "Mr & Mrs Kagalwala",
      date: "Sunday 27 December 2026",
      venue: "25 years together",
    },
    load: () => import("./kagalwala-silver-jubilee").then((m) => m.Invite),
  },
};

export const customFor = (slug: string): CustomInvite | null => (Object.hasOwn(CUSTOM, slug) ? CUSTOM[slug] : null);

export const CUSTOM_SLUGS = Object.keys(CUSTOM);
