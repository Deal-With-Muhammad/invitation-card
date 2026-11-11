"use client";

import { useEffect, useState, type FormEvent } from "react";

import type { ThemeId } from "./themes";

// Guest replies on a Shagun invitation: an RSVP (which functions, how many people)
// and wishes for the couple, shown on the card. Replies go to
// /api/invites/<slug>/rsvp and /wishes; in the editor or a design preview there is no
// invitation yet, so the forms show what they will do but don't send.

type Ev = { id: string; title: string; theme: ThemeId };
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

export function Replies({ events, names }: { events: Ev[]; names: string }) {
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the page's address, known only in the browser
    setSlug(slugHere());
  }, []);
  return (
    <>
      <Rsvp events={events} slug={slug} />
      <Wishes slug={slug} names={names} />
    </>
  );
}

function Rsvp({ events, slug }: { events: Ev[]; slug: string | null }) {
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
    if (slug && store.get(`sg-rsvp:${slug}`)) setState("sent");
  }, [slug]);

  const toggle = (id: string) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please write your name.");
    if (!attending) return setError("Please say whether you can come.");
    if (attending === "yes" && events.length > 1 && !chosen.length) return setError("Please choose the functions you'll attend.");
    if (!slug) return setError("Replies open once this invitation is shared.");
    setState("sending");
    try {
      await send(`/api/invites/${slug}/rsvp`, { name, attending, guests, events: chosen, phone, note });
      store.set(`sg-rsvp:${slug}`, "1");
      setState("sent");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  };

  if (state === "sent")
    return (
      <div className="sg-card sg-thanks rv">
        <p className="sg-script">Shukriya</p>
        <p>Your reply has reached the family. We can&apos;t wait to celebrate with you.</p>
        <button type="button" className="sg-link" onClick={() => setState("idle")}>
          Send another reply
        </button>
      </div>
    );

  return (
    <form className="sg-card sg-form rv" onSubmit={submit} noValidate>
      <p className="sg-kicker">Kindly reply</p>
      <h2 className="sg-h">Will you join us?</h2>
      <label className="sg-field">
        <span>Your name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" placeholder="Full name" />
      </label>
      <div className="sg-choice" role="radiogroup" aria-label="Will you attend?">
        <button type="button" role="radio" aria-checked={attending === "yes"} className={attending === "yes" ? "is-on" : ""} onClick={() => setAttending("yes")}>
          Joyfully accepts
        </button>
        <button type="button" role="radio" aria-checked={attending === "no"} className={attending === "no" ? "is-on" : ""} onClick={() => setAttending("no")}>
          Regretfully declines
        </button>
      </div>
      {attending === "yes" && (
        <>
          {events.length > 1 && (
            <fieldset className="sg-fns">
              <legend>Which functions?</legend>
              <div>
                {events.map((e) => (
                  <button key={e.id} type="button" aria-pressed={chosen.includes(e.id)} className={`sg-pill is-${e.theme}${chosen.includes(e.id) ? " is-on" : ""}`} onClick={() => toggle(e.id)}>
                    {e.title}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <div className="sg-field sg-count">
            <span>How many people, with you?</span>
            <div>
              <button type="button" aria-label="Fewer" onClick={() => setGuests((g) => Math.max(1, g - 1))}>
                −
              </button>
              <output aria-live="polite">{guests}</output>
              <button type="button" aria-label="More" onClick={() => setGuests((g) => Math.min(30, g + 1))}>
                +
              </button>
            </div>
          </div>
        </>
      )}
      <label className="sg-field">
        <span>Phone (optional)</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} inputMode="tel" autoComplete="tel" placeholder="So the family can reach you" />
      </label>
      <label className="sg-field">
        <span>A note (optional)</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} rows={2} />
      </label>
      {error && (
        <p className="sg-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="sg-btn sg-submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send reply"}
      </button>
    </form>
  );
}

const ago = (t: number) => {
  const d = Math.max(0, Date.now() - t) / 60000;
  if (d < 1) return "just now";
  if (d < 60) return `${Math.floor(d)} min ago`;
  if (d < 1440) return `${Math.floor(d / 60)} h ago`;
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

function Wishes({ slug, names }: { slug: string | null; names: string }) {
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
    if (!name.trim()) return setError("Please write your name.");
    if (message.trim().length < 2) return setError("Please write a few words.");
    if (!slug) return setError("Wishes open once this invitation is shared.");
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
    <div className="sg-wishes rv">
      <p className="sg-kicker">Duas &amp; wishes</p>
      <h2 className="sg-h">For {names}</h2>
      {open ? (
        <form className="sg-card sg-form" onSubmit={submit} noValidate>
          <label className="sg-field">
            <span>Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" />
          </label>
          <label className="sg-field">
            <span>Your wish</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={400} rows={3} placeholder="Mubarak ho! May Allah bless you both…" />
          </label>
          {error && (
            <p className="sg-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="sg-btn sg-submit" disabled={state === "sending"}>
            {state === "sending" ? "Sending…" : "Post my wish"}
          </button>
        </form>
      ) : (
        <button type="button" className="sg-btn" onClick={() => setOpen(true)}>
          Write a wish
        </button>
      )}
      {shown.length > 0 ? (
        <ul className="sg-wall">
          {shown.map((w) => (
            <li key={w.id} className="sg-wish">
              <p>{w.message}</p>
              <span>
                {w.name} · {ago(w.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="sg-empty">Be the first to send your duas.</p>
      )}
    </div>
  );
}
