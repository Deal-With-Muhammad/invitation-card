"use client";

import { useState } from "react";

import { OCCASIONS } from "@/invite/types";
import { AUTHOR } from "@/lib/dwm";
import { OCCASION_LABEL } from "@/lib/filters";

/** Builds the request and opens it in WhatsApp or email. Nothing is sent from this page. */
export function CustomForm() {
  const [name, setName] = useState("");
  const [occasion, setOccasion] = useState("wedding");
  const [date, setDate] = useState("");
  const [idea, setIdea] = useState("");

  const message = [
    "Hi, I'd like a custom invitation from DWM Invite.",
    name && `Name: ${name}`,
    `Occasion: ${OCCASION_LABEL[occasion as keyof typeof OCCASION_LABEL]}`,
    date && `Date: ${date}`,
    idea && `What I have in mind: ${idea}`,
  ]
    .filter(Boolean)
    .join("\n");

  const ready = idea.trim().length > 3;

  return (
    <form className="space-y-4 rounded-[24px] border border-line bg-card p-5 sm:p-7" onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-name">
            Your name
          </label>
          <input id="c-name" className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="c-occ">
            Occasion
          </label>
          <select id="c-occ" className="field" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>
                {OCCASION_LABEL[o]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="c-date">
          Event date (if you know it)
        </label>
        <input id="c-date" type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="c-idea">
          What do you have in mind?
        </label>
        <textarea
          id="c-idea"
          className="field leading-relaxed"
          rows={5}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Colours, a theme, a monogram, a design you saw somewhere, how many functions…"
        />
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <a
          aria-disabled={!ready}
          className={`btn h-12 bg-[#1f7a4d] px-5 text-[15px] text-white hover:bg-[#17663f] ${ready ? "" : "pointer-events-none opacity-50"}`}
          href={`${AUTHOR.whatsapp}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Send on WhatsApp
        </a>
        <a
          aria-disabled={!ready}
          className={`btn btn-ghost h-12 px-5 text-[15px] ${ready ? "" : "pointer-events-none opacity-50"}`}
          href={`mailto:${AUTHOR.email}?subject=${encodeURIComponent("Custom invitation request")}&body=${encodeURIComponent(message)}`}
        >
          Send by email
        </a>
      </div>
      <p className="text-[12.5px] text-muted">This opens WhatsApp or your email app with the message ready. Nothing is sent until you press send there.</p>
    </form>
  );
}
