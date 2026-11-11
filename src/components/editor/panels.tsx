"use client";

import { Button, Checkbox, Input, Label, TextField } from "@heroui/react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { uid } from "@/invite/defaults";
import { NAME_FONTS } from "@/invite/fonts";
import { copyFor } from "@/invite/i18n";
import { paletteFor } from "@/invite/look";
import { defaultArabicPrayer, defaultPrayerText } from "@/invite/resolve";
import { Thumb } from "@/invite/runtime/thumb";
import { TEMPLATE_LIST, getTemplate } from "@/invite/templates";
import { trackFor } from "@/invite/music-tracks";
import { isPremium } from "@/lib/groups";
import { addDays } from "@/invite/time";
import { LANGS, OCCASIONS, type EventItem, type InviteData, type Lang, type Occasion } from "@/invite/types";
import { OCCASION_LABEL } from "@/lib/filters";

import { Area, ColorDot, Segmented, Select, Text, Toggle, groupLabel } from "./fields";
import { MusicPicker } from "./music-picker";

export type Set = (fn: (d: InviteData) => InviteData) => void;
type P = { data: InviteData; set: Set };

/** Small round icon buttons (move, remove). */
const iconBtn = "size-8 rounded-full text-muted hover:bg-card";

const TWO: Occasion[] = ["wedding", "nikah", "walima", "mehndi", "engagement", "reception", "anniversary", "housewarming"];

const EVENT_IDEAS: Partial<Record<Occasion, string[]>> = {
  wedding: ["Mehndi", "Dholki", "Mayun", "Nikah", "Baraat", "Walima", "Reception", "Akad Nikah", "Bersanding"],
  nikah: ["Nikah", "Rukhsati", "Walima", "Hi-tea"],
  walima: ["Walima", "Reception", "Dinner"],
  mehndi: ["Mehndi Night", "Dholki", "Mayun", "Ubtan"],
  engagement: ["Engagement", "Ring ceremony", "Mangni", "Dinner"],
  reception: ["Reception", "Dinner", "After party"],
  birthday: ["Birthday party", "Cake cutting", "Dinner"],
  aqiqah: ["Aqiqah", "Lunch", "Doa selamat"],
  babyshower: ["Baby shower", "High tea"],
  eid: ["Eid lunch", "Eid dinner", "Open house", "Iftar"],
  graduation: ["Graduation party", "Convocation", "Dinner"],
  housewarming: ["Housewarming", "Open house", "Dinner"],
  anniversary: ["Anniversary dinner", "Celebration"],
  party: ["Dinner party", "Celebration", "Get-together"],
};

/* ── occasion & design ── */

export function OccasionPanel({ data, set }: P) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {/* Eid is retired; it only shows for invitations that were made with it. */}
      {OCCASIONS.filter((o) => o !== "eid" || data.occasion === "eid").map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={data.occasion === o}
          onClick={() =>
            set((d) => {
              const people = [...d.people];
              if (TWO.includes(o) && people.length < 2) people.push({ name: "", full: "", relation: "daughter", parents: "" });
              if (!TWO.includes(o) && people.length > 1) people.length = 1;
              return { ...d, occasion: o, people, title: null, inviteLine: null, message: null, closing: null };
            })
          }
          className={`h-9 rounded-full border px-3.5 text-[14px] transition-colors ${
            data.occasion === o ? "border-brand bg-brand text-[#fbf8f2]" : "border-line bg-paper hover:border-ink/25"
          }`}
        >
          {OCCASION_LABEL[o]}
        </button>
      ))}
    </div>
  );
}

export function DesignPicker({ data, set }: P) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {TEMPLATE_LIST.map((t) => (
        <button
          key={t.meta.id}
          type="button"
          onClick={() =>
            set((d) => ({
              ...d,
              template: t.meta.id,
              look: { ...d.look, palette: t.meta.palettes[0].id, colors: null, namesFont: "" },
              // The new design brings its own music, unless the host picked a track themselves.
              music: d.music.track === trackFor(d.template) ? { ...d.music, track: trackFor(t.meta.id) } : d.music,
            }))
          }
          aria-pressed={data.template === t.meta.id}
          className={`group rounded-[14px] p-1 text-start transition-colors ${data.template === t.meta.id ? "bg-brand" : "hover:bg-paper-2"}`}
        >
          <span className="block overflow-hidden rounded-[11px] ring-1 ring-line">
            <Thumb id={t.meta.id} data={{ ...data, template: t.meta.id, look: { ...data.look, palette: t.meta.palettes[0].id, colors: null, namesFont: "" } }} />
          </span>
          <span className={`block truncate px-1 pt-1.5 pb-0.5 text-[12.5px] ${data.template === t.meta.id ? "text-[#fbf8f2]" : ""}`}>{t.meta.name}</span>
        </button>
      ))}
    </div>
  );
}

