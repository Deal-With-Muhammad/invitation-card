import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LiveThumb } from "@/components/live-thumb";
import { Eyebrow } from "@/components/sections";
import { Thumb } from "@/invite/runtime/thumb";
import { TEMPLATE_LIST, TEMPLATES } from "@/invite/templates";
import { CATALOG } from "@/invite/templates/catalog";
import { OCCASIONS, type Occasion } from "@/invite/types";
import { OCCASION_LABEL } from "@/lib/filters";
import { buildTemplateJsonLd, jsonLdString } from "@/lib/seo";

import { DemoPhone } from "./demo-phone";

export function generateStaticParams() {
  return CATALOG.map((m) => ({ id: m.id }));
}

export async function generateMetadata(props: PageProps<"/templates/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const t = TEMPLATES[id];
  if (!t) return {};
  const occ = t.meta.occasions.slice(0, 3).map((o) => OCCASION_LABEL[o].toLowerCase());
  return {
    title: `${t.meta.name} Invitation Template for ${occ.join(", ")}`.replace(/, ([^,]*)$/, " & $1"),
    description: `${t.meta.description} Free to customise and share as a link.`,
    alternates: { canonical: `/templates/${id}` },
    keywords: t.meta.keywords,
  };
}

export default async function TemplatePage(props: PageProps<"/templates/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const t = TEMPLATES[id];
  if (!t) notFound();
  const { meta } = t;
  const occasion = (typeof sp.occasion === "string" && (OCCASIONS as readonly string[]).includes(sp.occasion) && meta.occasions.includes(sp.occasion as Occasion)
    ? sp.occasion
    : meta.defaultOccasion) as Occasion;
  const related = TEMPLATE_LIST.filter((x) => x.meta.id !== id && x.meta.occasions.some((o) => meta.occasions.includes(o))).slice(0, 4);

  return (
    <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(buildTemplateJsonLd(meta)) }} />
      <nav aria-label="Breadcrumb" className="mb-6 text-[13.5px] text-muted">
        <Link href="/templates" className="hover:text-ink">
          Designs
        </Link>{" "}
        / <span className="text-ink">{meta.name}</span>
      </nav>
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_440px]">
        <div className="lg:pt-6">
          <Eyebrow>{meta.occasions.map((o) => OCCASION_LABEL[o]).join(" · ")}</Eyebrow>
          <h1 className="font-serif text-[42px] leading-[1.05] sm:text-[56px]">{meta.name}</h1>
          <p className="mt-3 text-[20px] text-muted">{meta.tagline}</p>
          <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted">{meta.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/create/${meta.id}?occasion=${occasion}`} className="btn btn-primary h-12 px-6 text-[16px]">
              Use this design
            </Link>
            <Link href={`/preview/${meta.id}?occasion=${occasion}`} className="btn btn-ghost h-12 px-6 text-[16px]" target="_blank">
              Open full screen
            </Link>
          </div>

          {meta.palettes.length > 1 && (
            <>
              <h2 className="mt-12 mb-4 text-[15px] font-medium">Colourways</h2>
              <ul className="grid max-w-lg grid-cols-3 gap-3">
                {meta.palettes.map((p) => (
                  <li key={p.id}>
                    <Link href={`/create/${meta.id}?occasion=${occasion}&palette=${p.id}`} className="block overflow-hidden rounded-2xl ring-1 ring-line transition-transform hover:-translate-y-0.5" aria-label={`Use ${meta.name} in ${p.name}`}>
                      <Thumb id={meta.id} palette={p.id} occasion={occasion} />
                    </Link>
                    <p className="mt-1.5 text-[13px] text-muted">{p.name}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-6 max-w-lg text-[14px] text-muted">Opening: {meta.opening.toLowerCase()}. Your names, dates and venues are printed as real text, in any of the supported languages.</p>
        </div>
        <DemoPhone src={`/preview/${meta.id}?occasion=${occasion}`} title={`${meta.name} invitation, live`} />
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-serif text-[28px]">You might also like</h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((x) => (
              <li key={x.meta.id}>
                <Link href={`/templates/${x.meta.id}`} className="block overflow-hidden rounded-[20px] ring-1 ring-line transition-transform hover:-translate-y-1">
                  <LiveThumb id={x.meta.id}>
                    <Thumb id={x.meta.id} />
                  </LiveThumb>
                </Link>
                <p className="mt-2 font-serif text-[17px]">{x.meta.name}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
