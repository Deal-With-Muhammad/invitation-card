import { paletteFor } from "@/invite/look";
import { resolve } from "@/invite/resolve";
import { getTemplate } from "@/invite/templates";
import { OG_SIZE, renderInviteOg, renderSiteOg } from "@/lib/og";
import { getStore } from "@/lib/server/store";
import { SLUG_RE } from "@/lib/slug";

export const alt = "Your invitation";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function InviteOg(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const rec = SLUG_RE.test(slug) ? await getStore()?.get(slug) : null;
  if (!rec) return renderSiteOg();
  const r = resolve(rec.data);
  const p = paletteFor(getTemplate(rec.data.template).meta, rec.data.look);
  return renderInviteOg({ p, title: r.title, names: r.names, date: r.when.date, venue: r.oneVenue ? (r.main?.venue ?? "") : "", tap: r.t.tapToOpen });
}
