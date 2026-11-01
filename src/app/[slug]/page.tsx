import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { paletteFor } from "@/invite/look";
import { resolve } from "@/invite/resolve";
import { getTemplate } from "@/invite/templates";
import { isAdminRequest } from "@/lib/server/admin";
import { getStore } from "@/lib/server/store";
import { SLUG_RE } from "@/lib/slug";

import { Guest } from "./guest";
import { VisitsUsedUp } from "./used-up";

const load = cache(async (slug: string) => {
  if (!SLUG_RE.test(slug)) return null;
  return (await getStore()?.get(slug)) ?? null;
});

export async function generateMetadata(props: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const rec = await load(slug);
  if (!rec) return { title: "Invitation not found", robots: { index: false } };
  const r = resolve(rec.data);
  const title = `${r.title} ${r.names}`.trim();
  const description = [r.when.date, r.oneVenue ? r.main?.venue : ""].filter(Boolean).join(" · ") + ` — ${r.t.tapToOpen}`;
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: `/${slug}` },
    openGraph: { type: "website", url: `/${slug}`, title, description, siteName: "DWM Invite" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export async function generateViewport(props: PageProps<"/[slug]">): Promise<Viewport> {
  const { slug } = await props.params;
  const rec = await load(slug);
  const color = rec ? paletteFor(getTemplate(rec.data.template).meta, rec.data.look).bg : "#f5f0e6";
  return { themeColor: color, viewportFit: "cover" };
}

export default async function InvitePage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const rec = await load(slug);
  if (!rec) notFound();
  // Once every visit is used, nobody gets in (the admin still can, to check it).
  if (rec.views >= rec.maxViews && !(await isAdminRequest())) return <VisitsUsedUp slug={slug} limit={rec.maxViews} />;
  return <Guest slug={slug} data={rec.data} />;
}
