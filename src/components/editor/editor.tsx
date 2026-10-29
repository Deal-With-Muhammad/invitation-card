"use client";

import { BookOpenText, CalendarDays, Eye, Globe, Languages, Moon, Music, Palette, PartyPopper, Play, RotateCcw, Shapes, Sparkles, Users, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { newInvite } from "@/invite/defaults";
import { FONT_VARS } from "@/invite/fonts";
import { copyFor } from "@/invite/i18n";
import { resolve } from "@/invite/resolve";
import { getTemplate } from "@/invite/templates";
import type { InviteData, Lang, Occasion } from "@/invite/types";
import { LogoMark } from "@/components/logo";
import { OCCASION_LABEL } from "@/lib/filters";

import { Panel } from "./fields";
import { DesignPicker, EventsPanel, ExtrasPanel, FaithPanel, LanguagePanel, LookPanel, MotionPanel, OccasionPanel, PeoplePanel, WordsPanel, type Set } from "./panels";
import { Phone, PreviewFrame } from "./preview";
import { PublishDialog, ShareDialog } from "./publish";
import { clearDraft, forgetInvite, loadDraft, saveDraft } from "./storage";

type Props =
  | { mode: "create"; template: string; occasion?: Occasion; palette?: string; lang?: Lang }
  | { mode: "edit"; slug: string; token: string; initial: InviteData; views: number };

// Which part of the invitation each panel edits, so the preview can jump there.
const FOCUS: Record<string, string> = {
  occasion: "hero",
  design: "hero",
  people: "invite",
  events: "events",
  words: "invite",
  look: "hero",
  faith: "hero",
  extras: "countdown",
  motion: "hero",
  language: "hero",
};

function useStartingData(props: Props) {
  const [data, setData] = useState<InviteData>(() => {
    if (props.mode === "edit") return props.initial;
    const tpl = getTemplate(props.template).meta;
    const occasion = props.occasion && tpl.occasions.includes(props.occasion) ? props.occasion : tpl.defaultOccasion;
    return newInvite(tpl.id, occasion, props.palette ?? tpl.palettes[0].id, props.lang);
  });
  const [restored, setRestored] = useState(false);

  // A draft from an earlier visit keeps its details but takes the design picked now.
  useEffect(() => {
    if (props.mode !== "create") return;
    const draft = loadDraft();
    if (!draft) return;
    const tpl = getTemplate(props.template).meta;
    const sameDesign = draft.data.template === tpl.id;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
    setData({
      ...draft.data,
      template: tpl.id,
      look: sameDesign ? draft.data.look : { ...draft.data.look, palette: props.palette ?? tpl.palettes[0].id, colors: null, namesFont: "" },
    });
    setRestored(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, setData, restored, setRestored };
}

export function Editor(props: Props) {
  const router = useRouter();
  const { data, setData, restored, setRestored } = useStartingData(props);
  const [open, setOpen] = useState<string>(props.mode === "edit" ? "events" : "people");
  const [command, setCommand] = useState<{ kind: "replay" | "focus"; section?: string; n: number } | null>(null);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [published, setPublished] = useState<{ slug: string; token: string } | null>(props.mode === "edit" ? { slug: props.slug, token: props.token } : null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const n = useRef(0);

  const set: Set = useCallback(
    (fn) => {
      setData((d) => fn(d));
      setDirty(true);
    },
    [setData],
  );

  // Keep the draft on this device while creating.
  useEffect(() => {
    if (props.mode !== "create" || !dirty || published) return;
    const t = window.setTimeout(() => saveDraft(data), 400);
    return () => window.clearTimeout(t);
  }, [data, dirty, props.mode, published]);

  // Warn before leaving with unsaved edits to a published invitation.
  useEffect(() => {
    if (!(published && dirty)) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [published, dirty]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const toggle = (id: string) => {
    setOpen((o) => (o === id ? "" : id));
    if (open !== id && FOCUS[id]) setCommand({ kind: "focus", section: FOCUS[id], n: ++n.current });
  };
  const replay = () => setCommand({ kind: "replay", n: ++n.current });

  const save = async () => {
    if (!published) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/invites/${published.slug}`, {
        method: "PUT",
        headers: { "content-type": "application/json", "x-edit-token": published.token },
        body: JSON.stringify({ data }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Couldn't save.");
      setDirty(false);
      setToast("Saved. Guests see the changes now.");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  };

  const startOver = () => {
    if (!window.confirm("Start again with the sample details? Your changes on this device will be cleared.")) return;
    const tpl = getTemplate(data.template).meta;
    clearDraft();
    setData(newInvite(tpl.id, data.occasion, data.look.palette === "custom" ? tpl.palettes[0].id : data.look.palette, data.lang));
    setDirty(false);
    setRestored(false);
  };

  const remove = async () => {
    if (!published || !window.confirm("Delete this invitation? The link will stop working for everyone. This can't be undone.")) return;
    const res = await fetch(`/api/invites/${published.slug}`, { method: "DELETE", headers: { "x-edit-token": published.token } });
    if (res.ok) {
      forgetInvite(published.slug);
      router.push("/my");
    } else setToast("Couldn't delete it. Please try again.");
  };

  const r = useMemo(() => resolve(data), [data]);
  const meta = getTemplate(data.template).meta;
  const c = copyFor(data.lang);
  const hasTwo = r.people.length > 1;

  const panels: { id: string; icon: ReactNode; title: string; hint: string; body: ReactNode }[] = [
    { id: "occasion", icon: <PartyPopper className="size-4.5" />, title: "Occasion", hint: OCCASION_LABEL[data.occasion], body: <OccasionPanel data={data} set={set} /> },
    { id: "people", icon: <Users className="size-4.5" />, title: hasTwo ? "Names & families" : "Name & hosts", hint: r.names || "Add names", body: <PeoplePanel data={data} set={set} /> },
    {
      id: "events",
      icon: <CalendarDays className="size-4.5" />,
      title: "Date, time & place",
      hint: data.events.length > 1 ? `${data.events.length} days · ${r.when.date}` : [r.when.date, r.main?.venue].filter(Boolean).join(" · "),
      body: <EventsPanel data={data} set={set} />,
    },
    { id: "words", icon: <BookOpenText className="size-4.5" />, title: "Wording", hint: "Title, invitation line, message", body: <WordsPanel data={data} set={set} /> },
    { id: "design", icon: <Shapes className="size-4.5" />, title: "Design", hint: meta.name, body: <DesignPicker data={data} set={set} /> },
    { id: "look", icon: <Palette className="size-4.5" />, title: "Colours & fonts", hint: data.look.palette === "custom" ? "Your own colours" : meta.palettes.find((p) => p.id === data.look.palette)?.name ?? "", body: <LookPanel data={data} set={set} /> },
    { id: "faith", icon: <Moon className="size-4.5" />, title: "Bismillah, salam & dua", hint: data.bismillah !== "none" || data.salam ? "On" : "Off", body: <FaithPanel data={data} set={set} /> },
    { id: "extras", icon: <Sparkles className="size-4.5" />, title: "Sections", hint: "Countdown, map, programme, dress code, contacts", body: <ExtrasPanel data={data} set={set} /> },
    { id: "motion", icon: <Music className="size-4.5" />, title: "Music & auto-scroll", hint: [data.music.on ? "Music on" : "No music", data.autoScroll.on ? "auto-scroll" : ""].filter(Boolean).join(", "), body: <MotionPanel data={data} set={set} /> },
    { id: "language", icon: <Languages className="size-4.5" />, title: "Language", hint: `${c.meta.native}${data.langs.length > 1 ? ` + ${data.langs.length - 1} more` : ""}`, body: <LanguagePanel data={data} set={set} /> },
  ];

  const primary =
    published ? (
      <button type="button" className="btn btn-primary h-10 px-4 text-[14.5px]" disabled={saving || !dirty} onClick={save}>
        {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
      </button>
    ) : (
      <button type="button" className="btn btn-primary h-10 px-4 text-[14.5px]" onClick={() => setPublishing(true)}>
        Publish
      </button>
    );

  return (
    <div className={`flex h-dvh flex-col bg-paper ${FONT_VARS}`}>
      <header className="flex h-16 flex-none items-center gap-3 border-b border-line bg-card/80 px-3 sm:px-4">
        <Link href="/templates" className="flex items-center gap-2 rounded-lg" aria-label="Back to designs">
          <LogoMark className="size-8" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium">{published ? `/${published.slug}` : `${meta.name} invitation`}</p>
          <p className="truncate text-[12.5px] text-muted">
            {published
              ? props.mode === "edit"
                ? `Opened ${props.views} ${props.views === 1 ? "time" : "times"} · ${dirty ? "unsaved changes" : "all changes saved"}`
                : dirty ? "Unsaved changes" : "Published"
              : restored
                ? "Your details from last time are back"
                : "Changes show in the preview as you type"}
          </p>
        </div>
        {published && (
          <button type="button" className="btn btn-ghost hidden h-10 px-4 text-[14px] sm:inline-flex" onClick={() => setSharing(true)}>
            Share
          </button>
        )}
        <div className="hidden lg:block">{primary}</div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(380px,460px)_1fr]">
        <aside className="min-h-0 overflow-y-auto overscroll-contain px-3 pt-3 pb-28 sm:px-4 lg:pb-8">
          <div className="space-y-2.5">
            {panels.map((p) => (
              <Panel key={p.id} id={p.id} icon={p.icon} title={p.title} hint={p.hint} open={open === p.id} onToggle={toggle}>
                {p.body}
              </Panel>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-[13px] text-muted">
            {props.mode === "create" && !published && (
              <button type="button" className="inline-flex items-center gap-1.5 hover:text-ink" onClick={startOver}>
                <RotateCcw className="size-3.5" aria-hidden /> Start over with sample details
              </button>
            )}
            {published && (
              <>
                <button type="button" className="hover:text-ink sm:hidden" onClick={() => setSharing(true)}>
                  Share link
                </button>
                <button type="button" className="hover:text-wax" onClick={remove}>
                  Delete invitation
                </button>
              </>
            )}
            <Link href="/custom" className="hover:text-ink">
              Need a custom design?
            </Link>
          </div>
        </aside>

        <section className="relative hidden min-h-0 flex-col bg-paper-2/70 lg:flex" aria-label="Preview">
          <div className="flex flex-none items-center justify-center gap-2 pt-4">
            <button type="button" onClick={replay} className="btn btn-ghost h-9 px-3.5 text-[13.5px]">
              <Play className="size-3.5" aria-hidden /> Replay opening
            </button>
            {published && (
              <a href={`/${published.slug}`} target="_blank" rel="noopener" className="btn btn-ghost h-9 px-3.5 text-[13.5px]">
                <Globe className="size-3.5" aria-hidden /> Open live link
              </a>
            )}
          </div>
          <div className="min-h-0 flex-1 p-4">
            <Phone>
              <PreviewFrame data={data} command={command} className="h-full w-full border-0" />
            </Phone>
          </div>
        </section>
      </div>

      {/* phones: preview as a full-screen sheet */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-card/95 p-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <button type="button" className="btn btn-ghost h-12 flex-1 text-[15px]" onClick={() => setMobilePreview(true)}>
          <Eye className="size-4.5" aria-hidden /> Preview
        </button>
        <div className="flex-1 [&>button]:h-12 [&>button]:w-full [&>button]:text-[15px]">{primary}</div>
      </div>
      {mobilePreview && (
        <div className="fixed inset-0 z-40 bg-paper lg:hidden">
          <PreviewFrame data={data} command={command} className="h-full w-full border-0" />
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 p-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
            <button type="button" onClick={() => setMobilePreview(false)} className="btn h-11 bg-ink px-5 text-[14.5px] text-paper shadow-lg">
              <X className="size-4" aria-hidden /> Back to editing
            </button>
            <button type="button" onClick={replay} className="btn h-11 bg-card px-4 text-[14.5px] shadow-lg ring-1 ring-line">
              <Play className="size-4" aria-hidden /> Replay
            </button>
          </div>
        </div>
      )}

      {publishing && (
        <PublishDialog
          data={data}
          onClose={() => setPublishing(false)}
          onFix={(panel) => {
            setPublishing(false);
            setMobilePreview(false);
            setOpen(panel);
          }}
          onPublished={(slug, token) => {
            setPublished({ slug, token });
            setDirty(false);
            clearDraft();
          }}
        />
      )}
      {sharing && published && <ShareDialog data={data} slug={published.slug} token={published.token} onClose={() => setSharing(false)} />}

      {toast && (
        <div role="status" className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8">
          <p className="rounded-full bg-ink px-4 py-2.5 text-[14px] text-paper shadow-lg">{toast}</p>
        </div>
      )}
    </div>
  );
}