/* ── people ── */

export function PeoplePanel({ data, set }: P) {
  const two = data.people.length > 1;
  const setPerson = (i: number, patch: Partial<InviteData["people"][number]>) =>
    set((d) => ({ ...d, people: d.people.map((p, j) => (j === i ? { ...p, ...patch } : p)) }));
  return (
    <>
      {data.people.map((p, i) => (
        <div key={i} className="space-y-3 rounded-xl bg-paper p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-muted">{two ? (i === 0 ? "First person" : "Second person") : "Name on the card"}</p>
            {two && i === 1 && (
              <button
                type="button"
                className="text-[12.5px] text-muted hover:text-brand"
                onClick={() => set((d) => ({ ...d, people: [d.people[1], d.people[0]] }))}
              >
                Swap order
              </button>
            )}
          </div>
          <Text label="Name shown big" value={p.name} onChange={(v) => setPerson(i, { name: v })} placeholder="e.g. Zara" maxLength={40} />
          <Text label="Full name" value={p.full} onChange={(v) => setPerson(i, { full: v })} placeholder="e.g. Zara Malik" maxLength={80} hint="Used in the formal lines. Leave empty to use the name above." />
          <div className="grid grid-cols-[auto_1fr] gap-2.5">
            <Select
              label="Line"
              className="w-36"
              value={p.relation}
              onChange={(v) => setPerson(i, { relation: v as typeof p.relation })}
              options={[
                { value: "son", label: "Son of" },
                { value: "daughter", label: "Daughter of" },
                { value: "none", label: "Custom" },
              ]}
            />
            <Text label="Parents" value={p.parents} onChange={(v) => setPerson(i, { parents: v })} placeholder="Mr & Mrs Tariq Malik" maxLength={120} />
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        {!two ? (
          <Button variant="outline" size="sm" onPress={() => set((d) => ({ ...d, people: [...d.people, { name: "", full: "", relation: "none", parents: "" }] }))}>
            <Plus className="size-4" aria-hidden /> Add a second name
          </Button>
        ) : (
          <Button variant="outline" size="sm" onPress={() => set((d) => ({ ...d, people: d.people.slice(0, 1) }))}>
            Only one name
          </Button>
        )}
      </div>
      <Area
        label="Invited by (optional)"
        value={data.hosts}
        onChange={(v) => set((d) => ({ ...d, hosts: v }))}
        placeholder={"Mr & Mrs Tariq Malik\nMr & Mrs Faisal Siddiqui"}
        hint="One family or person per line. Shown before the invitation line."
        rows={2}
        maxLength={300}
      />
      <Text
        label="Big number or phrase (optional)"
        value={data.milestone}
        onChange={(v) => set((d) => ({ ...d, milestone: v }))}
        placeholder="7 · 25 years · Class of 2026"
        maxLength={30}
        hint="An age, years together or a class. Shown large on designs that have room for it."
      />
    </>
  );
}

/* ── days & venues ── */

const COMMON_ZONES = [
  "Asia/Kuala_Lumpur", "Asia/Singapore", "Asia/Jakarta", "Asia/Karachi", "Asia/Kolkata", "Asia/Dhaka", "Asia/Dubai",
  "Asia/Riyadh", "Asia/Qatar", "Asia/Tehran", "Europe/Istanbul", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "America/New_York", "America/Chicago", "America/Toronto", "America/Los_Angeles", "Australia/Sydney", "Africa/Cairo",
];

function zones(current: string) {
  let all: string[] = [];
  try {
    all = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone") ?? [];
  } catch {}
  const list = [...new Set([current, ...COMMON_ZONES, ...all])];
  return list.map((z) => ({ value: z, label: z.replace(/_/g, " ") }));
}

export function EventsPanel({ data, set }: P) {
  const ideas = EVENT_IDEAS[data.occasion] ?? [];
  const setEv = (i: number, patch: Partial<EventItem>) =>
    set((d) => ({ ...d, events: d.events.map((e, j) => (j === i ? { ...e, ...patch } : e)) }));
  const move = (i: number, by: number) =>
    set((d) => {
      const ev = [...d.events];
      const [x] = ev.splice(i, 1);
      ev.splice(i + by, 0, x);
      return { ...d, events: ev };
    });
  const many = data.events.length > 1;
  return (
    <>
      {data.events.map((e, i) => (
        <div key={e.id} className="space-y-3 rounded-xl bg-paper p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-medium text-muted">{many ? `Day ${i + 1}` : "The day"}</p>
            {many && (
              <span className="flex gap-1">
                <Button isIconOnly variant="ghost" size="sm" isDisabled={i === 0} onPress={() => move(i, -1)} className={iconBtn} aria-label="Move up">
                  <ArrowUp className="size-4" aria-hidden />
                </Button>
                <Button isIconOnly variant="ghost" size="sm" isDisabled={i === data.events.length - 1} onPress={() => move(i, 1)} className={iconBtn} aria-label="Move down">
                  <ArrowDown className="size-4" aria-hidden />
                </Button>
                <Button isIconOnly variant="ghost" size="sm" onPress={() => set((d) => ({ ...d, events: d.events.filter((_, j) => j !== i) }))} className={`${iconBtn} hover:text-wax`} aria-label="Remove this day">
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </span>
            )}
          </div>
          <Text label="What's happening" value={e.title} onChange={(v) => setEv(i, { title: v })} placeholder={copyFor(data.lang).occasions[data.occasion].event} maxLength={50} />
          {ideas.length > 0 && (
            <div className="-mt-1 flex flex-wrap gap-1.5">
              {ideas.map((t) => (
                <button key={t} type="button" onClick={() => setEv(i, { title: t })} className="rounded-full border border-line px-2.5 py-1 text-[12.5px] text-muted hover:border-ink/25 hover:text-ink">
                  {t}
                </button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1.3fr_1fr_1fr]">
            <Text label="Date" type="date" value={e.date} onChange={(v) => setEv(i, { date: v })} className="col-span-2 sm:col-span-1" inputClassName="px-2.5" />
            <Text label="Starts" type="time" value={e.start} onChange={(v) => setEv(i, { start: v })} inputClassName="min-w-0 px-2.5" />
            <Text label="Ends" type="time" value={e.end} onChange={(v) => setEv(i, { end: v })} inputClassName="min-w-0 px-2.5" />
          </div>
          <Text label="Venue" value={e.venue} onChange={(v) => setEv(i, { venue: v })} placeholder="The Grand Ballroom" maxLength={100} />
          <Area label="Address" value={e.address} onChange={(v) => setEv(i, { address: v })} placeholder="Street, city, postcode" rows={2} maxLength={240} />
          <Text
            label="Map link (optional)"
            value={e.mapUrl}
            onChange={(v) => setEv(i, { mapUrl: v.trim() })}
            placeholder="https://maps.app.goo.gl/…"
            inputMode="url"
            hint="Paste a Google Maps or Waze link for an exact pin. Otherwise the address is used."
          />
          <Text label="Note (optional)" value={e.note} onChange={(v) => setEv(i, { note: v })} placeholder="Ladies' entrance on the left" maxLength={200} />
        </div>
      ))}
      {data.events.length < 8 && (
        <Button
          variant="outline"
          fullWidth
          className="h-10 text-[14px]"
          onPress={() =>
            set((d) => {
              const last = d.events[d.events.length - 1];
              return { ...d, events: [...d.events, { ...last, id: uid(), title: "", date: last?.date ? addDays(last.date, 1) : last?.date ?? "", note: "" }] };
            })
          }
        >
          <Plus className="size-4" aria-hidden /> Add another day or function
        </Button>
      )}
      <Select label="Time zone" value={data.timeZone} onChange={(v) => set((d) => ({ ...d, timeZone: v }))} options={zones(data.timeZone)} hint="Where the event is. Guests abroad still see the times as written, and the countdown is exact." />
    </>
  );
}

/* ── wording ── */

export function WordsPanel({ data, set }: P) {
  const c = copyFor(data.lang);
  const occ = c.occasions[data.occasion];
  const hosts = data.hosts.trim().length > 0;
  const line = hosts ? occ.invite : occ.inviteSolo;
  const field = (key: "title" | "inviteLine" | "message" | "closing", label: string, def: string, rows: number, max: number) => (
    <Area
      label={label}
      value={data[key] ?? def}
      rows={rows}
      maxLength={max}
      onChange={(v) => set((d) => ({ ...d, [key]: v }))}
      onReset={data[key] != null && data[key] !== def ? () => set((d) => ({ ...d, [key]: null })) : null}
    />
  );
  return (
    <>
      <p className="text-[13px] leading-snug text-muted">
        This is the suggested wording in {c.meta.name}. Change anything; leave it as it is and guests who switch language see it translated.
      </p>
      {field("title", "Title on the first screen", occ.title, 1, 80)}
      {field("inviteLine", "Invitation line", line, 2, 240)}
      {field("message", "Message", occ.message, 4, 700)}
      {field("closing", "Closing line", occ.closing, 2, 200)}
    </>
  );
}

/* ── look ── */

export function LookPanel({ data, set }: P) {
  const meta = getTemplate(data.template).meta;
  const current = paletteFor(meta, data.look);
  const custom = data.look.palette === "custom";
  return (
    <>
      <div>
        <p className={groupLabel}>Colours</p>
        <div className="flex flex-wrap gap-2">
          {meta.palettes.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => set((d) => ({ ...d, look: { ...d.look, palette: p.id, colors: null } }))}
              aria-pressed={data.look.palette === p.id}
              className={`flex items-center gap-2 rounded-full border py-1 ps-1 pe-3 text-[13.5px] transition-colors ${data.look.palette === p.id ? "border-brand ring-2 ring-brand/20" : "border-line hover:border-ink/25"}`}
            >
              <span className="relative size-7 overflow-hidden rounded-full ring-1 ring-line" style={{ background: p.bg }}>
                <span className="absolute inset-y-0 end-0 w-1/2" style={{ background: p.accent }} />
              </span>
              {p.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => set((d) => ({ ...d, look: { ...d.look, palette: "custom", colors: d.look.colors ?? { bg: current.bg, ink: current.ink, accent: current.accent } } }))}
            aria-pressed={custom}
            className={`flex items-center gap-2 rounded-full border py-1 ps-1 pe-3 text-[13.5px] ${custom ? "border-brand ring-2 ring-brand/20" : "border-line hover:border-ink/25"}`}
          >
            <span className="size-7 rounded-full ring-1 ring-line" style={{ background: "conic-gradient(#c9a45c, #1d5c55, #a8452f, #e8b923, #c9a45c)" }} />
            Your own
          </button>
        </div>
      </div>
      {custom && data.look.colors && (
        <div className="flex gap-5 rounded-xl bg-paper p-3.5">
          {(["bg", "ink", "accent"] as const).map((k) => (
            <div key={k} className="grid justify-items-center gap-1.5">
              <ColorDot value={data.look.colors![k]} label={{ bg: "Background", ink: "Text", accent: "Accent" }[k]} onChange={(v) => set((d) => ({ ...d, look: { ...d.look, colors: { ...d.look.colors!, [k]: v } } }))} />
              <span className="text-[12px] text-muted">{{ bg: "Background", ink: "Text", accent: "Accent" }[k]}</span>
            </div>
          ))}
        </div>
      )}
      <div>
        <p className={groupLabel}>Font for the names</p>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => set((d) => ({ ...d, look: { ...d.look, namesFont: "" } }))}
            aria-pressed={!data.look.namesFont}
            className={`rounded-xl border px-3 py-2 text-start ${!data.look.namesFont ? "border-brand bg-brand/5" : "border-line hover:border-ink/25"}`}
          >
            <span className="block truncate text-[22px] leading-tight" style={{ fontFamily: `var(--f-${meta.fonts.names})` }}>
              {data.people[0]?.name || "Zara"}
            </span>
            <span className="text-[12px] text-muted">Design&apos;s own</span>
          </button>
          {NAME_FONTS.filter((f) => f.key !== meta.fonts.names).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => set((d) => ({ ...d, look: { ...d.look, namesFont: f.key } }))}
              aria-pressed={data.look.namesFont === f.key}
              className={`rounded-xl border px-3 py-2 text-start ${data.look.namesFont === f.key ? "border-brand bg-brand/5" : "border-line hover:border-ink/25"}`}
            >
              <span className="block truncate text-[22px] leading-tight" style={{ fontFamily: `var(--f-${f.key})` }}>
                {data.people[0]?.name || "Zara"}
              </span>
              <span className="text-[12px] text-muted">{f.label}</span>
            </button>
          ))}
        </div>
      </div>
      <Toggle label="Tap-to-open animation" hint={`${meta.opening}. Turn off to show the invitation straight away.`} checked={data.look.opening} onChange={(v) => set((d) => ({ ...d, look: { ...d.look, opening: v } }))} />
    </>
  );
}

/* ── faith ── */

export function FaithPanel({ data, set }: P) {
  const c = copyFor(data.lang);
  return (
    <>
      <Segmented
        label="Bismillah at the top"
        value={data.bismillah}
        onChange={(v) => set((d) => ({ ...d, bismillah: v }))}
        options={[
          { value: "none", label: "None" },
          { value: "calligraphy", label: "Calligraphy" },
          { value: "arabic", label: "Arabic text" },
        ]}
      />
      <Toggle label="Salam greeting" hint="السلام عليكم ورحمة الله before the families' names" checked={data.salam} onChange={(v) => set((d) => ({ ...d, salam: v }))} />
      <Toggle label="Hijri date" hint="Shown under each date" checked={data.show.hijri} onChange={(v) => set((d) => ({ ...d, show: { ...d.show, hijri: v } }))} />
      <Toggle label="A dua / prayer" checked={data.show.prayer} onChange={(v) => set((d) => ({ ...d, show: { ...d.show, prayer: v } }))} />
      {data.show.prayer && (
        <>
          <Area
            label="Arabic"
            value={data.prayer.arabic ?? defaultArabicPrayer(data.occasion)}
            onChange={(v) => set((d) => ({ ...d, prayer: { ...d.prayer, arabic: v } }))}
            onReset={data.prayer.arabic != null ? () => set((d) => ({ ...d, prayer: { ...d.prayer, arabic: null } })) : null}
            rows={2}
            maxLength={300}
          />
          <Area
            label="Meaning or your own words"
            value={data.prayer.text ?? defaultPrayerText(data.occasion, c)}
            onChange={(v) => set((d) => ({ ...d, prayer: { ...d.prayer, text: v } }))}
            onReset={data.prayer.text != null ? () => set((d) => ({ ...d, prayer: { ...d.prayer, text: null } })) : null}
            rows={3}
            maxLength={400}
          />
        </>
      )}
    </>
  );
}

/* ── sections ── */

export function ExtrasPanel({ data, set }: P) {
  const c = copyFor(data.lang);
  const show = (k: keyof InviteData["show"], v: boolean) => set((d) => ({ ...d, show: { ...d.show, [k]: v } }));
  return (
    <>
      {isPremium(data.template) && (
        <>
          <Toggle label="RSVP" hint="Guests say if they're coming, to which functions and how many. Replies are on your private replies page" checked={data.show.rsvp === true} onChange={(v) => show("rsvp", v)} />
          <Toggle label="Wishes from guests" hint="A wall where family and friends leave duas and wishes for you" checked={data.show.wishes === true} onChange={(v) => show("wishes", v)} />
        </>
      )}
      <Toggle label="Countdown" hint="Days, hours and minutes to the first day" checked={data.show.countdown} onChange={(v) => show("countdown", v)} />
      <Toggle label="Add to calendar" hint="Google Calendar, Apple and Outlook" checked={data.show.calendar} onChange={(v) => show("calendar", v)} />
      <Toggle label="Map on the card" hint="Google Maps and Waze buttons are always there" checked={data.show.map} onChange={(v) => show("map", v)} />

      <div className="border-t border-line pt-4">
        <Toggle label="Programme" hint="What happens when, on the first day" checked={data.show.schedule} onChange={(v) => show("schedule", v)} />
        {data.show.schedule && (
          <div className="mt-3 space-y-2">
            {data.schedule.map((s, i) => (
              <div key={i} className="grid grid-cols-[96px_1fr_auto] gap-2">
                <TextField aria-label="Time" className="min-w-0" value={s.time} maxLength={20} onChange={(v) => set((d) => ({ ...d, schedule: d.schedule.map((x, j) => (j === i ? { ...x, time: v } : x)) }))}>
                  <Input placeholder="7:30 PM" className="px-2.5" />
                </TextField>
                <TextField aria-label="What happens" className="min-w-0" value={s.title} maxLength={80} onChange={(v) => set((d) => ({ ...d, schedule: d.schedule.map((x, j) => (j === i ? { ...x, title: v } : x)) }))}>
                  <Input placeholder="Dinner is served" dir="auto" />
                </TextField>
                <Button isIconOnly variant="ghost" aria-label="Remove" className={`${iconBtn} size-10 hover:text-wax`} onPress={() => set((d) => ({ ...d, schedule: d.schedule.filter((_, j) => j !== i) }))}>
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            ))}
            {data.schedule.length < 12 && (
              <Button variant="outline" size="sm" onPress={() => set((d) => ({ ...d, schedule: [...d.schedule, { time: "", title: "" }] }))}>
                <Plus className="size-4" aria-hidden /> Add a line
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-line pt-4">
        <Toggle label="Dress code" checked={data.show.dress} onChange={(v) => show("dress", v)} />
        {data.show.dress && (
          <div className="mt-3 space-y-3">
            <Text label="Title" value={data.dress.title ?? c.defaults.dressTitle} onChange={(v) => set((d) => ({ ...d, dress: { ...d.dress, title: v } }))} maxLength={60} />
            <Area label="Note" value={data.dress.note ?? c.defaults.dressNote} onChange={(v) => set((d) => ({ ...d, dress: { ...d.dress, note: v } }))} rows={2} maxLength={300} />
            <div>
              <p className={groupLabel}>Colours to wear</p>
              <div className="flex flex-wrap items-center gap-2.5">
                {data.dress.colors.map((col, i) => (
                  <ColorDot
                    key={i}
                    value={col}
                    label={`Colour ${i + 1}`}
                    onChange={(v) => set((d) => ({ ...d, dress: { ...d.dress, colors: d.dress.colors.map((x, j) => (j === i ? v : x)) } }))}
                    onRemove={() => set((d) => ({ ...d, dress: { ...d.dress, colors: d.dress.colors.filter((_, j) => j !== i) } }))}
                  />
                ))}
                {data.dress.colors.length < 6 && (
                  <Button isIconOnly variant="ghost" aria-label="Add a colour" className="size-10 rounded-full border border-dashed border-ink/25 text-muted hover:bg-transparent hover:text-ink" onPress={() => set((d) => ({ ...d, dress: { ...d.dress, colors: [...d.dress.colors, "#c9a35f"] } }))}>
                    <Plus className="size-4" aria-hidden />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-line pt-4">
        <Toggle label="Contacts" hint="WhatsApp and call buttons for guests' questions" checked={data.show.contacts} onChange={(v) => show("contacts", v)} />
        {data.show.contacts && (
          <div className="mt-3 space-y-2">
            {data.contacts.map((x, i) => (
              <div key={i} className="grid grid-cols-[1fr_1.1fr_auto] gap-2">
                <TextField aria-label="Contact name" className="min-w-0" value={x.name} maxLength={50} onChange={(v) => set((d) => ({ ...d, contacts: d.contacts.map((y, j) => (j === i ? { ...y, name: v } : y)) }))}>
                  <Input placeholder="Name" dir="auto" />
                </TextField>
                <TextField aria-label="Phone with country code" className="min-w-0" type="tel" inputMode="tel" value={x.phone} maxLength={24} onChange={(v) => set((d) => ({ ...d, contacts: d.contacts.map((y, j) => (j === i ? { ...y, phone: v } : y)) }))}>
                  <Input placeholder="+60 12-345 6789" />
                </TextField>
                <Button isIconOnly variant="ghost" aria-label="Remove" className={`${iconBtn} size-10 hover:text-wax`} onPress={() => set((d) => ({ ...d, contacts: d.contacts.filter((_, j) => j !== i) }))}>
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            ))}
            {data.contacts.length < 4 && (
              <Button variant="outline" size="sm" onPress={() => set((d) => ({ ...d, contacts: [...d.contacts, { name: "", phone: "" }] }))}>
                <Plus className="size-4" aria-hidden /> Add a contact
              </Button>
            )}
            <p className="text-[12.5px] text-muted">Include the country code so WhatsApp works for guests abroad.</p>
          </div>
        )}
      </div>

      <div className="border-t border-line pt-4">
        <Toggle label="Gifts note" checked={data.show.gifts} onChange={(v) => show("gifts", v)} />
        {data.show.gifts && (
          <div className="mt-3 space-y-3">
            <Text label="Title" value={data.gifts.title ?? c.defaults.giftsTitle} onChange={(v) => set((d) => ({ ...d, gifts: { ...d.gifts, title: v } }))} maxLength={80} />
            <Area label="Note" value={data.gifts.note ?? c.defaults.giftsNote} onChange={(v) => set((d) => ({ ...d, gifts: { ...d.gifts, note: v } }))} rows={2} maxLength={400} />
          </div>
        )}
      </div>
    </>
  );
}

/* ── music & motion ── */

export function MotionPanel({ data, set }: P) {
  return (
    <>
      <Toggle label="Background music" hint="Starts when guests open the invitation. They can pause it." checked={data.music.on} onChange={(v) => set((d) => ({ ...d, music: { ...d.music, on: v } }))} />
      {data.music.on && <MusicPicker value={data.music.track} suggested={trackFor(data.template)} onChange={(v) => set((d) => ({ ...d, music: { ...d.music, track: v } }))} />}
      <div className="border-t border-line pt-4">
        <Toggle label="Auto-scroll" hint="The invitation slowly scrolls by itself after opening. Touching the screen pauses it." checked={data.autoScroll.on} onChange={(v) => set((d) => ({ ...d, autoScroll: { ...d.autoScroll, on: v } }))} />
      </div>
      {data.autoScroll.on && (
        <Segmented
          label="Speed"
          value={data.autoScroll.speed}
          onChange={(v) => set((d) => ({ ...d, autoScroll: { ...d.autoScroll, speed: v } }))}
          options={[
            { value: 1, label: "Slow" },
            { value: 2, label: "Medium" },
            { value: 3, label: "Fast" },
          ]}
        />
      )}
    </>
  );
}

/* ── languages ── */

export function LanguagePanel({ data, set }: P) {
  return (
    <>
      <Select
        label="Main language"
        value={data.lang}
        onChange={(v) => set((d) => ({ ...d, lang: v as Lang, langs: d.langs.includes(v as Lang) ? d.langs : [v as Lang, ...d.langs] }))}
        options={LANGS.map((l) => ({ value: l, label: `${copyFor(l).meta.native} · ${copyFor(l).meta.name}` }))}
        hint="Labels, dates and the suggested wording use this language."
      />
      <div>
        <p className={groupLabel}>Guests can switch to</p>
        <div className="grid grid-cols-2 gap-1.5">
          {LANGS.map((l) => {
            const on = data.langs.includes(l);
            const main = l === data.lang;
            return (
              <Checkbox
                key={l}
                isSelected={on}
                isDisabled={main}
                onChange={(v) => set((d) => ({ ...d, langs: v ? [...d.langs, l] : d.langs.filter((x) => x !== l) }))}
                className="data-[disabled=true]:opacity-70"
              >
                <Checkbox.Content className={`w-full gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ${on ? "border-brand/50 bg-brand/5" : "border-line hover:border-ink/25"}`}>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Label lang={l} className="text-[14px] font-normal text-ink">
                    {copyFor(l).meta.native}
                  </Label>
                </Checkbox.Content>
              </Checkbox>
            );
          })}
        </div>
        <p className="mt-2 text-[12.5px] text-muted">Pick only your main language to hide the language button.</p>
      </div>
    </>
  );
}
