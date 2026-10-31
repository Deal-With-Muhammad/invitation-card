"use client";

import { Button, Input, Label, Modal, TextField, Tooltip, buttonVariants } from "@heroui/react";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { TEMPLATE_ORDER } from "@/lib/groups";
import { CATALOG } from "@/invite/templates/catalog";

// "Live preview" anywhere on the site opens the real, live invitation in a sheet: full
// screen on a phone, a phone frame on desktop. Guests can type their own names, step
// to the next design, or start with this one — without leaving the page.

type Ctx = { open: (id: string) => void };
const PreviewCtx = createContext<Ctx>({ open: () => {} });

export const usePreview = () => useContext(PreviewCtx);

const ORDER = TEMPLATE_ORDER.map((id) => CATALOG.find((m) => m.id === id)).filter((m) => m !== undefined);

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<string | null>(null);
  const [isOpen, setOpen] = useState(false);
  const open = useCallback((next: string) => {
    setId(next);
    setOpen(true);
  }, []);
  const value = useMemo(() => ({ open }), [open]);
  const meta = ORDER.find((m) => m.id === id) ?? ORDER[0];
  return (
    <PreviewCtx.Provider value={value}>
      {children}
      <Modal.Backdrop isOpen={isOpen} onOpenChange={setOpen} className="sheet-backdrop bg-deep/80 sm:backdrop-blur-sm">
        <Modal.Container size="full">
          <Modal.Dialog aria-label={`${meta.name} preview`} className="bg-paper p-0 sm:h-auto sm:min-h-0 sm:w-auto sm:overflow-visible sm:bg-transparent">
            {id && <Sheet id={id} onChange={setId} onClose={() => setOpen(false)} />}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </PreviewCtx.Provider>
  );
}

/** The small "Live preview" icon button on a design's tile. */
export function PreviewIconButton({ id, name, className = "" }: { id: string; name: string; className?: string }) {
  const { open } = usePreview();
  return (
    <Tooltip delay={350} closeDelay={0}>
      <Button
        isIconOnly
        size="sm"
        variant="tertiary"
        aria-label={`Live preview of ${name}`}
        onPress={() => open(id)}
        className={`size-8 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 ${className}`}
      >
        <Maximize2 className="size-3.5" strokeWidth={2.2} aria-hidden />
      </Button>
      <Tooltip.Content>Live preview</Tooltip.Content>
    </Tooltip>
  );
}

const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

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

  // Arrow keys step through the designs, except while typing (Escape is the modal's).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || typing(e.target)) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [step]);

  const list = shown
    .split(/\s*(?:&|,| and )\s*/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);
  const src = `/preview/${meta.id}${list.length ? `?names=${encodeURIComponent(list.join(","))}` : ""}`;

  return (
    <div
      className="relative flex h-full w-full flex-col sm:h-[min(860px,94dvh)] sm:w-auto sm:flex-row sm:items-center sm:gap-10"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 70) step(dx < 0 ? 1 : -1);
      }}
    >
      {/* the card: full screen on a phone, a phone frame on desktop */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-paper sm:aspect-[9/18.5] sm:h-full sm:flex-none sm:rounded-[38px] sm:border-[9px] sm:border-[#1d1a17] sm:shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)]">
        <iframe key={`${src}:${key}`} src={src} title={`${meta.name}, live preview`} className="absolute inset-0 h-full w-full border-0" allow="autoplay" />
        <Button
          isIconOnly
          variant="tertiary"
          onPress={onClose}
          className="absolute top-[max(12px,env(safe-area-inset-top))] left-3 z-10 size-10 rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/60 sm:hidden"
          aria-label="Close preview"
        >
          <X className="size-5" aria-hidden />
        </Button>
      </div>

      {/* details and actions */}
      <div className="flex-none bg-paper px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:w-[300px] sm:rounded-3xl sm:p-6">
        <div className="flex items-center justify-between gap-3 sm:block">
          <div className="min-w-0">
            <p className="truncate font-serif text-[22px] leading-tight sm:text-[30px]">{meta.name}</p>
            <p className="mt-0.5 truncate text-[13.5px] text-muted sm:mt-2 sm:whitespace-normal sm:text-[15px]">{meta.opening}</p>
          </div>
          <div className="flex flex-none gap-1.5 sm:mt-5">
            <Button isIconOnly variant="tertiary" onPress={() => step(-1)} className="rounded-full hover:bg-brand hover:text-ivory" aria-label="Previous design">
              <ArrowLeft className="size-[18px]" aria-hidden />
            </Button>
            <Button isIconOnly variant="tertiary" onPress={() => step(1)} className="rounded-full hover:bg-brand hover:text-ivory" aria-label="Next design">
              <ArrowRight className="size-[18px]" aria-hidden />
            </Button>
          </div>
        </div>
        <TextField className="mt-3 sm:mt-6" value={names} onChange={setNames} maxLength={40}>
          <Label className="text-[12.5px] font-normal">See it with your names</Label>
          <Input className="h-10 py-0" placeholder="Ayesha & Hamza" autoComplete="off" />
        </TextField>
        <div className="mt-3 flex gap-2 sm:mt-6 sm:flex-col">
          <Link href={`/create/${meta.id}`} className={buttonVariants({ className: "flex-1 sm:w-full sm:flex-none" })}>
            Use this design
          </Link>
          <Button variant="tertiary" onPress={() => setKey((k) => k + 1)} className="px-4 sm:w-full">
            Replay
          </Button>
        </div>
        <div className="mt-3 hidden items-center justify-between sm:flex">
          <Link href={`/templates/${meta.id}`} className="text-[14px] text-brand underline-offset-4 hover:underline">
            Design details
          </Link>
          <Button variant="ghost" size="sm" onPress={onClose} className="-me-2 px-2.5 text-[14px] text-muted hover:text-ink">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
