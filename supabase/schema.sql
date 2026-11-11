-- DWM Invite database. Run this once in the Supabase SQL editor (safe to re-run).
--
-- Every table has row-level security switched on and no policies, so the public
-- anon/publishable key can't read or write anything. Only the server, using the
-- service-role key, touches these tables.

create table if not exists public.invites (
  slug text primary key check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$'),
  data jsonb not null,
  -- sha256 (hex) of the private edit token. The token itself is never stored.
  token_hash text not null,
  -- null for invitations made as a guest.
  owner_id uuid references auth.users (id) on delete set null,
  views integer not null default 0,
  max_views integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- For the admin "Full" filter (PostgREST can't compare two columns).
alter table public.invites add column if not exists is_full boolean generated always as (views >= max_views) stored;

create index if not exists invites_owner_idx on public.invites (owner_id, created_at desc);
create index if not exists invites_created_idx on public.invites (created_at desc);

alter table public.invites enable row level security;

-- Fixed-window counters for rate limits ("rl:create:<ip>" and so on).
create table if not exists public.rate_limits (
  key text primary key,
  n integer not null,
  reset_at timestamptz not null
);

alter table public.rate_limits enable row level security;

-- Admin sign-ins and actions, newest first in the dashboard.
create table if not exists public.admin_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  email text not null,
  action text not null,
  detail text,
  ip text
);

alter table public.admin_log enable row level security;

-- Adds one to a rate-limit counter and returns it. The counter restarts after
-- p_window seconds.
create or replace function public.hit_rate(p_key text, p_window integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  result integer;
begin
  insert into public.rate_limits as r (key, n, reset_at)
       values (p_key, 1, now() + make_interval(secs => p_window))
  on conflict (key) do update
     set n = case when r.reset_at < now() then 1 else r.n + 1 end,
         reset_at = case when r.reset_at < now() then now() + make_interval(secs => p_window) else r.reset_at end
  returning r.n into result;
  -- Now and then, clear out expired counters.
  if random() < 0.01 then
    delete from public.rate_limits where reset_at < now() - interval '1 day';
  end if;
  return result;
end;
$$;

-- The functions run as their owner, so only the server may call them.
revoke all on function public.hit_rate(text, integer) from public, anon, authenticated;
grant execute on function public.hit_rate(text, integer) to service_role;

-- Totals for the admin dashboard.
create or replace function public.admin_stats()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'invites', count(*),
    'views', coalesce(sum(views), 0),
    'guest', count(*) filter (where owner_id is null),
    'full', count(*) filter (where views >= max_views),
    'week', count(*) filter (where created_at > now() - interval '7 days'),
    'today', count(*) filter (where created_at > now() - interval '1 day')
  )
  from public.invites;
$$;

revoke all on function public.admin_stats() from public, anon, authenticated;
grant execute on function public.admin_stats() to service_role;

-- ── Insights (added Nov 2026) ─────────────────────────────────────────────────

-- Where an invitation was made, from the country/city Vercel attaches to requests.
alter table public.invites add column if not exists country text;
alter table public.invites add column if not exists city text;

-- One row per counted guest visit (one per phone per invitation).
create table if not exists public.visits (
  id bigint generated always as identity primary key,
  slug text not null references public.invites (slug) on delete cascade,
  at timestamptz not null default now(),
  country text,
  region text,
  city text,
  -- phone, tablet or desktop
  device text,
  -- where the guest came from: WhatsApp, Instagram, Google, a site's host, or Direct
  source text
);

create index if not exists visits_at_idx on public.visits (at desc);
create index if not exists visits_slug_idx on public.visits (slug, at desc);

alter table public.visits enable row level security;

-- Counts one guest opening an invitation, but only while it has visits left, and
-- records where the visit came from. Returns the new count and the limit;
-- counted = false once the limit is reached. (The drop removes the older
-- one-argument version.)
drop function if exists public.register_view(text);

create or replace function public.register_view(
  p_slug text,
  p_country text default null,
  p_region text default null,
  p_city text default null,
  p_device text default null,
  p_source text default null
)
returns table (counted boolean, views integer, max_views integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    update public.invites i
       set views = i.views + 1
     where i.slug = p_slug and i.views < i.max_views
    returning true, i.views, i.max_views;
  if found then
    insert into public.visits (slug, country, region, city, device, source)
         values (p_slug, p_country, p_region, p_city, p_device, p_source);
  else
    return query select false, i.views, i.max_views from public.invites i where i.slug = p_slug;
  end if;
end;
$$;

revoke all on function public.register_view(text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.register_view(text, text, text, text, text, text) to service_role;

-- Everything the admin Insights tab shows, for the last p_days days.
create or replace function public.admin_insights(p_days integer default 30)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with
    inv as (select * from public.invites where created_at > now() - make_interval(days => p_days)),
    vis as (select * from public.visits where at > now() - make_interval(days => p_days))
  select json_build_object(
    'made', (select count(*) from inv),
    'made_accounts', (select count(*) from inv where owner_id is not null),
    'visits', (select count(*) from vis),
    'made_by_day', (select coalesce(json_agg(json_build_object('day', d, 'n', n) order by d), '[]'::json)
                      from (select (created_at at time zone 'utc')::date d, count(*) n from inv group by 1) x),
    'visits_by_day', (select coalesce(json_agg(json_build_object('day', d, 'n', n) order by d), '[]'::json)
                        from (select (at at time zone 'utc')::date d, count(*) n from vis group by 1) x),
    'visit_countries', (select coalesce(json_agg(json_build_object('key', k, 'n', n) order by n desc), '[]'::json)
                          from (select coalesce(country, '') k, count(*) n from vis group by 1 order by 2 desc limit 12) x),
    'visit_cities', (select coalesce(json_agg(json_build_object('key', k, 'country', c, 'n', n) order by n desc), '[]'::json)
                       from (select coalesce(city, '') k, coalesce(country, '') c, count(*) n from vis group by 1, 2 order by 3 desc limit 12) x),
    'maker_countries', (select coalesce(json_agg(json_build_object('key', k, 'n', n) order by n desc), '[]'::json)
                          from (select coalesce(country, '') k, count(*) n from inv group by 1 order by 2 desc limit 12) x),
    'maker_cities', (select coalesce(json_agg(json_build_object('key', k, 'country', c, 'n', n) order by n desc), '[]'::json)
                       from (select coalesce(city, '') k, coalesce(country, '') c, count(*) n from inv group by 1, 2 order by 3 desc limit 12) x),
    'devices', (select coalesce(json_agg(json_build_object('key', k, 'n', n) order by n desc), '[]'::json)
                  from (select coalesce(device, '') k, count(*) n from vis group by 1) x),
    'sources', (select coalesce(json_agg(json_build_object('key', k, 'n', n) order by n desc), '[]'::json)
                  from (select coalesce(source, '') k, count(*) n from vis group by 1 order by 2 desc limit 10) x),
    'designs', (select coalesce(json_agg(json_build_object('key', k, 'n', n) order by n desc), '[]'::json)
                  from (select data->>'template' k, count(*) n from inv group by 1 order by 2 desc limit 10) x),
    'occasions', (select coalesce(json_agg(json_build_object('key', k, 'n', n) order by n desc), '[]'::json)
                    from (select data->>'occasion' k, count(*) n from inv group by 1 order by 2 desc) x),
    'top_invites', (select coalesce(json_agg(json_build_object('key', slug, 'n', n) order by n desc), '[]'::json)
                      from (select slug, count(*) n from vis group by 1 order by 2 desc limit 10) x)
  );
$$;

revoke all on function public.admin_insights(integer) from public, anon, authenticated;
grant execute on function public.admin_insights(integer) to service_role;

-- ── Open editing (added Nov 2026) ─────────────────────────────────────────────

-- When true, anyone who opens /edit/<slug> can edit the invitation without the
-- private key. Off by default; the maker picks it when publishing, and the
-- admin or the maker can change it later.
alter table public.invites add column if not exists open_edit boolean not null default false;

-- Guest replies (Nov 2026). RSVPs are read only by the host (edit key or account)
-- through the server; wishes are shown on the invitation. Rows are written and read
-- only by the server with the service role, so no row-level-security policies.
create table if not exists public.rsvps (
  id bigint generated always as identity primary key,
  slug text not null references public.invites (slug) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  attending text not null check (attending in ('yes', 'no')),
  guests integer not null default 1 check (guests between 0 and 30),
  -- the invitation's event ids the guest is coming to
  events text[] not null default '{}',
  phone text check (char_length(phone) <= 30),
  note text check (char_length(note) <= 300),
  created_at timestamptz not null default now()
);

create index if not exists rsvps_slug_idx on public.rsvps (slug, created_at desc);
alter table public.rsvps enable row level security;

create table if not exists public.wishes (
  id bigint generated always as identity primary key,
  slug text not null references public.invites (slug) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  message text not null check (char_length(message) between 2 and 400),
  -- hidden by the host or the admin
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists wishes_slug_idx on public.wishes (slug, created_at desc);
alter table public.wishes enable row level security;
