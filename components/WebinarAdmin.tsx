'use client';

// Host-only controls to open/close the webinar room (drives the live video +
// chat). Only rendered for admin logins; the API also re-checks the email.

import { useEffect, useState } from 'react';
import { getPortalUser } from '@/lib/auth';
import { createClient } from '@/utils/supabase/client';

// Client-side visibility allowlist (server enforces the real check via WEBINAR_ADMIN_EMAILS).
const ADMIN_EMAILS = ['scottsmith53@yahoo.com', 'scttsmith53@gmail.com'];

export default function WebinarAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    (async () => {
      // Read the email from the real Supabase session (source of truth), with a
      // fallback to the local portal user — avoids a race where localStorage
      // isn't hydrated yet on first paint (which hid the host controls).
      const { data } = await supabase.auth.getUser();
      const e = (data.user?.email || getPortalUser()?.email || '').toLowerCase();
      if (!cancelled) {
        setEmail(e);
        setIsAdmin(ADMIN_EMAILS.includes(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const supabase = createClient();
    let cancelled = false;
    async function check() {
      const { data } = await supabase.from('webinar_room').select('is_open').eq('id', 1).maybeSingle();
      if (!cancelled) setOpen(Boolean(data?.is_open));
    }
    check();
    const t = setInterval(check, 10000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [isAdmin]);

  if (!isAdmin) return null;

  async function toggle(action: 'open' | 'close') {
    setBusy(true);
    setNote('');
    try {
      const res = await fetch('/api/webinar/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, email }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setOpen(action === 'open');
        setNote(action === 'open' ? 'Room is LIVE ✅' : 'Room closed.');
      } else {
        setNote(d?.error || 'Something went wrong.');
      }
    } catch {
      setNote('Connection error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/[.06] px-4 py-3">
      <div className="text-sm">
        <span className="font-bold text-gold">Host controls</span>
        <span className="ml-2 text-ice/70">
          Room is {open === null ? '…' : open ? 'OPEN (live)' : 'closed'}
        </span>
        {note ? <span className="ml-2 text-xs text-ice/50">· {note}</span> : null}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => toggle('open')}
          disabled={busy || open === true}
          className="rounded-lg bg-gold px-4 py-2 text-xs font-bold text-[#101415] transition disabled:opacity-50"
        >
          Go live
        </button>
        <button
          type="button"
          onClick={() => toggle('close')}
          disabled={busy || open === false}
          className="rounded-lg border border-white/20 px-4 py-2 text-xs font-bold text-ice/80 transition hover:text-white disabled:opacity-50"
        >
          End webinar
        </button>
      </div>
    </div>
  );
}
