"use client";

import { Check, Copy, ExternalLink, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SAMPLE_NAMES } from "@/invite/defaults";
import { resolve } from "@/invite/resolve";
import type { InviteData } from "@/invite/types";
import { suggestSlug, validSlug } from "@/lib/slug";

import { QrCode } from "./qr";
import { rememberInvite } from "./storage";

const HOST = "invite.dealwithmuhammad.com";

export const origin = () => (typeof window === "undefined" ? `https://${HOST}` : window.location.origin);

function CopyField({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-paper p-1.5 ps-3">
      <span className="min-w-0 flex-1 truncate text-[14px]" title={value}>
        {value.replace(/^https?:\/\//, "")}
      </span>
      <button
        type="button"
        aria-label={label}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setDone(true);
            window.setTimeout(() => setDone(false), 1600);
          } catch {}
        }}
        className="btn btn-primary h-9 px-3.5 text-[13.5px]"
      >
        {done ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        {done ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function ShareCard({ data, slug, token }: { data: InviteData; slug: string; token?: string }) {
  const r = resolve(data);
  const url = `${origin()}/${slug}`;
  const editUrl = token ? `${origin()}/edit/${slug}#k=${token}` : null;
  const message = `${r.title} ${r.names}\n${r.t.tapToOpen}: ${url}`;
  const canShare = typeof navigator !== "undefined" && "share" in navigator;
  return (
    <div className="space-y-5">
      <div>
        <p className="label">Your invitation link</p>
        <CopyField value={url} label="Copy invitation link" />
        <div className="mt-3 flex flex-wrap gap-2">
          <a className="btn h-10 bg-[#1f7a4d] px-4 text-[14px] text-white hover:bg-[#17663f]" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.1 1.3Z" />
            </svg>
            Send on WhatsApp
          </a>
          {canShare && (
            <button type="button" className="btn btn-ghost h-10 px-4 text-[14px]" onClick={() => navigator.share({ title: `${r.title} ${r.names}`, text: r.t.tapToOpen, url }).catch(() => {})}>
              <Share2 className="size-4" aria-hidden /> Share
            </button>
          )}
          <a className="btn btn-ghost h-10 px-4 text-[14px]" href={url} target="_blank" rel="noopener">
            <ExternalLink className="size-4" aria-hidden /> Open
          </a>
        </div>
      </div>
      <QrCode url={url} name={slug} />
      {editUrl && (
        <div className="rounded-2xl border border-gold/45 bg-gold/12 p-4">
          <p className="text-[14.5px] font-medium">Keep your private edit link</p>
          <p className="mt-1 mb-3 text-[13px] leading-snug text-muted">
            It&apos;s saved on this device. To edit from another phone or after clearing your browser, you&apos;ll need this link. Don&apos;t share it with guests.
          </p>
          <CopyField value={editUrl} label="Copy private edit link" />
          <a className="mt-2 inline-block text-[13px] text-brand underline underline-offset-4" href={`https://wa.me/?text=${encodeURIComponent(`My DWM Invite edit link (keep private): ${editUrl}`)}`} target="_blank" rel="noopener noreferrer">
            Send it to myself on WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

type State = { step: "form" } | { step: "saving" } | { step: "done"; slug: string; token: string };

export function PublishDialog({ data, onClose, onPublished, onFix }: { data: InviteData; onClose: () => void; onPublished: (slug: string, token: string) => void; onFix: (panel: string) => void }) {
  const r = resolve(data);
  const [slug, setSlug] = useState(() => suggestSlug(r.people.map((p) => p.name)) || "");
  const [result, setResult] = useState<{ slug: string; available: boolean } | null>(null);
  const [state, setState] = useState<State>({ step: "form" });
  const [error, setError] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const check = !slug ? "idle" : !validSlug(slug) ? "invalid" : result?.slug !== slug ? "checking" : result.available ? "free" : "taken";

  useEffect(() => {
    if (!slug || !validSlug(slug)) return;
    const ctrl = new AbortController();
    const t = window.setTimeout(() => {
      fetch(`/api/slug?slug=${encodeURIComponent(slug)}`, { signal: ctrl.signal })
        .then((res) => res.json())
        .then((j) => setResult({ slug, available: Boolean(j.available) }))
        .catch(() => {});
    }, 350);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [slug]);

  const samples = r.people.filter((p) => SAMPLE_NAMES.includes(p.name)).map((p) => p.name);
  const noNames = r.people.length === 0;
  const noDate = !data.events.some((e) => e.date);

  const publish = async () => {
    setError(null);
    setState({ step: "saving" });
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data, slug: slug && check !== "invalid" ? slug : undefined }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Couldn't publish. Please try again.");
      rememberInvite({ slug: j.slug, token: j.token, names: r.names, template: data.template, occasion: data.occasion, createdAt: Date.now() });
      setState({ step: "done", slug: j.slug, token: j.token });
      onPublished(j.slug, j.token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't publish. Please try again.");
      setState({ step: "form" });
    }
  };

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      className="m-auto w-[min(520px,calc(100vw-24px))] max-h-[calc(100dvh-24px)] overflow-y-auto rounded-[26px] bg-card p-0 text-ink shadow-[0_40px_100px_-30px_rgb(42_37_32/0.6)] backdrop:bg-[#2a2520]/45 backdrop:backdrop-blur-[2px]"
    >
      <div className="relative p-6 sm:p-7">
        <button type="button" onClick={() => dialog.current?.close()} className="absolute end-4 top-4 grid size-9 place-items-center rounded-full text-muted hover:bg-paper-2" aria-label="Close">
          <X className="size-5" />
        </button>

        {state.step === "done" ? (
          <>
            <p className="text-[12px] font-semibold tracking-[0.2em] text-gold-ink uppercase">Published</p>
            <h2 className="mt-2 mb-5 font-serif text-[28px] leading-tight">Your invitation is live</h2>
            <ShareCard data={data} slug={state.slug} token={state.token} />
          </>
        ) : (
          <>
            <p className="text-[12px] font-semibold tracking-[0.2em] text-gold-ink uppercase">Publish</p>
            <h2 className="mt-2 font-serif text-[28px] leading-tight">Choose your link</h2>
            <p className="mt-1.5 mb-5 text-[14px] text-muted">This is what guests open. You can keep editing after publishing.</p>

            <label className="label" htmlFor="slug">
              Link
            </label>
            <div className="flex items-center rounded-xl border border-line bg-paper focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/15">
              <span className="ps-3.5 text-[14px] text-muted select-none">{HOST}/</span>
              <input
                id="slug"
                className="min-w-0 flex-1 bg-transparent py-2.5 pe-3 text-[15px] outline-none"
                value={slug}
                placeholder="zara-and-ibrahim"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                maxLength={48}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-"))}
              />
            </div>
            <p className={`mt-1.5 min-h-5 text-[13px] ${check === "free" ? "text-brand" : check === "idle" || check === "checking" ? "text-muted" : "text-wax"}`}>
              {check === "free" && "✓ Available"}
              {check === "taken" && "Already taken. Try adding a year or a word."}
              {check === "invalid" && "Use 3–48 letters, numbers and dashes."}
              {check === "checking" && "Checking…"}
              {check === "idle" && "Leave empty and we'll make one for you."}
            </p>

            {(samples.length > 0 || noNames || noDate) && (
              <div className="mt-4 space-y-2 rounded-2xl border border-wax/25 bg-wax/5 p-4 text-[14px]">
                {samples.length > 0 && (
                  <p>
                    The sample {samples.length > 1 ? "names" : "name"} <strong>{samples.join(" & ")}</strong> {samples.length > 1 ? "are" : "is"} still on the card.{" "}
                    <button type="button" className="text-brand underline underline-offset-4" onClick={() => onFix("people")}>
                      Change {samples.length > 1 ? "them" : "it"}
                    </button>
                  </p>
                )}
                {noNames && <p>Add at least one name first.</p>}
                {noDate && (
                  <p>
                    Add a date.{" "}
                    <button type="button" className="text-brand underline underline-offset-4" onClick={() => onFix("events")}>
                      Add it
                    </button>
                  </p>
                )}
              </div>
            )}

            {error && <p className="mt-4 rounded-xl bg-wax/10 px-3.5 py-2.5 text-[14px] text-wax">{error}</p>}

            <button
              type="button"
              className="btn btn-primary mt-6 h-12 w-full text-[16px]"
              disabled={state.step === "saving" || noNames || noDate || check === "taken" || check === "checking" || check === "invalid"}
              onClick={publish}
            >
              {state.step === "saving" ? "Publishing…" : samples.length ? "Publish anyway" : "Publish invitation"}
            </button>
            <p className="mt-3 text-center text-[12.5px] text-muted">Anyone with the link can see it. It isn&apos;t listed anywhere or shown in search results.</p>
          </>
        )}
      </div>
    </dialog>
  );
}

export function ShareDialog({ data, slug, token, onClose }: { data: InviteData; slug: string; token?: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      className="m-auto w-[min(520px,calc(100vw-24px))] max-h-[calc(100dvh-24px)] overflow-y-auto rounded-[26px] bg-card p-0 text-ink shadow-[0_40px_100px_-30px_rgb(42_37_32/0.6)] backdrop:bg-[#2a2520]/45"
    >
      <div className="relative p-6 sm:p-7">
        <button type="button" onClick={() => dialog.current?.close()} className="absolute end-4 top-4 grid size-9 place-items-center rounded-full text-muted hover:bg-paper-2" aria-label="Close">
          <X className="size-5" />
        </button>
        <h2 className="mb-5 font-serif text-[28px] leading-tight">Share your invitation</h2>
        <ShareCard data={data} slug={slug} token={token} />
      </div>
    </dialog>
  );
}
