-- Buyer Confidence Hub — Webinar Live Chat (group chat during the live webinar)
-- Run this in Supabase SQL Editor. Follows the same model as portal_events.sql:
-- RLS on; WRITES happen only through the server route using SUPABASE_SERVICE_ROLE_KEY.
-- The one difference: chat messages are meant to be seen by everyone in the room,
-- so we add a public SELECT policy (non-hidden rows) and enable Realtime for live push.

-- ---------------------------------------------------------------------------
-- Room state: a single row that flips the room open/closed.
-- ---------------------------------------------------------------------------
create table if not exists public.webinar_room (
  id         int primary key default 1,
  is_open    boolean not null default false,
  title      text not null default 'Live Webinar',
  opened_at  timestamptz,
  constraint webinar_room_singleton check (id = 1)
);

insert into public.webinar_room (id, is_open)
  values (1, false)
  on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Messages.
-- ---------------------------------------------------------------------------
create table if not exists public.webinar_messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  first_name  text not null,
  email       text,
  city        text,
  body        text not null,
  flagged     boolean not null default false,   -- auto-flag for a quick glance
  hidden      boolean not null default false    -- moderator soft-delete
);

create index if not exists webinar_messages_created_at_idx
  on public.webinar_messages (created_at);

-- ---------------------------------------------------------------------------
-- RLS: read is public (non-hidden); writes are server-only (service role).
-- ---------------------------------------------------------------------------
alter table public.webinar_room enable row level security;
alter table public.webinar_messages enable row level security;

drop policy if exists "read room" on public.webinar_room;
create policy "read room" on public.webinar_room
  for select to anon, authenticated
  using (true);

drop policy if exists "read visible messages" on public.webinar_messages;
create policy "read visible messages" on public.webinar_messages
  for select to anon, authenticated
  using (not hidden);

-- No INSERT/UPDATE/DELETE policies: only the service-role server route can write,
-- exactly like portal_events. (Service role bypasses RLS.)

-- ---------------------------------------------------------------------------
-- Realtime: push new messages to subscribed clients.
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.webinar_messages;

-- ---------------------------------------------------------------------------
-- Open / close the room (run by hand, or from a small admin action):
--   open:   update public.webinar_room set is_open = true,  opened_at = now() where id = 1;
--   close:  update public.webinar_room set is_open = false where id = 1;
-- Moderate a message:
--   hide:   update public.webinar_messages set hidden = true where id = '<uuid>';
-- ---------------------------------------------------------------------------
