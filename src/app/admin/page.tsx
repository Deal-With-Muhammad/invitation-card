import Link from "next/link";

import { LogoMark } from "@/components/logo";
import { metaFor } from "@/invite/templates/catalog";
import { ADMIN_SESSION_HOURS, requireAdmin } from "@/lib/server/admin";
import { db } from "@/lib/supabase/server";

import { addVisits, deleteInvite, resetVisits, signOut } from "./actions";
import { ConfirmButton } from "./confirm-button";
import { InsightsTab, PERIODS } from "./insights";

export const dynamic = "force-dynamic";

const PER_PAGE = 50;
const nf = new Intl.NumberFormat("en");
const when = (iso: string | null | undefined) =>
  iso ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "—";

type Stats = { invites: number; views: number; guest: number; full: number; week: number; today: number };
type InviteRow = {
  slug: string;
  owner_id: string | null;
  views: number;
  max_views: number;
  created_at: string;
  updated_at: string;
  template: string;
  occasion: string;
  people: { name?: string }[] | null;
};

const FILTERS = { all: "All", account: "Accounts", guest: "Guests", full: "Full" } as const;
type Filter = keyof typeof FILTERS;
const TABS = { insights: "Insights", invites: "Invitations", users: "Accounts", log: "Admin log" } as const;
type Tab = keyof typeof TABS;

export default async function AdminPage(props: PageProps<"/admin">) {
  const admin = await requireAdmin();
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const tab: Tab = one(sp.tab) in TABS ? (one(sp.tab) as Tab) : "insights";
  const days = (PERIODS as readonly number[]).includes(Number(one(sp.days))) ? Number(one(sp.days)) : 30;
  const filter: Filter = one(sp.filter) in FILTERS ? (one(sp.filter) as Filter) : "all";
  const q = one(sp.q).trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 48);
  const page = Math.max(1, Math.floor(Number(one(sp.page)) || 1));

  const [{ data: stats }, { data: usersData }] = await Promise.all([db().rpc("admin_stats"), db().auth.admin.listUsers({ page: 1, perPage: 1000 })]);
  const s = (stats ?? { invites: 0, views: 0, guest: 0, full: 0, week: 0, today: 0 }) as Stats;
  const users = usersData?.users ?? [];
  const emailOf = new Map(users.map((u) => [u.id, u.email ?? u.id]));

  const href = (patch: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { tab, filter, q, page, days, ...patch };
    const defaults: Record<string, unknown> = { page: 1, filter: "all", tab: "insights", days: 30 };
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "" && defaults[k] !== v) p.set(k, String(v));
    const str = p.toString();
    return str ? `/admin?${str}` : "/admin";
  };

  return (
    <>
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark className="size-8" />
            <span className="font-serif text-[20px] uppercase">Admin</span>
          </Link>
          <span className="ms-auto truncate text-[13px] text-muted" title={`Signed in with an email code. Asks again after ${ADMIN_SESSION_HOURS} hours.`}>
            {admin.email}
          </span>
          <form action={signOut}>
            <button type="submit" className="rounded-full border border-line px-3.5 py-1.5 text-[13.5px] hover:bg-paper-2">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Invitations" value={s.invites} />
          <Stat label="Made today" value={s.today} />
          <Stat label="Last 7 days" value={s.week} />
          <Stat label="Guest visits" value={s.views} />
          <Stat label="Accounts" value={usersData ? users.length : 0} />
          <Stat label="Full (no visits left)" value={s.full} />
        </section>
        <p className="mt-2 text-[13px] text-muted">
          {nf.format(s.invites - s.guest)} saved to accounts, {nf.format(s.guest)} made as guests.
        </p>

        <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-line whitespace-nowrap" aria-label="Admin sections">
          {(Object.keys(TABS) as Tab[]).map((t) => (
            <Link
              key={t}
              href={href({ tab: t, page: 1 })}
              aria-current={t === tab ? "page" : undefined}
              className={`-mb-px border-b-2 px-3 py-2.5 text-[14.5px] ${t === tab ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink"}`}
            >
              {TABS[t]}
            </Link>
          ))}
        </nav>

        {tab === "insights" && <InsightsTab days={days} href={href} />}
        {tab === "invites" && <Invites filter={filter} q={q} page={page} emailOf={emailOf} href={href} />}
        {tab === "users" && <Users users={users} />}
        {tab === "log" && <Log />}
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <p className="text-[12.5px] text-muted">{label}</p>
      <p className="mt-1 font-serif text-[30px] leading-none tabular-nums">{nf.format(value)}</p>
    </div>
  );
}

