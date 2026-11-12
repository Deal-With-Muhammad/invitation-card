"use client";

import { Button, buttonVariants } from "@heroui/react";
import { BookOpenText, CalendarDays, Eye, Globe, Image as ImageIcon, Languages, Moon, Music, Palette, PartyPopper, Play, RotateCcw, Shapes, Sparkles, Users, X } from "lucide-react";
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

import { DesignSwitcher, withDesign } from "./design-switcher";
import { Panel } from "./fields";
import { EventsPanel, ExtrasPanel, FaithPanel, LanguagePanel, LookPanel, MotionPanel, OccasionPanel, PeoplePanel, WordsPanel, type Set } from "./panels";
import { Thumb } from "@/invite/runtime/thumb";
import { PhotoPicker } from "./photo-picker";
import { Phone, PreviewFrame } from "./preview";
import { EditAccess, PublishDialog, ShareDialog } from "./publish";
import { clearDraft, forgetInvite, loadDraft, saveDraft } from "./storage";
import { visitLimitFor, visitsLeft } from "./visits";

type Props =
  | { mode: "create"; template: string; occasion?: Occasion; palette?: string; lang?: Lang }
  | { mode: "edit"; slug: string; token: string; initial: InviteData; views: number; maxViews: number; openEdit: boolean; canManage: boolean };

