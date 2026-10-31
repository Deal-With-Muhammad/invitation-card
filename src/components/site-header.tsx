import Link from "next/link";

import { site } from "@/lib/site";

import { AccountMenu } from "./account-menu";
import { Logo } from "./logo";

const nav = [
  { href: "/templates", label: "Designs" },
  { href: "/#how", label: "How it works" },
  { href: "/custom", label: "Custom design" },
  { href: "/my", label: "My invitations" },
];

export function SiteHeader() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
      <Link href="/" className="rounded-xl" aria-label={`${site.name} home`}>
        <Logo />
      </Link>
      <nav aria-label="Site" className="flex items-center gap-1">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="hidden rounded-full px-3 py-2 text-[14.5px] text-muted transition-colors hover:text-ink md:inline-flex">
            {n.label}
          </Link>
        ))}
        <details className="group relative md:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full text-ink hover:bg-paper-2 [&::-webkit-details-marker]:hidden" aria-label="Menu">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
              <path d="M4 8h16M4 16h16" />
            </svg>
          </summary>
          <div className="absolute end-0 top-12 z-30 grid w-56 gap-0.5 rounded-2xl border border-line bg-card p-2 shadow-[0_20px_50px_-20px_rgb(42_37_32/0.35)]">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-xl px-3 py-2.5 text-[15px] hover:bg-paper-2">
                {n.label}
              </Link>
            ))}
          </div>
        </details>
        <AccountMenu />
        {/* Google-style launcher for every DWM app, served by the portfolio. */}
        <dwm-apps current={site.id} />
      </nav>
    </header>
  );
}
