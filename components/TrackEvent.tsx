'use client';

import { useEffect, useRef } from 'react';
import { trackPortalEvent } from '@/lib/portal-events';

export default function TrackEvent({
  eventType,
  eventValue,
  metadata,
}: {
  eventType: string;
  eventValue?: string;
  metadata?: Record<string, unknown>;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackPortalEvent({ eventType, eventValue, metadata });
  }, [eventType, eventValue, metadata]);

  return null;
}
