import { CATALOG } from "@/invite/templates/catalog";
import { PAGE_LIST } from "@/lib/pages";
import { site } from "@/lib/site";

// A plain-text summary for AI assistants, built from the same copy as the site.
export const dynamic = "force-static";

export function GET() {
  const body = [
    `# ${site.name}`,
    "",
    `> ${site.answer}`,
    "",
    site.appDescription,
    "",
    "## Features",
    ...site.featureList.map((f) => `- ${f}`),
    "",
    "## Designs",
    ...CATALOG.map((m) => `- [${m.name}](${site.url}/templates/${m.id}): ${m.tagline}. ${m.description}`),
    "",
    "## Guides",
    ...PAGE_LIST.map((p) => `- [${p.title}](${site.url}/${p.slug}): ${p.description}`),
    "",
    "## FAQ",
    ...site.faqs.flatMap((f) => [`### ${f.q}`, f.a, ""]),
    `Made by Muhammad Ahmad (https://www.dealwithmuhammad.com), Kuala Lumpur, Malaysia.`,
  ].join("\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
