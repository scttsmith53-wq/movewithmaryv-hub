import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ghlWebhookUrl = process.env.GHL_PORTAL_EVENT_WEBHOOK_URL;

type PortalEventBody = {
  eventType?: string;
  eventValue?: string;
  metadata?: Record<string, unknown>;
  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phone?: string;
    locationId?: string;
    locationName?: string;
    source?: string;
  };
};

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim().slice(0, 500) : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PortalEventBody;
    const eventType = cleanString(body.eventType);

    if (!eventType) {
      return NextResponse.json({ ok: false, error: 'Missing eventType' }, { status: 400 });
    }

    const email = cleanString(body.user?.email)?.toLowerCase();
    const eventValue = cleanString(body.eventValue);
    const metadata = body.metadata || {};

    const eventRecord = {
      event_type: eventType,
      event_value: eventValue || null,
      email: email || null,
      first_name: cleanString(body.user?.firstName) || null,
      last_name: cleanString(body.user?.lastName) || null,
      full_name: cleanString(body.user?.fullName) || null,
      phone: cleanString(body.user?.phone) || null,
      location_id: cleanString(body.user?.locationId) || null,
      location_name: cleanString(body.user?.locationName) || null,
      source: cleanString(body.user?.source) || null,
      metadata,
    };

    let supabaseInserted = false;
    let supabaseError: string | null = null;

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { error } = await supabase.from('portal_events').insert(eventRecord);
      if (error) {
        supabaseError = error.message;
      } else {
        supabaseInserted = true;
      }
    }

    let ghlSent = false;
    let ghlError: string | null = null;

    if (ghlWebhookUrl) {
      try {
        const response = await fetch(ghlWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...eventRecord,
            eventType,
            eventValue,
            email,
            occurredAt: new Date().toISOString(),
          }),
        });
        ghlSent = response.ok;
        if (!response.ok) ghlError = `GHL webhook returned ${response.status}`;
      } catch (error) {
        ghlError = error instanceof Error ? error.message : 'Unknown GHL webhook error';
      }
    }

    return NextResponse.json({ ok: true, supabaseInserted, supabaseError, ghlSent, ghlError });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown tracking error' },
      { status: 500 }
    );
  }
}
