"use client";

import { buttonVariants } from "@heroui/styles";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AUTHOR } from "@/lib/dwm";

// Lemon Squeezy tells the server about the payment separately (the webhook), usually
// within a few seconds of the buyer landing here, so this page checks until the
// invitation shows as unlimited.

type State = "waiting" | "done" | "slow" | "missing";

export function Unlocked({ slug }: { slug: string }) {
  const [state, setState] = useState<State>("waiting");
  useEffect(() => {
    let stop = false;
    let tries = 0;
    const check = async () => {
      if (stop) return;
      tries += 1;
      try {
        const res = await fetch(`/api/invites/${slug}/unlock`, { cache: "no-store" });
        if (res.status === 404) return setState("missing");
        const j = (await res.json()) as { unlimited?: boolean };
        if (j.unlimited) return setState("done");
      } catch {}
      if (tries === 20) setState("slow");
      setTimeout(check, tries < 20 ? 2000 : 6000);
    };
    check();
    return () => {
      stop = true;
    };
  }, [slug]);

  const ask = `Hi Muhammad, I paid for unlimited visits on invite.dealwithmuhammad.com/${slug} but it hasn't switched on yet.`;
  return (
    <>
      <h1 className="font-serif text-[40px] leading-[1.08]">{state === "done" ? "Thank you" : state === "missing" ? "Invitation not found" : "Thank you for paying"}</h1>
      <p className="mt-4 text-[16px] leading-relaxed text-muted">
        {state === "done" && <>Unlimited visits are on. Everyone with the link can open your invitation, as often as they like.</>}
        {state === "waiting" && <>Switching on unlimited visits for your invitation. This usually takes a few seconds…</>}
        {state === "slow" && (
          <>
            The payment is taking longer than usual to reach me. It will switch on by itself as soon as it does, and your receipt from Lemon Squeezy is in your email. If it hasn&apos;t
            switched on within an hour, message me and I&apos;ll sort it out.
          </>
        )}
        {state === "missing" && <>There&apos;s no invitation at /{slug}. If you paid for it, message me with your receipt and I&apos;ll sort it out.</>}
      </p>
      <p className="mt-2 text-[14px] text-muted">invite.dealwithmuhammad.com/{slug}</p>
      <div className="mt-8 grid gap-2.5">
        {state !== "missing" && (
          <Link href={`/${slug}`} className={buttonVariants({ size: "lg", className: "w-full" })}>
            Open the invitation
          </Link>
        )}
        <Link href="/my" className={buttonVariants({ size: "lg", variant: "outline", className: "w-full" })}>
          My invitations
        </Link>
        {(state === "slow" || state === "missing") && (
          <a href={`${AUTHOR.whatsapp}?text=${encodeURIComponent(ask)}`} target="_blank" rel="noopener" className={buttonVariants({ size: "lg", variant: "outline", className: "w-full" })}>
            Message me on WhatsApp
          </a>
        )}
      </div>
    </>
  );
}