// Which part of the invitation each panel edits, so the preview can jump there.
const FOCUS: Record<string, string> = {
  occasion: "hero",
  design: "hero",
  photo: "hero",
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
  const [openEdit, setOpenEdit] = useState(props.mode === "edit" ? props.openEdit : false);
  const [changingAccess, setChangingAccess] = useState(false);
  // Someone editing through an open edit link can't delete it or close editing.
  const canManage = props.mode === "create" || props.canManage;
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // "Change design": the sheet, the allowance of the published invitation, and one step of undo.
  const [switching, setSwitching] = useState(false);
  const [maxViews, setMaxViews] = useState(props.mode === "edit" ? props.maxViews : 0);
  const [undo, setUndo] = useState<InviteData | null>(null);
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
    // The toast that offers Undo stays up longer.
    const t = window.setTimeout(() => {
      setToast(null);
      setUndo(null);
    }, undo ? 9000 : 2600);
    return () => window.clearTimeout(t);
  }, [toast, undo]);

  // /edit/<slug>?design=1 (the "Change design" link on My invitations) opens the sheet straight away.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("design") !== "1") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the address is only readable after mount
    setSwitching(true);
    history.replaceState(null, "", window.location.pathname);
  }, []);

  const toggle = (id: string) => {
    setOpen((o) => (o === id ? "" : id));
    if (open !== id && FOCUS[id]) setCommand({ kind: "focus", section: FOCUS[id], n: ++n.current });
  };
  const replay = () => setCommand({ kind: "replay", n: ++n.current });

  /** Saves the published invitation (the data given, or what's in the editor). */
  const save = async (next: InviteData = data, done = "Saved. Guests see the changes now.") => {
    if (!published) return false;
    setSaving(true);
    try {
      const res = await fetch(`/api/invites/${published.slug}`, {
        method: "PUT",
        headers: { "content-type": "application/json", "x-edit-token": published.token },
        body: JSON.stringify({ data: next }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Couldn't save.");
      if (typeof j.maxViews === "number") setMaxViews(j.maxViews);
      setDirty(false);
      setToast(done);
      return true;
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Couldn't save.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  /** One tap in the "Change design" sheet: every detail stays, the look changes. A published
   *  invitation is saved straight away, and the toast offers Undo. */
  const pickDesign = (id: string) => {
    setSwitching(false);
    if (id === data.template) return;
    const before = data;
    const next = withDesign(data, id);
    const name = getTemplate(id).meta.name;
    setData(next);
    setUndo(before);
    setCommand({ kind: "replay", n: ++n.current });
    if (published) void save(next, `Now on ${name}. Guests see it straight away.`);
    else {
      setDirty(true);
      setToast(`Now on ${name}.`);
    }
  };

  const undoDesign = () => {
    if (!undo) return;
    const back = undo;
    setUndo(null);
    setData(back);
    setCommand({ kind: "replay", n: ++n.current });
    if (published) void save(back, `Back on ${getTemplate(back.template).meta.name}.`);
    else setToast(`Back on ${getTemplate(back.template).meta.name}.`);
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

  const changeAccess = async (open: boolean) => {
    if (!published) return;
    setChangingAccess(true);
    try {
      const res = await fetch(`/api/invites/${published.slug}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-edit-token": published.token },
        body: JSON.stringify({ openEdit: open }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Couldn't change who can edit.");
      setOpenEdit(open);
      setToast(open ? "Anyone with the edit link can edit it now." : "Only you can edit it now.");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Couldn't change who can edit.");
    } finally {
      setChangingAccess(false);
    }
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
    ...(meta.photo
      ? [{ id: "photo", icon: <ImageIcon className="size-4.5" />, title: "Your photo", hint: data.photo ? "Added" : "Sample photo showing", body: <PhotoPicker data={data} set={set} sample={`/art/${meta.id}/portrait-720.webp`} /> }]
      : []),
    { id: "design", icon: <Shapes className="size-4.5" />, title: "Design", hint: meta.name, body: <CurrentDesign data={data} onChange={() => setSwitching(true)} /> },
    { id: "look", icon: <Palette className="size-4.5" />, title: "Colours & fonts", hint: data.look.palette === "custom" ? "Your own colours" : meta.palettes.find((p) => p.id === data.look.palette)?.name ?? "", body: <LookPanel data={data} set={set} /> },
    { id: "faith", icon: <Moon className="size-4.5" />, title: "Bismillah, salam & dua", hint: data.bismillah !== "none" || data.salam ? "On" : "Off", body: <FaithPanel data={data} set={set} /> },
    { id: "extras", icon: <Sparkles className="size-4.5" />, title: "Sections", hint: "Countdown, map, programme, dress code, contacts", body: <ExtrasPanel data={data} set={set} /> },
    { id: "motion", icon: <Music className="size-4.5" />, title: "Music & auto-scroll", hint: [data.music.on ? "Music on" : "No music", data.autoScroll.on ? "auto-scroll" : ""].filter(Boolean).join(", "), body: <MotionPanel data={data} set={set} /> },
    { id: "language", icon: <Languages className="size-4.5" />, title: "Language", hint: `${c.meta.native}${data.langs.length > 1 ? ` + ${data.langs.length - 1} more` : ""}`, body: <LanguagePanel data={data} set={set} /> },
  ];

  const primary =
    published ? (
      <Button className="h-10 px-4 text-[14.5px]" isDisabled={saving || !dirty} onPress={() => void save()}>
        {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
      </Button>
    ) : (
      <Button className="h-10 px-4 text-[14.5px]" onPress={() => setPublishing(true)}>
        Publish
      </Button>
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
                ? `${visitsLeft(props.views, maxViews)} · ${dirty ? "unsaved changes" : "all changes saved"}`
                : dirty ? "Unsaved changes" : `Published · ${visitsLeft(0, visitLimitFor(data.template))}`
              : restored
                ? "Your details from last time are back"
                : "Changes show in the preview as you type"}
          </p>
        </div>
        <Button variant="outline" className="h-10 flex-none px-3 text-[14px] sm:px-4" onPress={() => setSwitching(true)}>
          <Shapes className="size-4" aria-hidden /> <span className="max-[380px]:hidden">Change design</span>
          <span className="min-[381px]:hidden">Design</span>
        </Button>
        {published && (
          <Button variant="outline" className="hidden h-10 px-4 text-[14px] sm:inline-flex" onPress={() => setSharing(true)}>
            Share
          </Button>
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
          {published && canManage && (
            <div className="mt-6 rounded-2xl border border-line bg-card p-3.5">
              <p className="mb-2 text-[13px] font-medium text-muted">Who can edit</p>
              <EditAccess slug={published.slug} value={openEdit} onChange={changeAccess} disabled={changingAccess} />
            </div>
          )}
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
                {canManage && (
                  <button type="button" className="hover:text-wax" onClick={remove}>
                    Delete invitation
                  </button>
                )}
              </>
            )}
            <Link href="/custom" className="hover:text-ink">
              Need a custom design?
            </Link>
          </div>
        </aside>

        <section className="relative hidden min-h-0 flex-col overflow-clip bg-paper-2/70 lg:flex" aria-label="Preview">
          <div className="flex flex-none items-center justify-center gap-2 pt-4">
            <Button variant="outline" size="sm" onPress={replay}>
              <Play className="size-3.5" aria-hidden /> Replay opening
            </Button>
            {published && (
              <a href={`/${published.slug}`} target="_blank" rel="noopener" className={buttonVariants({ variant: "outline", size: "sm" })}>
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
        <Button variant="outline" className="h-12 flex-1 text-[15px]" onPress={() => setMobilePreview(true)}>
          <Eye className="size-4.5" aria-hidden /> Preview
        </Button>
        <div className="flex-1 [&>button]:h-12 [&>button]:w-full [&>button]:text-[15px]">{primary}</div>
      </div>
      {mobilePreview && (
        <div className="fixed inset-0 z-40 bg-paper lg:hidden">
          <PreviewFrame data={data} command={command} className="h-full w-full border-0" />
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 p-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
            <Button onPress={() => setMobilePreview(false)} className="h-11 bg-ink px-5 text-[14.5px] text-paper shadow-lg hover:bg-ink/90">
              <X className="size-4" aria-hidden /> Back to editing
            </Button>
            <Button variant="tertiary" onPress={replay} className="h-11 bg-card px-4 text-[14.5px] shadow-lg ring-1 ring-line hover:bg-card">
              <Play className="size-4" aria-hidden /> Replay
            </Button>
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
          onPublished={(slug, token, open) => {
            setPublished({ slug, token });
            setOpenEdit(open);
            setDirty(false);
            clearDraft();
          }}
        />
      )}
      {sharing && published && <ShareDialog data={data} slug={published.slug} token={published.token} onClose={() => setSharing(false)} />}

      {switching && <DesignSwitcher data={data} onPick={pickDesign} onClose={() => setSwitching(false)} />}

      {toast && (
        <div role="status" className="fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 lg:bottom-8">
          <p className="flex items-center gap-3 rounded-full bg-ink py-2.5 ps-4 pe-4 text-[14px] text-paper shadow-lg">
            {toast}
            {undo && (
              <button type="button" onClick={undoDesign} className="-me-1.5 rounded-full bg-paper/15 px-3 py-1 text-[13.5px] font-medium hover:bg-paper/25">
                Undo
              </button>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

/** The Design panel: the design in use, and the way into the "Change design" sheet. */
function CurrentDesign({ data, onChange }: { data: InviteData; onChange: () => void }) {
  const meta = getTemplate(data.template).meta;
  return (
    <div className="flex items-center gap-4">
      <span className="block w-[92px] flex-none overflow-hidden rounded-[12px] ring-1 ring-line">
        <Thumb id={meta.id} data={data} />
      </span>
      <div className="min-w-0">
        <p className="text-[16px] font-medium">{meta.name}</p>
        <p className="mt-0.5 text-[13.5px] leading-snug text-muted">{meta.tagline}</p>
        <Button variant="outline" className="mt-3 h-10 px-4 text-[14px]" onPress={onChange}>
          <Shapes className="size-4" aria-hidden /> Change design
        </Button>
        <p className="mt-2 text-[12.5px] text-muted">Your names, dates and wording stay when you switch.</p>
      </div>
    </div>
  );
}
