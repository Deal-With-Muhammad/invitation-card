"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { forgetInvite, loadDraft, loadMine, type MyInvite } from "@/components/editor/storage";
import { metaFor } from "@/invite/templates/catalog";

export function MyInvites() {
  const [mine, setMine] = useState<MyInvite[] | null>(null);
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- saved on this device only
    setMine(loadMine());
    const d = loadDraft();
    if (d) setDraft(d.data.template);
  }, []);

  if (mine == null) return <p className="text-muted">Loading…</p>;

  return (
    <div className="space-y-8">
      {draft && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/45 bg-gold/12 p-4">
          <p className="text-[15px]">You have an unpublished draft ({metaFor(draft).name}).</p>
          <Link href={`/create/${draft}`} className="btn btn-primary h-10 px-4 text-[14px]">
            Continue editing
          </Link>
        </div>
      )}
      {mine.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="font-serif text-[22px]">No invitations on this device yet</p>
          <p className="mt-2 text-muted">Invitations you publish from this browser show up here. Made one elsewhere? Open its private edit link.</p>
          <Link href="/templates" className="btn btn-primary mt-6">
            Make an invitation
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
          {mine.map((m) => (
            <li key={m.slug} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-[19px]">{m.names || m.slug}</p>
                <p className="truncate text-[13px] text-muted">
                  {metaFor(m.template).name} · invite.dealwithmuhammad.com/{m.slug}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/${m.slug}`} className="btn btn-ghost h-9 px-3.5 text-[13.5px]" target="_blank">
                  Open
                </Link>
                <Link href={`/edit/${m.slug}`} className="btn btn-primary h-9 px-3.5 text-[13.5px]">
                  Edit
                </Link>
                <button
                  type="button"
                  className="h-9 px-2 text-[13px] text-muted hover:text-wax"
                  onClick={() => {
                    if (!window.confirm("Remove it from this list? The invitation itself stays online. Keep its edit link if you want to edit it later.")) return;
                    forgetInvite(m.slug);
                    setMine(loadMine());
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
