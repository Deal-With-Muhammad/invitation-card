import type { ReactNode } from "react";

/** The layout shared by /privacy and /terms. */
export function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-12 sm:px-6 lg:pt-16">
      <h1 className="font-serif text-[42px] leading-[1.06] sm:text-[52px]">{title}</h1>
      <p className="mt-3 text-[14px] text-muted">Last updated 5 November 2026</p>
      <p className="mt-5 text-[16.5px] leading-relaxed text-muted">{intro}</p>
      <div className="mt-4 text-[15.5px] leading-relaxed text-muted [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-9 [&_h2]:mb-2 [&_h2]:font-serif [&_h2]:text-[26px] [&_h2]:leading-tight [&_h2]:text-ink [&_li]:mt-2 [&_p]:mt-3 [&_strong]:font-medium [&_strong]:text-ink [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:ps-5">
        {children}
      </div>
    </main>
  );
}
