-- ─────────────────────────────────────────────────────────────────────────────
-- Copper Larder — initial schema
--
-- Four tables, one RPC. Every table has RLS enabled with **no policies**, so
-- the anon/public key can touch nothing: all access goes through the server
-- using the service_role key (see lib/supabase.ts). This is the security
-- model the app depends on — do not add permissive policies.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── conversations ───────────────────────────────────────────────────────────
-- One row per chat session. `messages` is the full durable transcript;
-- `message_count` is the paid-turn counter the session cap reads.
create table if not exists public.conversations (
  id             uuid primary key default gen_random_uuid(),
  session_id     text not null unique,
  messages       jsonb not null default '[]'::jsonb,
  message_count  integer not null default 0,
  ip_hash        text,
  user_agent     text,
  flag           text check (flag in ('complaint')),
  started_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists conversations_started_at_idx on public.conversations (started_at desc);
create index if not exists conversations_flag_idx on public.conversations (updated_at desc) where flag is not null;

-- ── leads ───────────────────────────────────────────────────────────────────
-- Callback requests captured by the widget's inline form.
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  session_id      text,
  name            text not null,
  phone           text not null,
  preferred_time  text not null,
  status          text not null default 'new' check (status in ('new', 'contacted', 'booked', 'closed')),
  notes           text,
  created_at      timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_session_id_idx on public.leads (session_id);

-- ── cache ───────────────────────────────────────────────────────────────────
-- Exact-match response cache (also powers the dashboard's "top questions").
-- Keyed by a normalised SHA-256 of the question.
create table if not exists public.cache (
  id             uuid primary key default gen_random_uuid(),
  question_hash  text not null unique,
  question_text  text not null,
  answer         text not null,
  source         text not null default 'llm' check (source in ('llm', 'intercept')),
  hits           integer not null default 0,
  created_at     timestamptz not null default now(),
  last_hit_at    timestamptz not null default now()
);

create index if not exists cache_hits_idx on public.cache (hits desc);

-- ── rate_limit_counters ─────────────────────────────────────────────────────
-- Per-(scope, key, day) counters. Resets naturally as `day` rolls over at
-- UTC midnight. Written only via increment_rate_limit() below.
create table if not exists public.rate_limit_counters (
  id          uuid primary key default gen_random_uuid(),
  scope       text not null check (scope in ('ip', 'global', 'lead_ip')),
  scope_key   text not null,
  day         date not null default (now() at time zone 'utc')::date,
  count       integer not null default 0,
  updated_at  timestamptz not null default now(),
  unique (scope, scope_key, day)
);

-- ── increment_rate_limit(scope, key) → new count ────────────────────────────
-- Atomic upsert-and-increment for today's counter. The chat/lead routes call
-- this once on the paid path and compare the return value against the caps
-- in lib/rate-limit.ts.
create or replace function public.increment_rate_limit(p_scope text, p_scope_key text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limit_counters (scope, scope_key, day, count)
  values (p_scope, p_scope_key, (now() at time zone 'utc')::date, 1)
  on conflict (scope, scope_key, day)
  do update set count = public.rate_limit_counters.count + 1,
                updated_at = now()
  returning count into v_count;

  return v_count;
end;
$$;

-- ── Row Level Security — enabled, deliberately no policies ───────────────────
alter table public.conversations        enable row level security;
alter table public.leads                enable row level security;
alter table public.cache                enable row level security;
alter table public.rate_limit_counters  enable row level security;

-- Keep the RPC callable only by the server key, not by anon.
revoke all on function public.increment_rate_limit(text, text) from public, anon, authenticated;
grant execute on function public.increment_rate_limit(text, text) to service_role;
