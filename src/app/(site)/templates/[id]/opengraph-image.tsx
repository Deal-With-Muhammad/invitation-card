import { metaFor } from "@/invite/templates/catalog";
import { OG_SIZE, renderSiteOg } from "@/lib/og";

export const alt = "Invitation template";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function TemplateOg(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const m = metaFor(id);
  return renderSiteOg({ eyebrow: "Invitation template", headline: m.name, sub: m.tagline, palette: m.palettes[0] });
}
