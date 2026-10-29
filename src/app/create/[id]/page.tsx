import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Editor } from "@/components/editor/editor";
import { TEMPLATES } from "@/invite/templates";
import { LANGS, OCCASIONS, type Lang, type Occasion } from "@/invite/types";

export async function generateMetadata(props: PageProps<"/create/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const t = TEMPLATES[id];
  return {
    title: t ? `Make your ${t.meta.name} invitation` : "Make an invitation",
    robots: { index: false, follow: true },
    alternates: { canonical: t ? `/templates/${id}` : "/templates" },
  };
}

export default async function CreatePage(props: PageProps<"/create/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const t = TEMPLATES[id];
  if (!t) notFound();
  const occasion = typeof sp.occasion === "string" && (OCCASIONS as readonly string[]).includes(sp.occasion) ? (sp.occasion as Occasion) : undefined;
  const palette = typeof sp.palette === "string" && t.meta.palettes.some((p) => p.id === sp.palette) ? sp.palette : undefined;
  const lang = typeof sp.lang === "string" && (LANGS as readonly string[]).includes(sp.lang) ? (sp.lang as Lang) : undefined;
  return <Editor mode="create" template={t.meta.id} occasion={occasion} palette={palette} lang={lang} />;
}
