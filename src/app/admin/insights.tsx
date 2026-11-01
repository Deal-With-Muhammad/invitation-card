import Link from "next/link";

import { metaFor } from "@/invite/templates/catalog";
import { OCCASIONS, type Occasion } from "@/invite/types";
import { DWM_ORIGIN } from "@/lib/dwm";
import { OCCASION_LABEL } from "@/lib/filters";
import { site } from "@/lib/site";
import { db } from "@/lib/supabase/server";

// Where guests and makers come from, what they make and how guests arrive.
// Everything is aggregated in Postgres (admin_insights) for the chosen period.

type Count = { key: string; n: number };
type CityCount = Count & { country: string };
type Insights = {
  made: number;
  made_accounts: number;
  visits: number;
  made_by_day: { day: string; n: number }[];
  visits_by_day: { day: string; n: number }[];
  visit_countries: Count[];
  visit_cities: CityCount[];
  maker_countries: Count[];
  maker_cities: CityCount[];
  devices: Count[];
  sources: Count[];
  designs: Count[];
  occasions: Count[];
  top_invites: Count[];
};

export const PERIODS = [7, 30, 90] as const;

const nf = new Intl.NumberFormat("en");
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const dayLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

const flag = (cc: string) => (/^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "");
function countryName(cc: string) {
  if (!cc) return "Unknown";
  try {
    return regionNames.of(cc) ?? cc;
  } catch {
    return cc;
  }
}
const DEVICE: Record<string, string> = { phone: "Phone", tablet: "Tablet", desktop: "Computer" };

async function websiteVisitors(): Promise<number | null> {
  try {
    const res = await fetch(`${DWM_ORIGIN}/api/views?site=${site.id}`, { next: { revalidate: 300 } });
    const j = await res.json();
    return j?.ready === true && Number.isFinite(j.visitors) ? j.visitors : null;
  } catch {
    return null;
  }
}

