import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

// Search engines and AI assistants are welcome on the public pages. Shared
// invitations are private by link (each is also marked noindex), and the editor,
// preview frames and API are off limits.
const AI_AND_SEARCH_BOTS = [
  "Googlebot", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot", "Applebot-Extended",
];
const DISALLOW = ["/api/", "/create/", "/edit/", "/frame", "/my", "/dev"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_AND_SEARCH_BOTS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
