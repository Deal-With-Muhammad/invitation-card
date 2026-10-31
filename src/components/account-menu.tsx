"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Me = { accounts: boolean; user: { email: string; admin: boolean } | null };

/** "Sign in" in the header, or the signed-in account's menu. Hidden when accounts are off. */
export function AccountMenu() {
  const [me, setMe] = useState<Me | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => {});
  }, []);

  if (!me?.accounts) return null;
  if (!me.user)
    return (
      <Link href="/login" className="rounded-full px-3 py-2 text-[14.5px] text-ink transition-colors hover:text-brand">
        Sign in
      </Link>
    );

  const { email, admin } = me.user;
  return (
    <details className="group relative">
      <summary
        className="flex size-9 cursor-pointer list-none items-center justify-center rounded-full bg-deep text-[15px] font-medium text-ivory uppercase [&::-webkit-details-marker]:hidden"
        aria-label={`Account (${email})`}
      >
        {email.charAt(0)}
      </summary>
      <div className="absolute end-0 top-12 z-30 grid w-64 gap-0.5 rounded-2xl border border-line bg-card p-2 shadow-[0_20px_50px_-20px_rgb(42_37_32/0.35)]">
        <p className="truncate px-3 pt-1.5 pb-2 text-[13px] text-muted">{email}</p>
        <Link href="/my" className="rounded-xl px-3 py-2.5 text-[15px] hover:bg-paper-2">
          My invitations
        </Link>
        {admin && (
          <Link href="/admin" className="rounded-xl px-3 py-2.5 text-[15px] hover:bg-paper-2">
            Admin
          </Link>
        )}
        <button
          type="button"
          className="rounded-xl px-3 py-2.5 text-start text-[15px] hover:bg-paper-2"
          onClick={async () => {
            await fetch("/api/auth/signout", { method: "POST" }).catch(() => {});
            setMe({ accounts: true, user: null });
            router.push("/");
            router.refresh();
          }}
        >
          Sign out
        </button>
      </div>
    </details>
  );
}
