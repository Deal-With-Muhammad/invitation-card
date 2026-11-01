import Link from "next/link";

import { AUTHOR } from "@/lib/dwm";

const PHONE = "+60 11-3986 5270";

/** Shown to everyone once an invitation has used all its visits. */
export function VisitsUsedUp({ slug, limit }: { slug: string; limit: number }) {
  const ask = `Hi Muhammad, my DWM Invite invitation (invite.dealwithmuhammad.com/${slug}) has used its ${limit} visits. I'd like unlimited visits.`;
  return (
    <main className="grid min-h-dvh place-items-center bg-deep px-6 py-10 text-center text-ivory">
      <div className="w-full max-w-sm rounded-[28px] border border-gold/60 p-8">
        <h1 className="font-serif text-[30px] leading-tight font-light tracking-wide uppercase">This invitation is full</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ivory/80">
          It has been opened {limit} times, which is all the visits it includes.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-ivory/80">
          For unlimited visits, or a custom design of your own, contact me on WhatsApp or by email.
        </p>
        <div className="mt-6 grid gap-2.5">
          <a
            href={`${AUTHOR.whatsapp}?text=${encodeURIComponent(ask)}`}
            target="_blank"
            rel="noopener"
            className="rounded-full bg-gold-light px-5 py-3 text-[15px] font-medium text-deep"
          >
            WhatsApp {PHONE}
          </a>
          <a
            href={`mailto:${AUTHOR.email}?subject=${encodeURIComponent(`Unlimited visits for /${slug}`)}&body=${encodeURIComponent(ask)}`}
            className="rounded-full border border-gold-light/70 px-5 py-3 text-[15px] text-ivory"
          >
            {AUTHOR.email}
          </a>
        </div>
        <p className="mt-6 text-[13px] leading-relaxed text-ivory/60">
          You can also find both on{" "}
          <a href={AUTHOR.url} target="_blank" rel="noopener" className="text-gold-light underline underline-offset-4">
            dealwithmuhammad.com
          </a>
          . Made this invitation?{" "}
          <Link href="/my" className="text-gold-light underline underline-offset-4">
            My invitations
          </Link>
        </p>
      </div>
    </main>
  );
}
