"use client";

import { Button, buttonVariants } from "@heroui/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { forgetInvite, loadDraft, loadMine, type MyInvite } from "@/components/editor/storage";
import { visitsLeft } from "@/components/editor/visits";
import { metaFor } from "@/invite/templates/catalog";

type Status = { views: number; maxViews: number; saved: boolean } | null;
type AccountInvite = { slug: string; names: string; template: string; views: number; maxViews: number; createdAt: number };
type Me = { accounts: boolean; user: { email: string } | null; invites?: AccountInvite[] };

type Row = { slug: string; names: string; template: string; views?: number; maxViews?: number; gone?: boolean };

export function MyInvites() {
  const [me, setMe] = useState<Me | null>(null);
  const [device, setDevice] = useState<MyInvite[] | null>(null);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [draft, setDraft] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const mine = loadMine();
    const [meRes, stRes] = await Promise.all([
      fetch("/api/me?invites=1").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      mine.length
        ? fetch("/api/invites/status", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ items: mine.map((m) => ({ slug: m.slug, token: m.token })) }),
          })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        : null,
    ]);
    setDevice(mine);
    setMe(meRes ?? { accounts: false, user: null });
    if (stRes?.statuses) setStatuses(stRes.statuses);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads this device's saved invitations
    refresh();
    const d = loadDraft();
    if (d) setDraft(d.data.template);
  }, [refresh]);

  if (me == null || device == null) return <p className="text-muted">Loading…</p>;

  const signedIn = Boolean(me.user);
  const account: Row[] = me.invites ?? [];
  const inAccount = new Set(account.map((a) => a.slug));
  // Device invitations that aren't in this account (made as a guest, or saved to another account).
  const local: Row[] = device
    .filter((m) => !inAccount.has(m.slug))
    .map((m) => {
      const s = statuses[m.slug];
      return { slug: m.slug, names: m.names, template: m.template, views: s?.views, maxViews: s?.maxViews, gone: s === null };
    });
  const claimable = device.filter((m) => !inAccount.has(m.slug) && statuses[m.slug] && !statuses[m.slug]!.saved);

  const claim = async () => {
    setClaiming(true);
    setNote(null);
    try {
      const res = await fetch("/api/me/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: claimable.map((m) => ({ slug: m.slug, token: m.token })) }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      setNote(`${j.claimed.length} ${j.claimed.length === 1 ? "invitation" : "invitations"} saved to your account.`);
      await refresh();
    } catch (e) {
      setNote(e instanceof Error && e.message ? e.message : "Couldn't save them. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-8">
      {draft && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/45 bg-gold/12 p-4">
          <p className="text-[15px]">You have an unpublished draft ({metaFor(draft).name}).</p>
          <Link href={`/create/${draft}`} className={buttonVariants({ className: "h-10 px-4 text-[14px]" })}>
            Continue editing
          </Link>
        </div>
      )}

      {me.accounts && !signedIn && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card p-4">
          <p className="max-w-md text-[14.5px] text-muted">
            These are saved in this browser only. Sign in to keep them in an account and edit them from any phone.
          </p>
          <Link href="/login?next=/my" className={buttonVariants({ variant: "outline", className: "h-10 px-4 text-[14px]" })}>
            Sign in or sign up
          </Link>
        </div>
      )}

      {signedIn && (
        <section>
          <h2 className="mb-3 text-[13px] font-medium text-muted">In your account · {me.user!.email}</h2>
          {account.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line p-6 text-center text-[15px] text-muted">
              Nothing saved to your account yet. Invitations you publish while signed in appear here.
            </p>
          ) : (
            <InviteList rows={account} />
          )}
        </section>
      )}

      {(local.length > 0 || !signedIn) && (
        <section>
          {signedIn && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[13px] font-medium text-muted">On this device only</h2>
              {claimable.length > 0 && (
                <Button size="sm" isDisabled={claiming} onPress={claim}>
                  {claiming ? "Saving…" : `Save ${claimable.length === 1 ? "it" : `all ${claimable.length}`} to my account`}
                </Button>
              )}
            </div>
          )}
          {note && <p className="mb-3 rounded-xl bg-brand/10 px-3.5 py-2.5 text-[14px] text-brand">{note}</p>}
          {local.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-10 text-center">
              <p className="font-serif text-[22px]">No invitations on this device yet</p>
              <p className="mt-2 text-muted">Invitations you publish from this browser show up here. Made one elsewhere? Open its private edit link.</p>
              <Link href="/templates" className={buttonVariants({ className: "mt-6" })}>
                Make an invitation
              </Link>
            </div>
          ) : (
            <InviteList
              rows={local}
              onRemove={(slug) => {
                if (!window.confirm("Remove it from this list? The invitation itself stays online. Keep its edit link if you want to edit it later.")) return;
                forgetInvite(slug);
                setDevice(loadMine());
              }}
            />
          )}
        </section>
      )}
    </div>
  );
}

function InviteList({ rows, onRemove }: { rows: Row[]; onRemove?: (slug: string) => void }) {
  return (
    <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
      {rows.map((m) => (
        <li key={m.slug} className="flex flex-wrap items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-[19px]">{m.names || m.slug}</p>
            <p className="truncate text-[13px] text-muted">
              {metaFor(m.template).name} · invite.dealwithmuhammad.com/{m.slug}
            </p>
            {m.gone ? (
              <p className="mt-1.5 text-[13px] text-wax">No longer online</p>
            ) : (
              m.views != null && m.maxViews != null && <Visits views={m.views} maxViews={m.maxViews} />
            )}
          </div>
          <div className="flex gap-2">
            {!m.gone && (
              <>
                <Link href={`/${m.slug}`} className={buttonVariants({ variant: "outline", size: "sm" })} target="_blank">
                  Open
                </Link>
                <Link href={`/edit/${m.slug}`} className={buttonVariants({ size: "sm" })}>
                  Edit
                </Link>
              </>
            )}
            {onRemove && (
              <Button variant="ghost" size="sm" className="px-2.5 text-[13px] text-muted hover:text-wax" onPress={() => onRemove(m.slug)}>
                Remove
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** "88 of 100 visits left" with a thin bar of what's used. */
function Visits({ views, maxViews }: { views: number; maxViews: number }) {
  const left = Math.max(0, maxViews - views);
  const low = left <= Math.max(5, maxViews * 0.1);
  return (
    <div className="mt-2 max-w-60">
      <div className="h-1.5 overflow-hidden rounded-full bg-paper-3" aria-hidden>
        <div className={`h-full rounded-full ${low ? "bg-wax" : "bg-brand"}`} style={{ width: `${Math.min(100, (views / maxViews) * 100)}%` }} />
      </div>
      <p className={`mt-1 text-[12.5px] tabular-nums ${low ? "text-wax" : "text-muted"}`}>
        {visitsLeft(views, maxViews)} · opened by {views} {views === 1 ? "guest" : "guests"}
      </p>
    </div>
  );
}
