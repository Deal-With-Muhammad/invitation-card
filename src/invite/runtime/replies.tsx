"use client";

import { useEffect, useState, type FormEvent } from "react";

import type { Lang } from "../types";
import { repliesCopy, type RepliesCopy } from "./replies-copy";

import "./replies.css";

// Guest replies, on premium designs when the host turns them on (show.rsvp, show.wishes):
// an RSVP (which functions, how many people) and a wall of wishes for the couple.
// Replies go to /api/invites/<slug>/rsvp and /wishes; the host reads them at
// /replies/<slug>. In the editor or a design preview there is no invitation yet, so the
// forms show what they'll do but don't send.

type Ev = { id: string; title: string };
type Wish = { id: number; name: string; message: string; createdAt: number };

const RESERVED = new Set(["preview", "create", "edit", "templates", "frame", "admin", "my", "dev", "replies"]);

/** The invitation's link name when this runs on a guest page (/<slug>), else null. */
function slugHere() {
  const seg = window.location.pathname.split("/").filter(Boolean);
  return seg.length === 1 && !RESERVED.has(seg[0]) ? seg[0] : null;
}

const store = {
  get(k: string) {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      window.localStorage.setItem(k, v);
    } catch {}
  },
};

async function send(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const out = (await res.json().catch(() => ({}))) as { error?: string; wish?: Wish };
  if (!res.ok) throw new Error(out.error || "Something went wrong. Please try again.");
  return out;
}

function useSlug() {
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the page's address, known only in the browser
    setSlug(slugHere());
  }, []);
  return slug;
}

export function RsvpForm({ events, lang }: { events: Ev[]; lang: Lang }) {
  const slug = useSlug();
  const t = repliesCopy(lang);
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const [guests, setGuests] = useState(1);
  const [chosen, setChosen] = useState<string[]>(() => events.map((e) => e.id));
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads whether this device already replied
    if (slug && store.get(`rp-rsvp:${slug}`)) setState("sent");
  }, [slug]);

  const toggle = (id: string) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError(t.needName);
    if (!attending) return setError(t.needAnswer);
    if (attending === "yes" && events.length > 1 && !chosen.length) return setError(t.needEvents);
    if (!slug) return setError(t.notYet);
    setState("sending");
    try {
      await send(`/api/invites/${slug}/rsvp`, { name, attending, guests, events: chosen, phone, note });
      store.set(`rp-rsvp:${slug}`, "1");
      setState("sent");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  };

  if (state === "sent")
    return (
      <div className="rp-card rp-thanks rv">
        <p className="rp-script">{t.thanksTitle}</p>
        <p>{t.thanks}</p>
        <button type="button" className="rp-link" onClick={() => setState("idle")}>
          {t.again}
        </button>
      </div>
    );

  return (
    <form className="rp-card rp-form rv" onSubmit={submit} noValidate>
      <label className="rp-field">
        <span>{t.name}</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" placeholder={t.namePh} />
      </label>
      <div className="rp-choice" role="radiogroup" aria-label={t.rsvpTitle}>
        <button type="button" role="radio" aria-checked={attending === "yes"} className={attending === "yes" ? "is-on" : ""} onClick={() => setAttending("yes")}>
          {t.yes}
        </button>
        <button type="button" role="radio" aria-checked={attending === "no"} className={attending === "no" ? "is-on" : ""} onClick={() => setAttending("no")}>
          {t.no}
        </button>
      </div>
      {attending === "yes" && (
        <>
          {events.length > 1 && (
            <fieldset className="rp-fns">
              <legend>{t.which}</legend>
              <div>
                {events.map((e) => (
                  <button key={e.id} type="button" aria-pressed={chosen.includes(e.id)} className={`rp-pill${chosen.includes(e.id) ? " is-on" : ""}`} onClick={() => toggle(e.id)}>
                    {e.title}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <div className="rp-field rp-count">
            <span>{t.howMany}</span>
            <div>
              <button type="button" aria-label={t.fewer} onClick={() => setGuests((g) => Math.max(1, g - 1))}>
                −
              </button>
              <output aria-live="polite">{guests}</output>
              <button type="button" aria-label={t.more} onClick={() => setGuests((g) => Math.min(30, g + 1))}>
                +
              </button>
            </div>
          </div>
        </>
      )}
      <label className="rp-field">
        <span>{t.phone}</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} inputMode="tel" autoComplete="tel" placeholder={t.phonePh} />
      </label>
      <label className="rp-field">
        <span>{t.note}</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} rows={2} />
      </label>
      {error && (
        <p className="rp-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="rp-btn rp-submit" disabled={state === "sending"}>
        {state === "sending" ? t.sending : t.send}
      </button>
    </form>
  );
}

const ago = (t: number, c: RepliesCopy) => {
  const d = Math.max(0, Date.now() - t) / 60000;
  if (d < 1) return c.justNow;
  if (d < 60) return `${Math.floor(d)} min ago`;
  if (d < 1440) return `${Math.floor(d / 60)} h ago`;
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

export function WishesWall({ lang }: { lang: Lang }) {
  const slug = useSlug();
  const t = repliesCopy(lang);
  const [list, setList] = useState<Wish[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/invites/${slug}/wishes`)
      .then((r) => (r.ok ? r.json() : { wishes: [] }))
      .then((d: { wishes?: Wish[] }) => setList(d.wishes ?? []))
      .catch(() => {});
  }, [slug]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError(t.needName);
    if (message.trim().length < 2) return setError(t.needWords);
    if (!slug) return setError(t.notYet);
    setState("sending");
    try {
      const out = await send(`/api/invites/${slug}/wishes`, { name, message });
      if (out.wish) setList((l) => [out.wish!, ...l]);
      setMessage("");
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    }
    setState("idle");
  };

  const shown = list.slice(0, 12);
  return (
    <div className="rp-wishes rv">
      {open ? (
        <form className="rp-card rp-form" onSubmit={submit} noValidate>
          <label className="rp-field">
            <span>{t.name}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" />
          </label>
          <label className="rp-field">
            <span>{t.wish}</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={400} rows={3} placeholder={t.wishPh} />
          </label>
          {error && (
            <p className="rp-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="rp-btn rp-submit" disabled={state === "sending"}>
            {state === "sending" ? t.sending : t.post}
          </button>
        </form>
      ) : (
        <button type="button" className="rp-btn" onClick={() => setOpen(true)}>
          {t.write}
        </button>
      )}
      {shown.length > 0 ? (
        <ul className="rp-wall">
          {shown.map((w) => (
            <li key={w.id} className="rp-wish">
              <p>{w.message}</p>
              <span>
                {w.name} · {ago(w.createdAt, t)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rp-empty">{t.first}</p>
      )}
    </div>
  );
}
