import Link from "next/link";

import { AUTHOR, TOOLS } from "@/lib/dwm";
import { PAGE_LIST } from "@/lib/pages";
import { site } from "@/lib/site";

import { GithubIcon, LinkedinIcon } from "./brand-marks";
import { Logo } from "./logo";
import { VisitCounter } from "./visit-counter";

const link = "transition-colors hover:text-ink";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-paper-2/60">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-[14px] leading-relaxed text-muted">
            Beautiful invitations you send as a link. Free, no sign-up, no ads.
          </p>
          <p className="text-[13px] text-muted">
            Made by{" "}
            <a className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink" href={AUTHOR.url} rel="author noopener">
              {AUTHOR.name}
            </a>
            , {AUTHOR.location}
          </p>
          <div className="flex gap-2 pt-1">
            <a className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-ink" href={AUTHOR.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <GithubIcon className="size-4" aria-hidden />
            </a>
            <a className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-ink" href={AUTHOR.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <LinkedinIcon className="size-4" aria-hidden />
            </a>
          </div>
        </div>
        <nav aria-label="Invitations" className="space-y-2.5 text-[14px] text-muted">
          <p className="font-medium text-ink">Invitations</p>
          <Link className={`block ${link}`} href="/templates">
            All designs
          </Link>
          {PAGE_LIST.map((p) => (
            <Link key={p.slug} className={`block ${link}`} href={`/${p.slug}`}>
              {p.label}
            </Link>
          ))}
          <Link className={`block ${link}`} href="/custom">
            Custom design
          </Link>
        </nav>
        <nav aria-label="Free tools by Muhammad Ahmad" className="space-y-2.5 text-[14px] text-muted">
          <p className="font-medium text-ink">More free tools</p>
          {TOOLS.filter((t) => t.id !== site.id).map((t) => (
            <a key={t.id} className={`block ${link}`} href={t.url} title={t.blurb}>
              {t.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-8 text-[12px] text-muted sm:px-6">
        <span>© 2026 {site.name}</span>
        <span aria-hidden>·</span>
        <a className={link} href={`mailto:${AUTHOR.email}`}>
          {AUTHOR.email}
        </a>
        <span aria-hidden>·</span>
        <Link className={link} href="/privacy">
          Privacy
        </Link>
        <span aria-hidden>·</span>
        <Link className={link} href="/terms">
          Terms
        </Link>
        <span aria-hidden>·</span>
        <span>Updated {site.updated.label}</span>
        <VisitCounter />
      </div>
    </footer>
  );
}
