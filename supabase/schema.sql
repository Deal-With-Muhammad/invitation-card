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

-- Counts one guest opening an invitation, but only while it has visits left.
-- Returns the new count and the limit; counted = false once the limit is reached.
create or replace function public.register_view(p_slug text)
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
  if not found then
    return query select false, i.views, i.max_views from public.invites i where i.slug = p_slug;
  end if;
end;
$$;

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
revoke all on function public.register_view(text) from public, anon, authenticated;
revoke all on function public.hit_rate(text, integer) from public, anon, authenticated;
grant execute on function public.register_view(text) to service_role;
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
