import { headers } from "next/headers";

import { paletteFor } from "@/invite/look";
import { resolve } from "@/invite/resolve";
import { getTemplate } from "@/invite/templates";
import { OG_SIZE, ogArt, renderInviteOg, renderSiteOg } from "@/lib/og";
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
  const tpl = getTemplate(rec.data.template);
  const p = paletteFor(tpl.meta, rec.data.look);
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const origin = host ? `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}` : null;
  const art = await ogArt(origin, tpl.meta.id);
  return renderInviteOg({ p, title: r.title, names: r.names, date: r.when.date, venue: r.oneVenue ? (r.main?.venue ?? "") : "", tap: r.t.tapToOpen, art });
}
