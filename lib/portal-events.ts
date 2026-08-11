'use client';

import { getPortalUser } from '@/lib/auth';

export type PortalEventPayload = {
  eventType: string;
  eventValue?: string;
  metadata?: Record<string, unknown>;
};

function currentPath() {
  if (typeof window === 'undefined') return '';
  return `${window.location.pathname}${window.location.search}`;
}

export async function trackPortalEvent({ eventType, eventValue, metadata = {} }: PortalEventPayload) {
  if (typeof window === 'undefined') return;

  try {
    const user = getPortalUser();
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        eventType,
        eventValue,
        metadata: {
          ...metadata,
          path: currentPath(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || undefined,
        },
        user: user || undefined,
      }),
    });

    // Bridge into the backend `events` table (resolves the GHL contact_id from
    // email) so the router / nurture / inactive-detection see real activity.
    if (user?.email) {
      const trackUrl =
        process.env.NEXT_PUBLIC_TRACK_EVENT_URL ??
        'https://qfhfuesnjfuwfujhvgpa.supabase.co/functions/v1/track-event';
      fetch(trackUrl, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, eventValue, email: user.email, metadata }),
      }).catch(() => {});
    }
  } catch (error) {
    // Tracking should never break the buyer experience.
    console.warn('Portal event tracking failed', error);
  }
}
