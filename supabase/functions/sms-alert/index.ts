// supabase/functions/sms-alert/index.ts
// ---------------------------------------------------------------------------
// Tiny SMS relay: texts Scott's phone via the same GoHighLevel path the
// registration handler uses for lead alerts. Built for the twice-daily
// "Meta Ads spend review" scheduled task, which composes a report and then
// calls this endpoint to push it to Scott's phone.
//
// Auth: a shared secret (SMS_ALERT_TOKEN) must match, so random callers can't
// text Scott. Send it as ?token=... (GET) or { "token": "..." } (POST).
//
// Usage:
//   GET  /sms-alert?token=SECRET&message=<url-encoded text>
//   POST /sms-alert  { "token": "SECRET", "message": "..." }
//
// Reuses these Edge Function secrets (already set for the register function):
//   GHL_API_TOKEN, GHL_LOCATION_ID, SCOTT_ALERT_PHONE
// Plus one new secret:
//   SMS_ALERT_TOKEN   (the shared secret above)
//
// Deploy with "Verify JWT" turned OFF so the scheduled task can call it.
// ---------------------------------------------------------------------------

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const GHL_API_TOKEN = Deno.env.get('GHL_API_TOKEN') || '';
const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID') || 'ERorIDfOTkbtiJ9fX0lr';
const SCOTT_ALERT_PHONE = Deno.env.get('SCOTT_ALERT_PHONE') || '';
const SMS_ALERT_TOKEN = (Deno.env.get('SMS_ALERT_TOKEN') || '').trim();
const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_HEADERS = {
  'Authorization': `Bearer ${GHL_API_TOKEN}`,
  'Version': '2021-07-28',
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Upsert the internal contact GHL texts Scott through, and return its id.
async function getAlertContactId(): Promise<string | null> {
  if (!GHL_API_TOKEN || !GHL_LOCATION_ID || !SCOTT_ALERT_PHONE) return null;
  try {
    const r = await fetch(`${GHL_API_BASE}/contacts/upsert`, {
      method: 'POST', headers: GHL_API_HEADERS,
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID, phone: SCOTT_ALERT_PHONE,
        firstName: 'Scott', lastName: 'Alerts', tags: ['Internal - Scott Alerts'],
      }),
    });
    if (!r.ok) { console.error(`alert upsert ${r.status}: ${await r.text()}`); return null; }
    const d = await r.json();
    return d?.contact?.id ?? d?.id ?? null;
  } catch (e) { console.error('getAlertContactId error:', e); return null; }
}

async function textScott(message: string): Promise<{ ok: boolean; error?: string }> {
  const id = await getAlertContactId();
  if (!id) return { ok: false, error: 'Could not resolve alert contact (check GHL secrets).' };
  const r = await fetch(`${GHL_API_BASE}/conversations/messages`, {
    method: 'POST', headers: GHL_API_HEADERS,
    body: JSON.stringify({ type: 'SMS', contactId: id, message }),
  });
  if (!r.ok) return { ok: false, error: `GHL send ${r.status}: ${await r.text()}` };
  return { ok: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  let token = '';
  let message = '';
  try {
    if (req.method === 'GET') {
      const u = new URL(req.url);
      token = u.searchParams.get('token') || '';
      message = u.searchParams.get('message') || u.searchParams.get('msg') || '';
    } else if (req.method === 'POST') {
      const b = await req.json().catch(() => ({}));
      token = String(b.token || '');
      message = String(b.message || b.msg || '');
    } else {
      return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
        status: 405, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  } catch (_) { /* fall through to validation */ }

  // --- TEMP DIAGNOSTIC (remove later): /sms-alert?debug=1&token=... never
  //     sends an SMS; it returns a status code that reveals the token state so
  //     we can pinpoint the mismatch from the Invocations tab:
  //       250 = SMS_ALERT_TOKEN secret is missing or misnamed (reads empty)
  //       251 = secret is set but the VALUE is wrong (length differs)
  //       252 = same length but characters differ (a subtle typo)
  //       200 = token matches — auth would succeed
  try {
    if (new URL(req.url).searchParams.get('debug') === '1') {
      const got = token.trim();
      let code = 200;
      if (!SMS_ALERT_TOKEN) code = 250;
      else if (SMS_ALERT_TOKEN.length !== got.length) code = 251;
      else if (SMS_ALERT_TOKEN !== got) code = 252;
      return new Response(JSON.stringify({
        configured: !!SMS_ALERT_TOKEN, expectedLen: SMS_ALERT_TOKEN.length, gotLen: got.length,
      }), { status: code, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
  } catch (_) { /* ignore */ }

  if (!SMS_ALERT_TOKEN || token.trim() !== SMS_ALERT_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
      status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
  message = message.trim();
  if (!message) {
    return new Response(JSON.stringify({ ok: false, error: 'message required' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
  // Keep it to a sane SMS length (GHL will segment; cap to avoid runaway cost).
  if (message.length > 1200) message = message.slice(0, 1197) + '...';

  const res = await textScott(message);
  return new Response(JSON.stringify(res), {
    status: res.ok ? 200 : 502, headers: { ...cors, 'Content-Type': 'application/json' },
  });
});
