"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Thumb } from "@/invite/runtime/thumb";
import { TEMPLATE_LIST } from "@/invite/templates";
import { trackFor } from "@/invite/music-tracks";
import type { InviteData } from "@/invite/types";
import { FILTERS } from "@/lib/filters";
import { isPremium } from "@/lib/groups";

import { PREMIUM_VISIT_LIMIT, VISIT_LIMIT } from "./visits";

// "Change design": every design in one sheet, drawn with the host's own names and date.
// One tap switches the invitation to that design and keeps every detail; the editor
// saves a published invitation straight away and offers Undo.

/** The invitation moved onto another design: its first colourway, its own music unless the
 *  host chose a track, and guest replies switched on when the new design is a premium one. */
export function withDesign(d: InviteData, id: string): InviteData {
  const t = TEMPLATE_LIST.find((x) => x.meta.id === id);
  if (!t || d.template === id) return d;
  const premium = isPremium(id);
  return {
    ...d,
    template: id,
    look: { ...d.look, palette: t.meta.palettes[0].id, colors: null, namesFont: "" },
    // The new design brings its own music, unless the host picked a track themselves.
    music: d.music.track === trackFor(d.template) ? { ...d.music, track: trackFor(id) } : d.music,
    show: premium ? { ...d.show, rsvp: d.show.rsvp ?? true, wishes: d.show.wishes ?? true } : d.show,
  };
}

const CHIPS = [{ id: "all", label: "All", occasions: [] as string[] }, { id: "premium", label: "Premium", occasions: [] as string[] }, ...FILTERS.filter((f) => f.id !== "all")];

/** Mounts its children only once the tile is near the screen: 60+ live thumbnails are heavy. */
function Lazy({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && setShow(true), { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [show]);
  return (
    <span ref={ref} className="block aspect-[9/16] bg-paper-2">
      {show && children}
    </span>
  );
}

export function DesignSwitcher({ data, onPick, onClose }: { data: InviteData; onPick: (id: string) => void; onClose: () => void }) {
  const [chip, setChip] = useState(isPremium(data.template) ? "premium" : "all");
  const f = CHIPS.find((c) => c.id === chip) ?? CHIPS[0];
  const shown = TEMPLATE_LIST.filter((t) => (f.id === "premium" ? isPremium(t.meta.id) : !f.occasions.length || t.meta.occasions.some((o) => f.occasions.includes(o))));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="switch-h" onClick={onClose}>
      <div className="flex h-[94dvh] w-full max-w-[1080px] flex-col overflow-hidden rounded-t-3xl bg-paper shadow-2xl sm:h-[88dvh] sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex flex-none items-start gap-3 px-4 pt-4 pb-3 sm:px-6 sm:pt-5">
          <div className="min-w-0 flex-1">
            <h2 id="switch-h" className="font-serif text-[24px] leading-tight sm:text-[28px]">
              Change design
            </h2>
            <p className="mt-0.5 text-[14px] text-muted">Tap any design to switch. Your names, dates, venues and wording all stay.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-10 flex-none place-items-center rounded-full bg-card ring-1 ring-line hover:bg-paper-2">
            <X className="size-4.5" aria-hidden />
          </button>
        </header>

        <div className="flex-none overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:px-6">
          <div className="flex w-max gap-2" role="tablist" aria-label="Kind of design">
            {CHIPS.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={chip === c.id}
                onClick={() => setChip(c.id)}
                className={`h-9 rounded-xl border px-3.5 text-[14px] whitespace-nowrap transition-colors ${chip === c.id ? "border-ink bg-ink text-paper" : "border-line bg-card text-muted hover:border-ink/30 hover:text-ink"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-line px-4 pt-4 pb-8 sm:px-6">
          <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {shown.map((t) => {
              const id = t.meta.id;
              const current = data.template === id;
              const premium = isPremium(id);
              return (
                <li key={id}>
                  <button type="button" onClick={() => onPick(id)} aria-pressed={current} aria-label={`${current ? "Current design" : "Switch to"} ${t.meta.name}`} className="group block w-full text-start">
                    <span className={`relative block overflow-hidden rounded-[14px] ring-1 transition-shadow ${current ? "ring-[3px] ring-brand" : "ring-line group-hover:ring-ink/30"}`}>
                      <Lazy>
                        <Thumb id={id} data={withDesign({ ...data, template: "" }, id)} />
                      </Lazy>
                      {current && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[12px] font-medium text-ivory">
                          <Check className="size-3.5" aria-hidden /> Current
                        </span>
                      )}
                      {premium && !current && <span className="absolute top-2 left-2 rounded-full bg-ink/75 px-2.5 py-1 text-[12px] font-medium text-paper">Premium</span>}
                    </span>
                    <span className="mt-2 block truncate text-[14.5px] font-medium">{t.meta.name}</span>
                    <span className="block truncate text-[12.5px] text-muted">{premium ? `RSVP & wishes · ${PREMIUM_VISIT_LIMIT} visits` : `${t.meta.filmed ? "Filmed opening · " : ""}${VISIT_LIMIT} visits`}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {shown.length === 0 && <p className="py-10 text-center text-muted">No designs for this occasion yet.</p>}
        </div>
      </div>
    </div>
  );
}
