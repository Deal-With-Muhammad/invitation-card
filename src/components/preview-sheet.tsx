"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { TEMPLATE_ORDER } from "@/lib/groups";
import { CATALOG } from "@/invite/templates/catalog";

// "Preview" anywhere on the site opens the real, live invitation in a sheet: full
// screen on a phone, a phone frame on desktop. Guests can type their own names, step
// to the next design, or start with this one — without leaving the page.

type Ctx = { open: (id: string) => void };
const PreviewCtx = createContext<Ctx>({ open: () => {} });

export const usePreview = () => useContext(PreviewCtx);

const ORDER = TEMPLATE_ORDER.map((id) => CATALOG.find((m) => m.id === id)).filter((m) => m !== undefined);

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<string | null>(null);
  const open = useCallback((next: string) => setId(next), []);
  const value = useMemo(() => ({ open }), [open]);
  return (
    <PreviewCtx.Provider value={value}>
      {children}
      {id && <Sheet id={id} onChange={setId} onClose={() => setId(null)} />}
    </PreviewCtx.Provider>
  );
}

/** A "Preview" button for a design. */
export function PreviewButton({ id, className = "", children }: { id: string; className?: string; children?: ReactNode }) {
  const { open } = usePreview();
  return (
    <button type="button" className={className} onClick={() => open(id)} aria-label={children ? undefined : "Preview"}>
      {children ?? (
        <>
          <svg viewBox="0 0 24 24" className="size-[1.05em]" aria-hidden>
            <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
          </svg>
          Preview
        </>
      )}
    </button>
  );
}

function Sheet({ id, onChange, onClose }: { id: string; onChange: (id: string) => void; onClose: () => void }) {
  const i = Math.max(0, ORDER.findIndex((m) => m.id === id));
  const meta = ORDER[i];
  const [names, setNames] = useState("");
  const [shown, setShown] = useState("");
  const [key, setKey] = useState(0);
  const touch = useRef<number | null>(null);

  // Wait until typing pauses before reloading the card with the new names.
  useEffect(() => {
    const t = window.setTimeout(() => setShown(names), 600);
    return () => window.clearTimeout(t);
  }, [names]);

  const step = useCallback((d: number) => onChange(ORDER[(i + d + ORDER.length) % ORDER.length].id), [i, onChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = before;
    };
  }, [onClose, step]);

  const list = shown
    .split(/\s*(?:&|,| and )\s*/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);
  const src = `/preview/${meta.id}${list.length ? `?names=${encodeURIComponent(list.join(","))}` : ""}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch justify-center bg-deep/80 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label={`${meta.name} preview`} onClick={onClose}>
      <div
        className="relative flex h-full w-full flex-col sm:h-[min(860px,94dvh)] sm:w-auto sm:flex-row sm:items-center sm:gap-10"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          touch.current = null;
          if (Math.abs(dx) > 70) step(dx < 0 ? 1 : -1);
        }}
      >
        {/* the card: full screen on a phone, a phone frame on desktop */}
        <div className="relative min-h-0 flex-1 overflow-hidden bg-paper sm:h-full sm:flex-none sm:aspect-[9/18.5] sm:rounded-[38px] sm:border-[9px] sm:border-[#1d1a17] sm:shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)]">
          <iframe key={`${src}:${key}`} src={src} title={`${meta.name}, live preview`} className="absolute inset-0 h-full w-full border-0" allow="autoplay" />
          <button type="button" onClick={onClose} className="absolute top-3 left-3 z-10 grid size-10 place-items-center rounded-full bg-black/45 text-[20px] text-white backdrop-blur sm:hidden" aria-label="Close preview">
            ×
          </button>
        </div>

        {/* details and actions */}
        <div className="flex-none bg-paper px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:w-[300px] sm:rounded-3xl sm:p-6">
          <div className="flex items-center justify-between gap-3 sm:block">
            <div className="min-w-0">
              <p className="truncate font-serif text-[22px] leading-tight sm:text-[30px]">{meta.name}</p>
              <p className="mt-0.5 truncate text-[13.5px] text-muted sm:mt-2 sm:whitespace-normal sm:text-[15px]">{meta.opening}</p>
            </div>
            <div className="flex flex-none gap-1.5 sm:mt-5">
              <button type="button" onClick={() => step(-1)} className="grid size-10 place-items-center rounded-full bg-paper-2 text-[18px] hover:bg-brand hover:text-ivory" aria-label="Previous design">
                ←
              </button>
              <button type="button" onClick={() => step(1)} className="grid size-10 place-items-center rounded-full bg-paper-2 text-[18px] hover:bg-brand hover:text-ivory" aria-label="Next design">
                →
              </button>
            </div>
          </div>
          <label className="mt-3 block sm:mt-6">
            <span className="mb-1 block text-[12.5px] text-muted">See it with your names</span>
            <input className="field h-10 py-0" value={names} maxLength={40} placeholder="Ayesha & Hamza" onChange={(e) => setNames(e.target.value)} />
          </label>
          <div className="mt-3 flex gap-2 sm:mt-6 sm:flex-col">
            <Link href={`/create/${meta.id}`} className="btn btn-primary h-11 flex-1 text-[15px]">
              Use this design
            </Link>
            <button type="button" onClick={() => setKey((k) => k + 1)} className="btn h-11 bg-paper-2 px-4 text-[15px] text-ink hover:bg-[#e4dac4]">
              Replay
            </button>
          </div>
          <Link href={`/templates/${meta.id}`} className="mt-4 hidden text-[14px] text-brand underline-offset-4 hover:underline sm:inline-block">
            Design details
          </Link>
          <button type="button" onClick={onClose} className="mt-2 hidden text-[14px] text-muted hover:text-ink sm:block">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
