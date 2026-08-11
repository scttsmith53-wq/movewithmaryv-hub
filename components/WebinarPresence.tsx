'use client';

import { useEffect, useRef } from 'react';
import { getPortalUser } from '@/lib/auth';

// Pings the webinar-presence function while a logged-in member is on the webinar
// page, so BCOS knows who attended and for how long. Renders nothing.
const PRESENCE_URL =
  process.env.NEXT_PUBLIC_WEBINAR_PRESENCE_URL ||
  'https://qfhfuesnjfuwfujhvgpa.supabase.co/functions/v1/webinar-presence';
const PING_MS = 5 * 60 * 1000; // every 5 minutes

export default function WebinarPresence() {
  const contactId = useRef('');
  const startedAt = useRef(Date.now());

  useEffect(() => {
    const user = getPortalUser();
    const email = user?.email;
    if (!email) return;
    let cancelled = false;

    async function ping() {
      try {
        const res = await fetch(PRESENCE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            contact_id: contactId.current || undefined,
            elapsed_seconds: Math.round((Date.now() - startedAt.current) / 1000),
          }),
        });
        const d = await res.json().catch(() => ({}));
        if (d?.contact_id) contactId.current = d.contact_id;
      } catch {
        /* ignore — presence is best-effort */
      }
    }

    ping(); // immediate: marks "joined"
    const id = setInterval(() => {
      if (!cancelled && document.visibilityState === 'visible') ping();
    }, PING_MS);

    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return null;
}