async function Invites({ filter, q, page, emailOf, href }: { filter: Filter; q: string; page: number; emailOf: Map<string, string>; href: (p: Record<string, string | number | undefined>) => string }) {
  let query = db()
    .from("invites")
    .select("slug, owner_id, views, max_views, created_at, updated_at, template:data->>template, occasion:data->>occasion, people:data->people", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  if (filter === "guest") query = query.is("owner_id", null);
  if (filter === "account") query = query.not("owner_id", "is", null);
  if (filter === "full") query = query.eq("is_full", true);
  if (q) query = query.ilike("slug", `%${q}%`);
  const { data, count, error } = await query.overrideTypes<InviteRow[], { merge: false }>();
  const rows = data ?? [];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PER_PAGE));

  return (
    <section className="mt-5">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(FILTERS) as Filter[]).map((f) => (
          <Link
            key={f}
            href={href({ filter: f, page: 1 })}
            className={`rounded-full border px-3 py-1.5 text-[13.5px] ${f === filter ? "border-deep bg-deep text-ivory" : "border-line bg-card hover:bg-paper-2"}`}
          >
            {FILTERS[f]}
          </Link>
        ))}
        <form className="ms-auto flex gap-2" action="/admin">
          <input type="hidden" name="tab" value="invites" />
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search links"
            className="h-9 w-48 rounded-full border border-line bg-card px-3.5 text-[14px] outline-none focus:border-brand"
          />
          <button type="submit" className="h-9 rounded-full bg-deep px-4 text-[13.5px] text-ivory">
            Search
          </button>
        </form>
      </div>

      {error && <p className="mt-4 rounded-xl bg-wax/10 px-3.5 py-2.5 text-[14px] text-wax">Couldn&apos;t load invitations: {error.message}</p>}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full min-w-[860px] text-start text-[14px]">
          <thead className="border-b border-line text-[12.5px] text-muted">
            <tr>
              <th className="px-4 py-3 text-start font-medium">Invitation</th>
              <th className="px-4 py-3 text-start font-medium">Made by</th>
              <th className="px-4 py-3 text-start font-medium">Visits</th>
              <th className="px-4 py-3 text-start font-medium">Created</th>
              <th className="px-4 py-3 text-end font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No invitations here.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const names = (r.people ?? []).map((p) => p.name).filter(Boolean).join(" & ");
              const left = Math.max(0, r.max_views - r.views);
              return (
                <tr key={r.slug} className="align-top">
                  <td className="px-4 py-3">
                    <a href={`/${r.slug}`} target="_blank" rel="noopener" className="font-medium hover:text-brand">
                      /{r.slug}
                    </a>
                    <p className="text-[12.5px] text-muted">
                      {names || "No names"} · {metaFor(r.template).name} · {r.occasion}
                    </p>
                  </td>
                  <td className="px-4 py-3">{r.owner_id ? emailOf.get(r.owner_id) ?? "Account" : <span className="text-muted">Guest</span>}</td>
                  <td className="px-4 py-3 tabular-nums">
                    <span className={left === 0 ? "text-wax" : ""}>
                      {r.views} / {r.max_views}
                    </span>
                    <p className="text-[12.5px] text-muted">{left} left</p>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted">{when(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <form action={addVisits}>
                        <input type="hidden" name="slug" value={r.slug} />
                        <input type="hidden" name="n" value="100" />
                        <button type="submit" className="rounded-full border border-line px-3 py-1 text-[13px] hover:bg-paper-2">
                          +100 visits
                        </button>
                      </form>
                      <form action={resetVisits}>
                        <input type="hidden" name="slug" value={r.slug} />
                        <ConfirmButton message={`Reset /${r.slug} to 0 visits used?`} className="rounded-full border border-line px-3 py-1 text-[13px] hover:bg-paper-2">
                          Reset
                        </ConfirmButton>
                      </form>
                      <form action={deleteInvite}>
                        <input type="hidden" name="slug" value={r.slug} />
                        <ConfirmButton
                          message={`Delete /${r.slug}? The link stops working for everyone. This can't be undone.`}
                          className="rounded-full border border-wax/40 px-3 py-1 text-[13px] text-wax hover:bg-wax/10"
                        >
                          Delete
                        </ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-[14px]">
          {page > 1 ? <Link href={href({ page: page - 1 })} className="text-brand underline underline-offset-4">Newer</Link> : <span />}
          <span className="text-muted">
            Page {page} of {pages}
          </span>
          {page < pages ? <Link href={href({ page: page + 1 })} className="text-brand underline underline-offset-4">Older</Link> : <span />}
        </div>
      )}
    </section>
  );
}

async function Users({ users }: { users: { id: string; email?: string; created_at: string; last_sign_in_at?: string }[] }) {
  const { data } = await db().from("invites").select("owner_id").not("owner_id", "is", null).limit(10000);
  const counts = new Map<string, number>();
  for (const r of data ?? []) counts.set(r.owner_id, (counts.get(r.owner_id) ?? 0) + 1);
  const sorted = [...users].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-card">
      <table className="w-full min-w-[640px] text-[14px]">
        <thead className="border-b border-line text-[12.5px] text-muted">
          <tr>
            <th className="px-4 py-3 text-start font-medium">Email</th>
            <th className="px-4 py-3 text-start font-medium">Invitations</th>
            <th className="px-4 py-3 text-start font-medium">Joined</th>
            <th className="px-4 py-3 text-start font-medium">Last sign-in</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {sorted.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-muted">
                No accounts yet.
              </td>
            </tr>
          )}
          {sorted.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3 tabular-nums">{counts.get(u.id) ?? 0}</td>
              <td className="px-4 py-3 text-[13px] text-muted">{when(u.created_at)}</td>
              <td className="px-4 py-3 text-[13px] text-muted">{when(u.last_sign_in_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function Log() {
  const { data } = await db().from("admin_log").select("*").order("at", { ascending: false }).limit(100);
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-card">
      <table className="w-full min-w-[640px] text-[14px]">
        <thead className="border-b border-line text-[12.5px] text-muted">
          <tr>
            <th className="px-4 py-3 text-start font-medium">When</th>
            <th className="px-4 py-3 text-start font-medium">Who</th>
            <th className="px-4 py-3 text-start font-medium">What</th>
            <th className="px-4 py-3 text-start font-medium">IP</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {(data ?? []).map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3 text-[13px] text-muted">{when(r.at)}</td>
              <td className="px-4 py-3">{r.email}</td>
              <td className="px-4 py-3">
                {r.action}
                {r.detail && <span className="text-muted"> · {r.detail}</span>}
              </td>
              <td className="px-4 py-3 font-mono text-[12.5px] text-muted">{r.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
