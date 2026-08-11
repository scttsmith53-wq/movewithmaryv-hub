-- Scarlet — webinar live-chat AI moderator
-- Run once in Supabase SQL Editor.

-- Mark a message as posted by the moderator (for styling + so she doesn't reply to herself).
alter table public.webinar_messages
  add column if not exists is_moderator boolean not null default false;

-- Single-row state so Scarlet doesn't intro twice / spam / double-post across clients.
create table if not exists public.webinar_moderator_state (
  id            int primary key default 1,
  intro_done    boolean not null default false,
  last_post_at  timestamptz,   -- any Scarlet post (min-gap guard)
  last_link_at  timestamptz,   -- last time she posted the booking link
  last_reply_at timestamptz,   -- newest user message she has replied to
  constraint webinar_moderator_state_singleton check (id = 1)
);
insert into public.webinar_moderator_state (id) values (1) on conflict (id) do nothing;

-- Service-role only (the API route). No public policies needed.
alter table public.webinar_moderator_state enable row level security;

-- ---------------------------------------------------------------------------
-- Run this at the START of each webinar so Scarlet re-introduces herself:
--   update public.webinar_moderator_state
--     set intro_done = false, last_post_at = null, last_link_at = null, last_reply_at = null
--     where id = 1;
-- ---------------------------------------------------------------------------
