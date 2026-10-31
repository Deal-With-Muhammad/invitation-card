import Link from "next/link";

/** Shown to new visitors once an invitation has used all its visits. */
export function VisitsUsedUp() {
  return (
    <main className="grid min-h-dvh place-items-center bg-deep px-6 text-center text-ivory">
      <div className="max-w-sm rounded-[28px] border border-gold/60 p-8">
        <h1 className="font-serif text-[30px] leading-tight font-light tracking-wide uppercase">This invitation is full</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ivory/80">
          It has been opened by as many guests as it allows. If you were invited, ask the host to send you the details another way.
        </p>
        <p className="mt-6 text-[13px] text-ivory/60">
          Made this invitation?{" "}
          <Link href="/my" className="text-gold-light underline underline-offset-4">
            Open My invitations
          </Link>
        </p>
      </div>
    </main>
  );
}
