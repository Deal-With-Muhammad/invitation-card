"use client";

import { Button, InputGroup, Label, Modal, TextField, buttonVariants } from "@heroui/react";
import { Check, Copy, ExternalLink, Share2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { SAMPLE_NAMES } from "@/invite/defaults";
import { resolve } from "@/invite/resolve";
import type { InviteData } from "@/invite/types";
import { suggestSlug, validSlug } from "@/lib/slug";

import { QrCode } from "./qr";
import { groupLabel } from "./fields";
import { rememberInvite } from "./storage";
import { VISIT_LIMIT, visitsLeft } from "./visits";

const HOST = "invite.dealwithmuhammad.com";

export const origin = () => (typeof window === "undefined" ? `https://${HOST}` : window.location.origin);

function CopyField({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-paper p-1.5 ps-3">
      <span className="min-w-0 flex-1 truncate text-[14px]" title={value}>
        {value.replace(/^https?:\/\//, "")}
      </span>
      <Button
        size="sm"
        aria-label={label}
        onPress={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setDone(true);
            window.setTimeout(() => setDone(false), 1600);
          } catch {}
        }}
      >
        {done ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        {done ? "Copied" : "Copy"}
      </Button>
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
        <p className={groupLabel}>Your invitation link</p>
        <CopyField value={url} label="Copy invitation link" />
        <div className="mt-3 flex flex-wrap gap-2">
          <a className={buttonVariants({ className: "h-10 bg-[#1f7a4d] px-4 text-[14px] text-white hover:bg-[#17663f]" })} href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.1 1.3Z" />
            </svg>
            Send on WhatsApp
          </a>
          {canShare && (
            <Button variant="outline" className="h-10 px-4 text-[14px]" onPress={() => navigator.share({ title: `${r.title} ${r.names}`, text: r.t.tapToOpen, url }).catch(() => {})}>
              <Share2 className="size-4" aria-hidden /> Share
            </Button>
          )}
          <a className={buttonVariants({ variant: "outline", className: "h-10 px-4 text-[14px]" })} href={url} target="_blank" rel="noopener">
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

type State = { step: "form" } | { step: "saving" } | { step: "done"; slug: string; token: string; saved: boolean; maxViews: number };

export function PublishDialog({ data, onClose, onPublished, onFix }: { data: InviteData; onClose: () => void; onPublished: (slug: string, token: string) => void; onFix: (panel: string) => void }) {
  const r = resolve(data);
  const [slug, setSlug] = useState(() => suggestSlug(r.people.map((p) => p.name)) || "");
  const [result, setResult] = useState<{ slug: string; available: boolean } | null>(null);
  const [state, setState] = useState<State>({ step: "form" });
  const [error, setError] = useState<string | null>(null);

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
      setState({ step: "done", slug: j.slug, token: j.token, saved: Boolean(j.saved), maxViews: j.maxViews ?? VISIT_LIMIT });
      onPublished(j.slug, j.token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't publish. Please try again.");
      setState({ step: "form" });
    }
  };

  return (
    <Sheet label={state.step === "done" ? "Your invitation is live" : "Choose your link"} onClose={onClose}>
      {state.step === "done" ? (
        <>
          <p className="text-[12px] font-semibold tracking-[0.2em] text-gold-ink uppercase">Published</p>
          <Modal.Heading className="mt-2 font-serif text-[28px] leading-tight font-medium">Your invitation is live</Modal.Heading>
          <p className="mt-1.5 mb-5 text-[14px] text-muted">
            {visitsLeft(0, state.maxViews)}. Every time the link is opened counts as one visit, including yours.{" "}
            {state.saved ? "It's saved to your account." : (
              <>
                Made as a guest, so it&apos;s kept on this device.{" "}
                <Link href="/login?next=/my" className="text-brand underline underline-offset-4">Sign in</Link> to save it to an account.
              </>
            )}
          </p>
          <ShareCard data={data} slug={state.slug} token={state.token} />
        </>
      ) : (
        <>
          <p className="text-[12px] font-semibold tracking-[0.2em] text-gold-ink uppercase">Publish</p>
          <Modal.Heading className="mt-2 font-serif text-[28px] leading-tight font-medium">Choose your link</Modal.Heading>
          <p className="mt-1.5 mb-5 text-[14px] text-muted">This is what guests open. You can keep editing after publishing.</p>

          <TextField value={slug} maxLength={48} onChange={(v) => setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-"))}>
            <Label>Link</Label>
            <InputGroup className="w-full bg-paper">
              <InputGroup.Prefix className="border-e-0 ps-3.5 pe-0 text-[15px] text-muted select-none sm:text-[14px]">{HOST}/</InputGroup.Prefix>
              <InputGroup.Input placeholder="zara-and-ibrahim" autoCapitalize="none" autoCorrect="off" spellCheck={false} className="min-w-0 py-2.5 ps-0 pe-3" />
            </InputGroup>
          </TextField>
          <p aria-live="polite" className={`mt-1.5 min-h-5 text-[13px] ${check === "free" ? "text-brand" : check === "idle" || check === "checking" ? "text-muted" : "text-wax"}`}>
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

          <Button
            size="lg"
            fullWidth
            className="mt-6"
            isDisabled={state.step === "saving" || noNames || noDate || check === "taken" || check === "checking" || check === "invalid"}
            onPress={publish}
          >
            {state.step === "saving" ? "Publishing…" : samples.length ? "Publish anyway" : "Publish invitation"}
          </Button>
          <p className="mt-3 text-center text-[12.5px] text-muted">
            Anyone with the link can see it, up to {VISIT_LIMIT} visits. It isn&apos;t listed anywhere or shown in search results.
          </p>
        </>
      )}
    </Sheet>
  );
}

export function ShareDialog({ data, slug, token, onClose }: { data: InviteData; slug: string; token?: string; onClose: () => void }) {
  return (
    <Sheet label="Share your invitation" onClose={onClose}>
      <Modal.Heading className="mb-5 font-serif text-[28px] leading-tight font-medium">Share your invitation</Modal.Heading>
      <ShareCard data={data} slug={slug} token={token} />
    </Sheet>
  );
}

/** The publish and share dialogs: a HeroUI modal, open while it's mounted. */
function Sheet({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  return (
    <Modal.Backdrop isOpen onOpenChange={(open) => !open && onClose()} className="dialog-backdrop bg-[#2a2520]/45 sm:backdrop-blur-[2px]">
      <Modal.Container placement="center" className="p-3 sm:p-6">
        <Modal.Dialog
          aria-label={label}
          className="relative max-h-full w-[min(520px,calc(100vw-24px))] max-w-none overflow-y-auto overscroll-contain rounded-[26px] bg-card p-6 text-ink shadow-[0_40px_100px_-30px_rgb(42_37_32/0.6)] sm:p-7"
        >
          <Button isIconOnly variant="ghost" onPress={onClose} className="absolute end-4 top-4 z-10 size-9 rounded-full text-muted" aria-label="Close">
            <X className="size-5" aria-hidden />
          </Button>
          {children}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
