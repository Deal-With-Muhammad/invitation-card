import type { Metadata } from "next";

import type { TemplateMeta } from "@/invite/templates/types";

import { AUTHOR } from "./dwm";
import type { LandingPage } from "./pages";
import { site } from "./site";

// JSON-LD built from the same copy that's visible on the page, so structured data
// never drifts from what people read.

const PERSON_ID = "https://www.dealwithmuhammad.com/#person";
const person = { "@id": PERSON_ID };

const personNode = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: AUTHOR.name,
  url: AUTHOR.url,
  email: `mailto:${AUTHOR.email}`,
  jobTitle: AUTHOR.jobTitle,
  address: { "@type": "PostalAddress", addressLocality: "Kuala Lumpur", addressCountry: "MY" },
  sameAs: [AUTHOR.github, AUTHOR.linkedin, AUTHOR.instagram],
};

const faqNode = (id: string, faqs: { q: string; a: string }[]) => ({
  "@type": "FAQPage",
  "@id": id,
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

const appNode = {
  "@type": "WebApplication",
  "@id": `${site.url}/#app`,
  name: site.name,
  url: `${site.url}/`,
  description: site.appDescription,
  image: `${site.url}/opengraph-image`,
  applicationCategory: "DesignApplication",
  operatingSystem: "Any (web browser)",
  browserRequirements: "Requires a modern browser with JavaScript.",
  inLanguage: "en",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: site.featureList,
  dateModified: site.updated.iso,
  author: person,
  creator: person,
  publisher: person,
  isPartOf: { "@id": `${site.url}/#website` },
};

const howToNode = (id: string, name: string, description: string, steps: { name: string; text: string }[], url: string) => ({
  "@type": "HowTo",
  "@id": id,
  name,
  description,
  step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text, url })),
});

export function buildHomeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      personNode,
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: `${site.url}/`,
        name: site.name,
        description: site.description,
        inLanguage: "en",
        publisher: person,
      },
      appNode,
      {
        "@type": "WebPage",
        "@id": `${site.url}/#webpage`,
        url: `${site.url}/`,
        name: site.title,
        description: site.description,
        inLanguage: "en",
        dateModified: site.updated.iso,
        isPartOf: { "@id": `${site.url}/#website` },
        mainEntity: { "@id": `${site.url}/#app` },
        author: person,
      },
      howToNode(`${site.url}/#how-to`, site.howTo.name, site.howTo.description, site.howTo.steps, `${site.url}/#how`),
      faqNode(`${site.url}/#faq`, site.faqs),
    ],
  };
}

const crumbs = (url: string, items: { name: string; url: string }[]) => ({
  "@type": "BreadcrumbList",
  "@id": `${url}#breadcrumb`,
  itemListElement: [{ name: site.name, url: `${site.url}/` }, ...items].map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: c.url,
  })),
});

export const pageUrl = (page: LandingPage) => `${site.url}/${page.slug}`;

export function buildPageJsonLd(page: LandingPage) {
  const url = pageUrl(page);
  const steps = page.sections.find((s) => s.id === page.steps)?.items ?? [];
  return {
    "@context": "https://schema.org",
    "@graph": [
      personNode,
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${page.title} | ${site.name}`,
        description: page.description,
        inLanguage: page.lang,
        dateModified: page.dateModified,
        isPartOf: { "@id": `${site.url}/#website` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        about: { "@id": `${site.url}/#app` },
        author: person,
      },
      crumbs(url, [{ name: page.label, url }]),
      ...(steps.length ? [howToNode(`${url}#how-to`, page.title, page.answer, steps.map((s) => ({ name: s.term, text: s.text })), `${url}#${page.steps}`)] : []),
      faqNode(`${url}#faq`, page.faqs),
    ],
  };
}

export function buildTemplateJsonLd(meta: TemplateMeta) {
  const url = `${site.url}/templates/${meta.id}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      personNode,
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${meta.name} invitation template | ${site.name}`,
        description: meta.description,
        inLanguage: "en",
        dateModified: site.updated.iso,
        isPartOf: { "@id": `${site.url}/#website` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        about: { "@id": `${site.url}/#app` },
        primaryImageOfPage: `${url}/opengraph-image`,
        author: person,
      },
      crumbs(url, [
        { name: "Templates", url: `${site.url}/templates` },
        { name: meta.name, url },
      ]),
    ],
  };
}

export function pageMetadata(page: LandingPage): Metadata {
  const title = `${page.title} | ${site.name}`;
  return {
    title: { absolute: title },
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: { type: "article", url: `/${page.slug}`, siteName: site.name, title, description: page.description, locale: page.lang === "ms" ? "ms_MY" : "en_US" },
    twitter: { card: "summary_large_image", title, description: page.description },
  };
}

/** JSON for a <script type="application/ld+json">, with "<" escaped so it can't close the tag. */
export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