export async function InsightsTab({ days, href }: { days: number; href: (p: Record<string, string | number | undefined>) => string }) {
  const [{ data, error }, visitors] = await Promise.all([db().rpc("admin_insights", { p_days: days }), websiteVisitors()]);
  if (error) return <p className="mt-5 rounded-xl bg-wax/10 px-3.5 py-2.5 text-[14px] text-wax">Couldn&apos;t load insights: {error.message}</p>;
  const d = data as Insights;

  const country = (r: Count) => ({ label: `${flag(r.key)} ${countryName(r.key)}`.trim(), n: r.n });
  const city = (r: CityCount) => ({ label: r.key ? `${flag(r.country)} ${r.key}`.trim() : "Unknown", n: r.n });

  return (
    <section className="mt-5 space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13.5px] text-muted">Period</span>
        {PERIODS.map((p) => (
          <Link
            key={p}
            href={href({ days: p })}
            className={`rounded-full border px-3 py-1.5 text-[13.5px] ${p === days ? "border-deep bg-deep text-ivory" : "border-line bg-card hover:bg-paper-2"}`}
          >
            Last {p} days
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Tile label="Invitations made" value={d.made} note={`${nf.format(d.made_accounts)} by accounts, ${nf.format(d.made - d.made_accounts)} by guests`} />
        <Tile label="Guest visits" value={d.visits} note="Every opening of a link counts" />
        <Tile
          label="Website visitors (all time)"
          value={visitors}
          note={
            <a href={`${DWM_ORIGIN}/stats/${site.id}`} target="_blank" rel="noopener" className="text-brand underline underline-offset-4">
              Full website stats, with countries and pages
            </a>
          }
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title="Invitations made per day">
          <Columns days={days} rows={d.made_by_day} unit="invitations" />
        </Panel>
        <Panel title="Guest visits per day">
          <Columns days={days} rows={d.visits_by_day} unit="visits" />
        </Panel>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Panel title="Where guests open invitations">
          <Ranked rows={d.visit_countries.map(country)} />
        </Panel>
        <Panel title="Guest cities">
          <Ranked rows={d.visit_cities.map(city)} />
        </Panel>
        <Panel title="How guests arrive">
          <Ranked rows={d.sources.map((r) => ({ label: r.key || "Unknown", n: r.n }))} />
        </Panel>
        <Panel title="Where invitations are made">
          <Ranked rows={d.maker_countries.map(country)} />
        </Panel>
        <Panel title="Maker cities">
          <Ranked rows={d.maker_cities.map(city)} />
        </Panel>
        <Panel title="Guest devices">
          <Ranked rows={d.devices.map((r) => ({ label: DEVICE[r.key] ?? "Unknown", n: r.n }))} />
        </Panel>
        <Panel title="Popular designs">
          <Ranked rows={d.designs.map((r) => ({ label: metaFor(r.key).name, n: r.n }))} />
        </Panel>
        <Panel title="Occasions">
          <Ranked rows={d.occasions.map((r) => ({ label: OCCASIONS.includes(r.key as Occasion) ? OCCASION_LABEL[r.key as Occasion] : r.key, n: r.n }))} />
        </Panel>
        <Panel title="Most-opened invitations">
          <Ranked rows={d.top_invites.map((r) => ({ label: `/${r.key}`, n: r.n, href: `/${r.key}` }))} />
          <Link href={href({ tab: "invites", page: 1 })} className="mt-3 inline-block text-[13.5px] text-brand underline underline-offset-4">
            See every invitation
          </Link>
        </Panel>
      </div>
      <p className="text-[12.5px] text-muted">
        Locations come from the visitor&apos;s internet connection, so they&apos;re usually right to the city but not always. Local test visits show as Unknown.
        Links opened from WhatsApp in the phone&apos;s own browser carry no referrer and count as Direct.
      </p>
    </section>
  );
}

function Tile({ label, value, note }: { label: string; value: number | null; note: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <p className="text-[12.5px] text-muted">{label}</p>
      <p className="mt-1 font-serif text-[34px] leading-none tabular-nums">{value == null ? "—" : nf.format(value)}</p>
      <p className="mt-2 text-[12.5px] text-muted">{note}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <h3 className="mb-3 text-[14px] font-medium">{title}</h3>
      {children}
    </div>
  );
}

/** One column per day (missing days are zero), with a hover label per column. */
function Columns({ days, rows, unit }: { days: number; rows: { day: string; n: number }[]; unit: string }) {
  const byDay = new Map(rows.map((r) => [r.day, r.n]));
  const today = new Date();
  const series = Array.from({ length: days }, (_, i) => {
    const t = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (days - 1 - i)));
    const key = t.toISOString().slice(0, 10);
    return { key, label: dayLabel.format(t), n: byDay.get(key) ?? 0 };
  });
  const max = Math.max(1, ...series.map((s) => s.n));
  const total = series.reduce((a, s) => a + s.n, 0);
  if (total === 0) return <Empty />;
  return (
    <figure>
      <div className="relative">
        <span className="absolute -top-1 start-0 text-[11px] text-muted tabular-nums">{nf.format(max)}</span>
        <div className="absolute inset-x-0 top-2 border-t border-dashed border-line" aria-hidden />
        <div className="flex h-36 items-end gap-[2px] border-b border-line pt-2" role="img" aria-label={`${nf.format(total)} ${unit} in the last ${days} days`}>
          {series.map((s) => (
            <div key={s.key} className="group relative flex h-full flex-1 items-end">
              <div
                className={`w-full rounded-t-[4px] ${s.n ? "bg-brand group-hover:bg-deep" : ""}`}
                style={{ height: s.n ? `${Math.max(3, (s.n / max) * 100)}%` : 0 }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-lg bg-ink px-2 py-1 text-[12px] whitespace-nowrap text-paper group-hover:block">
                {s.label} · {nf.format(s.n)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-1.5 flex justify-between text-[11.5px] text-muted">
        <span>{series[0].label}</span>
        <span>{nf.format(total)} total · days in UTC</span>
        <span>{series.at(-1)!.label}</span>
      </figcaption>
    </figure>
  );
}

/** A ranked list: label, a bar sized against the largest, and the count. */
function Ranked({ rows }: { rows: { label: string; n: number; href?: string }[] }) {
  if (rows.length === 0) return <Empty />;
  const max = Math.max(...rows.map((r) => r.n));
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-[13.5px]">
          {r.href ? (
            <a href={r.href} target="_blank" rel="noopener" className="truncate hover:text-brand">
              {r.label}
            </a>
          ) : (
            <span className="truncate">{r.label}</span>
          )}
          <span className="text-muted tabular-nums">{nf.format(r.n)}</span>
          <div className="col-span-2 h-1.5 rounded-full bg-paper-3" aria-hidden>
            <div className="h-full rounded-full bg-brand" style={{ width: `${(r.n / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Empty() {
  return <p className="py-6 text-center text-[13.5px] text-muted">Nothing yet in this period.</p>;
}
