"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { tokenFor } from "@/components/editor/storage";

// The host's private page for guest replies: how many people are coming to each
// function, every RSVP, and the wishes (each can be hidden from the invitation).
// It opens with the private edit key (#k=… or remembered on this device) or the
// account the invitation is saved to.

type Rsvp = { id: number; name: string; attending: "yes" | "no"; guests: number; events: string[]; phone: string | null; note: string | null; createdAt: number };
type Wish = { id: number; name: string; message: string; createdAt: number };
type Data = { events: { id: string; title: string; date: string }[]; rsvps: Rsvp[]; wishes: Wish[]; names: string[] };

const when = (t: number) => new Date(t).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const csvCell = (v: string | number | null) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function RepliesView({ slug }: { slug: string }) {
  const key = useRef<string | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fromHash = new URLSearchParams(window.location.hash.slice(1)).get("k");
    const token = (key.current ??= fromHash || tokenFor(slug));
    if (fromHash) history.replaceState(null, "", window.location.pathname);
    fetch(`/api/invites/${slug}/rsvp`, { headers: token ? { "x-edit-token": token } : {} })
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 403 ? "Open this page from your private edit link, or sign in to the account the invitation is saved to." : "This invitation couldn't be found.");
        setData((await res.json()) as Data);
      })
      .catch((e: Error) => setError(e.message));
  }, [slug]);

  const counts = useMemo(() => {
    if (!data) return [];
    return data.events.map((e) => {
      const yes = data.rsvps.filter((r) => r.attending === "yes" && (r.events.length === 0 || r.events.includes(e.id)));
      return { ...e, replies: yes.length, people: yes.reduce((n, r) => n + r.guests, 0) };
    });
  }, [data]);

  const hide = async (id: number) => {
    const token = key.current;
    const res = await fetch(`/api/invites/${slug}/wishes?id=${id}`, { method: "DELETE", headers: token ? { "x-edit-token": token } : {} });
    if (res.ok) setData((d) => (d ? { ...d, wishes: d.wishes.filter((w) => w.id !== id) } : d));
  };

  const download = () => {
    if (!data) return;
    const title = (id: string) => data.events.find((e) => e.id === id)?.title ?? id;
    const rows = [
      ["Name", "Attending", "People", "Functions", "Phone", "Note", "Replied"],
      ...data.rsvps.map((r) => [r.name, r.attending === "yes" ? "Yes" : "No", r.guests, r.events.map(title).join("; "), r.phone, r.note, new Date(r.createdAt).toISOString()]),
    ];
    const blob = new Blob(["﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slug}-rsvps.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (error)
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-serif text-[30px]">Replies</h1>
        <p className="mt-3 text-muted">{error}</p>
      </main>
    );
  if (!data) return <main className="mx-auto max-w-xl px-4 py-16 text-center text-muted">Loading replies…</main>;

  const declined = data.rsvps.filter((r) => r.attending === "no").length;
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[14px] text-muted">
            <Link href={`/${slug}`} className="underline underline-offset-2">
              /{slug}
            </Link>
          </p>
          <h1 className="font-serif text-[34px] leading-tight">Replies for {data.names.join(" & ")}</h1>
          <p className="mt-1 text-[15px] text-muted">
            {data.rsvps.length} {data.rsvps.length === 1 ? "reply" : "replies"} · {declined} can&apos;t come · {data.wishes.length} {data.wishes.length === 1 ? "wish" : "wishes"}
          </p>
        </div>
        {data.rsvps.length > 0 && (
          <button type="button" onClick={download} className="h-10 rounded-full border border-line px-5 text-[14px] transition hover:bg-paper-2">
            Download as spreadsheet
          </button>
        )}
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counts.map((c) => (
          <li key={c.id} className="rounded-2xl border border-line bg-card p-4">
            <p className="text-[13px] text-muted">{c.title}</p>
            <p className="mt-1 font-serif text-[34px] leading-none tabular-nums">{c.people}</p>
            <p className="mt-1 text-[12.5px] text-muted">
              {c.people === 1 ? "person" : "people"} from {c.replies} {c.replies === 1 ? "reply" : "replies"}
            </p>
          </li>
        ))}
      </ul>

      <section className="mt-10">
        <h2 className="font-serif text-[24px]">Guests</h2>
        {data.rsvps.length === 0 ? (
          <p className="mt-2 text-muted">No replies yet. They appear here as guests send them.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead className="bg-paper-2 text-[12.5px] text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Coming</th>
                  <th className="px-4 py-2.5 font-medium">Functions</th>
                  <th className="px-4 py-2.5 font-medium">Phone</th>
                  <th className="px-4 py-2.5 font-medium">Note</th>
                  <th className="px-4 py-2.5 font-medium">Replied</th>
                </tr>
              </thead>
              <tbody>
                {data.rsvps.map((r) => (
                  <tr key={r.id} className="border-t border-line align-top">
                    <td className="px-4 py-2.5 font-medium">{r.name}</td>
                    <td className="px-4 py-2.5">{r.attending === "yes" ? `Yes, ${r.guests}` : "No"}</td>
                    <td className="px-4 py-2.5">{r.events.map((id) => data.events.find((e) => e.id === id)?.title ?? id).join(", ")}</td>
                    <td className="px-4 py-2.5">{r.phone && <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}>{r.phone}</a>}</td>
                    <td className="px-4 py-2.5 text-muted">{r.note}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted">{when(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10 pb-10">
        <h2 className="font-serif text-[24px]">Wishes</h2>
        {data.wishes.length === 0 ? (
          <p className="mt-2 text-muted">No wishes yet.</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {data.wishes.map((w) => (
              <li key={w.id} className="rounded-2xl border border-line bg-card p-4">
                <p className="text-[15px] italic">{w.message}</p>
                <div className="mt-2 flex items-center justify-between gap-3 text-[13px] text-muted">
                  <span>
                    {w.name} · {when(w.createdAt)}
                  </span>
                  <button type="button" onClick={() => hide(w.id)} className="underline underline-offset-2 hover:text-ink">
                    Hide
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
