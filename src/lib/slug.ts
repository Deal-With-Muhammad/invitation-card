// Share links are invite.dealwithmuhammad.com/<slug>. Slugs come from the names
// ("zara-and-ibrahim") and can be edited before publishing.

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$/;

/** Top-level paths the site uses, plus words that would make confusing links. */
export const RESERVED = new Set([
  "api", "preview", "frame", "dev", "templates", "template", "create", "edit", "my", "custom", "about", "privacy",
  "terms", "help", "faq", "contact", "pricing", "admin", "login", "signup", "account", "settings", "stats", "www",
  "invite", "invites", "dwm", "app", "static", "assets", "public", "icon", "apple-icon", "opengraph-image",
  "sitemap", "robots", "manifest", "llms", "favicon", "new", "demo", "examples", "blog",
  "wedding-invitation-maker", "nikah-invitation-card", "walima-invitation-card", "mehndi-invitation-card",
  "kad-kahwin-digital", "birthday-invitation-maker", "aqiqah-invitation-card", "eid-invitation-card",
  "engagement-invitation-card", "digital-invitation-card", "shadi-card-online",
]);

export function slugify(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

export function suggestSlug(names: string[]) {
  const base = slugify(names.filter(Boolean).join(" and "));
  return base.length >= 3 ? base : "";
}

export const validSlug = (s: string) => SLUG_RE.test(s) && !RESERVED.has(s) && !s.includes("--");

export const randomSuffix = () => Math.random().toString(36).slice(2, 6);
