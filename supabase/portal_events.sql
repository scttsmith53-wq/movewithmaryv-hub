-- Buyer Confidence Hub Phase 1 event tracking
-- Run this in Supabase SQL Editor.

create table if not exists public.portal_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text,
  first_name text,
  last_name text,
  full_name text,
  phone text,
  location_id text,
  location_name text,
  source text,
  event_type text not null,
  event_value text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists portal_events_email_idx on public.portal_events (email);
create index if not exists portal_events_event_type_idx on public.portal_events (event_type);
create index if not exists portal_events_created_at_idx on public.portal_events (created_at desc);

-- Recommended: keep RLS enabled and write events only through the server API route
-- using SUPABASE_SERVICE_ROLE_KEY. Do not expose the service role key publicly.
alter table public.portal_events enable row level security;
