import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Webinar live-chat writes. The browser POSTs here; the server writes with the
// service-role key (like /api/events). A GET health-check is included so config
// problems can be seen by just visiting the URL in a browser (no secrets leaked).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const FLAG_RE = /\b(apr|rates?|approved?|qualif|\d+(\.\d+)?\s?%)\b/i;
const MAX_LEN = 280;

function clean(value: unknown, max = MAX_LEN) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
function db() {
  return createClient(supabaseUrl as string, supabaseServiceKey as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Visit https://portal.smithapprovesme.com/api/webinar/chat in a browser to see this.
export async function GET() {
  const status: Record<string, unknown> = {
    hasSupabaseUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    serviceKeyPrefix: supabaseServiceKey ? supabaseServiceKey.slice(0, 8) + '…' : null,
    // Diagnostic: names only (no values) of relevant env vars the server sees.
    envNamesSeen: Object.keys(process.env)
      .filter((k) => /SUPABASE|GHL|WEBINAR|SITE_URL/i.test(k))
      .sort(),
  };
  if (supabaseUrl && supabaseServiceKey) {
    try {
      const supabase = db();
      const room = await supabase.from('webinar_room').select('is_open').eq('id', 1).maybeSingle();
      status.roomQuery = { ok: !room.error, error: room.error?.message ?? null, is_open: room.data?.is_open ?? null };
      const msgs = await supabase.from('webinar_messages').select('id').limit(1);
      status.messagesTable = { ok: !msgs.error, error: msgs.error?.message ?? null };
    } catch (e) {
      status.exception = e instanceof Error ? e.message : String(e);
    }
  }
  return NextResponse.json(status);
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      const missing = [!supabaseUrl && 'Supabase URL', !supabaseServiceKey && 'SUPABASE_SERVICE_ROLE_KEY']
        .filter(Boolean)
        .join(', ');
      return NextResponse.json({ ok: false, error: `Missing env var(s): ${missing}` }, { status: 500 });
    }

    let body: { body?: string; firstName?: string; email?: string; city?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'Bad request body' }, { status: 400 });
    }

    const text = clean(body.body);
    const firstName = clean(body.firstName, 40) || 'Guest';
    if (!text) return NextResponse.json({ ok: false, error: 'Empty message' }, { status: 400 });

    const supabase = db();

    const { data: room, error: roomErr } = await supabase
      .from('webinar_room')
      .select('is_open')
      .eq('id', 1)
      .maybeSingle();
    if (roomErr) return NextResponse.json({ ok: false, error: `Room read failed: ${roomErr.message}` }, { status: 500 });
    if (!room?.is_open) return NextResponse.json({ ok: false, error: 'Room is closed' }, { status: 409 });

    const { data, error } = await supabase
      .from('webinar_messages')
      .insert({
        first_name: firstName,
        email: clean(body.email, 200) || null,
        city: clean(body.city, 60) || null,
        body: text,
        flagged: FLAG_RE.test(text),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, error: `Insert failed: ${error.message}` }, { status: 500 });
    return NextResponse.json({ ok: true, message: data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `Server exception: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 }
    );
  }
}
