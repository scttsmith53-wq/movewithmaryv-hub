// supabase/functions/register/index.ts
// ---------------------------------------------------------------------------
// Unified registration handler for every Buy With Confidence landing page.
//
// On POST it:
//   1. Creates (or reuses) a Supabase auth user (email confirmed).
//   2. Upserts a row in public.profiles.
//   3. Generates a magic link to the portal page matching the lead's source.
//   4. POSTs the contact + tags + qualifier fields to the GHL inbound webhook.
//   5. Returns { ok, magic_link } so the landing page can log them straight in.
//
// Env (set in Supabase → Edge Functions → Secrets):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (auto-provided reserved secrets)
//   GHL_WEBHOOK_URL                          (your GHL inbound webhook)
//   SITE_URL                                 (https://portal.smithapprovesme.com)
//
// Deploy with "Verify JWT" turned OFF so public landing pages can call it.
// ---------------------------------------------------------------------------

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// GHL API — used to text Scott directly on each lead (same method as the `ask` function).
// Set these as Edge Function secrets (copy the values from the `ask` function).
const GHL_API_TOKEN = Deno.env.get('GHL_API_TOKEN') || '';
const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID') || 'ERorIDfOTkbtiJ9fX0lr';
const SCOTT_ALERT_PHONE = Deno.env.get('SCOTT_ALERT_PHONE') || '';
const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_HEADERS = {
  'Authorization': `Bearer ${GHL_API_TOKEN}`,
  'Version': '2021-07-28',
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Buyer Confidence OS "brain" — on a "registration" event it sends the
// first-touch welcome (email + short SMS) and owns all downstream nurture.
// hyper-handler fires this for EVERY lead so every source (FSBO/DPA/DSCR/VA/…)
// gets the follow-up. (This call lives only here — claude-router itself is
// deployed-only and not in the repo, so keep them in sync.)
const CLAUDE_ROUTER_URL = Deno.env.get('CLAUDE_ROUTER_URL') || 'https://qfhfuesnjfuwfujhvgpa.supabase.co/functions/v1/claude-router';

// Which portal page each landing source lands on after login.
const DEST: Record<string, string> = {
  calculator: '/calculators',
  webinar: '/webinar',
  open_house: '/dashboard',
  fsbo: '/fsbo',
  fsbo_chat: '/fsbo',
  dpa: '/dpa',
  va: '/va',
  dscr: '/dscr',
  refi: '/refinance',
  refinance: '/refinance',
  fha: '/fha',
  moveup: '/move-up',
  jumbo: '/jumbo',
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

// Text Scott's cell (via the internal alert contact) so a lead is never missed.
async function notifyScott(message: string): Promise<void> {
  const id = await getAlertContactId();
  if (!id) return;
  await fetch(`${GHL_API_BASE}/conversations/messages`, {
    method: 'POST', headers: GHL_API_HEADERS,
    body: JSON.stringify({ type: 'SMS', contactId: id, message }),
  });
}

// Create/update the LEAD's own contact in GHL via the v2 API. This is the
// reliable path: the inbound webhook workflow was intermittently leaving new
// leads unnamed (the webhook returns 200 the moment GHL receives it, even if
// the downstream "create contact" step never runs). Doing the upsert directly
// guarantees every lead lands as a properly NAMED contact with its tags.
async function upsertLeadContact(p: {
  firstName: string; lastName: string; fullName: string;
  email: string; phone: string; source: string; tags: string[];
}): Promise<{ id: string | null; ok: boolean; error?: string }> {
  if (!GHL_API_TOKEN || !GHL_LOCATION_ID) return { id: null, ok: false, error: 'missing GHL API token/location' };
  if (!p.email && !p.phone) return { id: null, ok: false, error: 'no email or phone to identify contact' };
  try {
    const r = await fetch(`${GHL_API_BASE}/contacts/upsert`, {
      method: 'POST', headers: GHL_API_HEADERS,
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        firstName: p.firstName || undefined,
        lastName: p.lastName || undefined,
        name: p.fullName || `${p.firstName} ${p.lastName}`.trim() || undefined,
        email: p.email || undefined,
        phone: p.phone || undefined,
        source: `Landing: ${p.source}`,
        tags: p.tags,
      }),
    });
    if (!r.ok) return { id: null, ok: false, error: `upsert ${r.status}: ${await r.text()}` };
    const d = await r.json();
    return { id: d?.contact?.id ?? d?.id ?? null, ok: true };
  } catch (e) {
    return { id: null, ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// Fire the AI first-touch. claude-router looks up the contact and, on a
// "registration" event, always sends a welcome email + short SMS, then owns the
// ongoing nurture. This mirrors what the standalone `register` bridge does —
// hyper-handler must fire it too, or leads posted here get no follow-up.
// Best-effort: never blocks the response.
async function fireRegistration(contactId: string, source: string, qualifiers: Record<string, string>): Promise<void> {
  if (!contactId) return;
  try {
    await fetch(CLAUDE_ROUTER_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'registration',
        event_category: 'registration',
        contact_id: contactId,
        source,
        timestamp: new Date().toISOString(),
        metadata: { qualifiers },
      }),
    });
  } catch (e) {
    console.error('fireRegistration error:', e);
  }
}

// ---------------------------------------------------------------------------
// Google Contacts sync — mirror every lead into Scott's Google Contacts so they
// land in his phone, filed under a "Website Leads" label. Best-effort: never
// blocks or fails the lead flow. Needs these Edge Function secrets (one-time
// Google OAuth setup):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
// Optional:
//   GOOGLE_CONTACT_LABEL   (fallback label for sources not in the map below)
// ---------------------------------------------------------------------------
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') || '';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') || '';
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN') || '';
const GOOGLE_CONTACT_LABEL = Deno.env.get('GOOGLE_CONTACT_LABEL') || 'Website Leads';

// Map each lead source to the Google Contacts label it should be filed under.
const GOOGLE_LABELS: Record<string, string> = {
  fsbo: 'FSBO',
  fsbo_chat: 'FSBO',
  dpa: 'DPA',
  webinar: 'Webinar',
  open_house: 'Open House',
};
const labelForSource = (source: string): string => GOOGLE_LABELS[source] || GOOGLE_CONTACT_LABEL;

// Exchange the long-lived refresh token for a short-lived access token.
async function googleAccessToken(): Promise<string | null> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) return null;
  try {
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: GOOGLE_REFRESH_TOKEN, grant_type: 'refresh_token',
      }),
    });
    if (!r.ok) { console.error(`google token ${r.status}: ${await r.text()}`); return null; }
    const d = await r.json();
    return d.access_token || null;
  } catch (e) { console.error('googleAccessToken error:', e); return null; }
}

// Find the label group, creating it if it doesn't exist. Returns resourceName.
async function googleContactGroup(access: string, name: string): Promise<string | null> {
  try {
    const list = await fetch('https://people.googleapis.com/v1/contactGroups?pageSize=200', {
      headers: { Authorization: `Bearer ${access}` },
    });
    if (list.ok) {
      const d = await list.json();
      const hit = (d.contactGroups || []).find((g: { formattedName?: string; name?: string; resourceName?: string }) =>
        (g.formattedName || g.name) === name);
      if (hit?.resourceName) return hit.resourceName;
    }
    const created = await fetch('https://people.googleapis.com/v1/contactGroups', {
      method: 'POST', headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactGroup: { name } }),
    });
    if (!created.ok) { console.error(`google group ${created.status}: ${await created.text()}`); return null; }
    const cd = await created.json();
    return cd.resourceName || null;
  } catch (e) { console.error('googleContactGroup error:', e); return null; }
}

// Create the lead as a Google Contact and file it under the label. Best-effort.
async function syncGoogleContact(p: {
  firstName: string; lastName: string; email: string; phone: string; source: string;
}): Promise<void> {
  const access = await googleAccessToken();
  if (!access) return; // not configured yet — skip silently
  try {
    const r = await fetch('https://people.googleapis.com/v1/people:createContact', {
      method: 'POST', headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        names: [{ givenName: p.firstName || undefined, familyName: p.lastName || undefined }],
        emailAddresses: p.email ? [{ value: p.email }] : undefined,
        phoneNumbers: p.phone ? [{ value: p.phone }] : undefined,
        biographies: [{ value: `Lead source: ${p.source} • added ${new Date().toISOString().slice(0, 10)}`, contentType: 'TEXT_PLAIN' }],
      }),
    });
    if (!r.ok) { console.error(`google createContact ${r.status}: ${await r.text()}`); return; }
    const person = await r.json();
    const resourceName = person.resourceName;
    const label = labelForSource(p.source);
    if (resourceName && label) {
      const group = await googleContactGroup(access, label);
      if (group) {
        await fetch(`https://people.googleapis.com/v1/${group}/members:modify`, {
          method: 'POST', headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ resourceNamesToAdd: [resourceName] }),
        });
      }
    }
  } catch (e) { console.error('syncGoogleContact error:', e); }
}

// Verify a Cloudflare Turnstile token. INERT (allows everything) until
// TURNSTILE_SECRET is set, and fails OPEN on a Cloudflare outage — so it blocks
// bots without ever blocking a real lead over a network hiccup.
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = Deno.env.get('TURNSTILE_SECRET');
  if (!secret) return true;   // not configured yet -> don't block anything
  if (!token) return true;    // widgets are removed -> no token to verify, allow through
  try {
    const form = new FormData();
    form.append('secret', secret);
    form.append('response', token);
    if (ip) form.append('remoteip', ip);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const d = await r.json();
    return d.success === true;
  } catch (e) {
    console.error('turnstile verify error (allowing through):', e);
    return true;   // Cloudflare unreachable -> fail open, never block a real lead
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
      status: 405, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ ok: false, error: 'Valid email required' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Bot gate — only enforced once TURNSTILE_SECRET is set (inert before that).
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
    const tsToken = String(body.cf_turnstile_token || '');
    if (!(await verifyTurnstile(tsToken, ip))) {
      return new Response(JSON.stringify({ ok: false, error: 'Verification failed. Please refresh and try again.' }), {
        status: 403, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const fullName = String(body.full_name || '').trim();
    const firstName = String(body.first_name || fullName.split(' ')[0] || '').trim();
    const lastName = String(body.last_name || fullName.split(' ').slice(1).join(' ') || '').trim();
    const phone = String(body.phone || '').trim();
    const source = String(body.source || 'unknown').trim();
    const interests: string[] = Array.isArray(body.interests) ? body.interests : [];
    const dest = DEST[source] || '/dashboard';

    // Referral capture. If no name is given, attribute it to "Fate".
    const referredByRaw = String(body.referred_by || '').trim();
    const referredBy = referredByRaw || 'Fate';
    const referralChannel = String(body.referral_channel || '').trim();

    // Open-house sign-in fields (source === 'open_house').
    const propertyAddress = String(body.property_address || body.property || '').trim();
    const workingWithAgent = String(body.working_with_agent || '').trim();
    const financingStatus = String(body.financing_status || '').trim();
    const buyTimeline = String(body.timeline || '').trim();
    const priceRange = String(body.price_range || '').trim();
    const buyerNeeds = String(body.needs || '').trim();

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://portal.smithapprovesme.com';
    const GHL_WEBHOOK_URL = Deno.env.get('GHL_WEBHOOK_URL') || '';

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Create the auth user (ignore "already registered" — that's fine).
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName, phone, source },
    });
    let userId = created?.user?.id;
    if (createErr && !/registered|exists/i.test(createErr.message)) {
      // surface unexpected errors, but keep going for "already exists"
      console.error('createUser error:', createErr.message);
    }

    // 2. Upsert the profile row.
    if (userId) {
      await admin.from('profiles').upsert({
        id: userId, email, full_name: fullName || `${firstName} ${lastName}`.trim(),
        first_name: firstName, last_name: lastName, phone, source, interests,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }

    // 3. Generate the magic link to the matching portal page.
    let magicLink = '';
    const { data: linkData } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${SITE_URL}${dest}?email=${encodeURIComponent(email)}&firstName=${encodeURIComponent(firstName)}` },
    });
    magicLink = linkData?.properties?.action_link || '';

    // 4. Create the lead in GHL.
    //    (a) PRIMARY: direct v2 API upsert — reliably creates a NAMED contact
    //        with its tags. This is the fix for leads landing unnamed.
    //    (b) Then still fire the inbound webhook (if configured) so Scott's
    //        existing GHL automations/workflows keep triggering as before.
    const tags = [
      'New Registration',
      `Source: ${source}`,
      ...(referredByRaw ? [`Referred by: ${referredBy}`] : []),
      ...(referralChannel ? [`Channel: ${referralChannel}`] : []),
      ...(source === 'open_house'
        ? ['Open House Lead', ...(propertyAddress ? [`Property: ${propertyAddress}`] : [])]
        : []),
      ...interests.map((i) => `Interest: ${i}`),
    ];

    // (a) Reliable named-contact creation.
    const lead = await upsertLeadContact({ firstName, lastName, fullName, email, phone, source, tags });
    const ghlOk = lead.ok;
    if (!lead.ok) console.error('GHL lead upsert failed:', lead.error);

    // (b) Fire the inbound webhook for automations (best-effort; not the
    //     source of truth for whether the contact exists).
    if (GHL_WEBHOOK_URL) {
      try {
        const ghlRes = await fetch(GHL_WEBHOOK_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName, lastName, email, phone,
            tags,
            contact_id: lead.id || '',
            customField: {
              source,
              referred_by: referredBy,
              referral_channel: referralChannel,
              property_address: propertyAddress,
              working_with_agent: workingWithAgent,
              financing_status: financingStatus,
              timeline: buyTimeline,
              price_range: priceRange,
              needs: buyerNeeds,
              interests: interests.join(', '),
              portal_user_id: userId || '',
              registration_url: req.headers.get('origin') || '',
              magic_link: magicLink,
              webinar_date: String(body.webinar_date || ''),
              // qualifier answers (DPA / VA / DSCR forms)
              state: String(body.state || ''),
              residence: String(body.residence || ''),
              credit: String(body.credit || ''),
              concern: String(body.concern || ''),
              va_experience: String(body.vaExperience || ''),
              active_or_veteran: String(body.activeOrVeteran || ''),
              consent: body.consent ? 'yes' : '',
            },
          }),
        });
        if (!ghlRes.ok) console.error(`GHL webhook failed ${ghlRes.status}: ${await ghlRes.text()}`);
      } catch (e) {
        console.error('GHL webhook error:', e);
      }
    }

    // Never let a CRM write fail silently — alert Scott to add the lead manually.
    if (!ghlOk) {
      try { await notifyScott(`⚠️ CRM WRITE FAILED — ${source} lead ${email || phone} did not reach GHL. Add them manually.`); } catch (_) {}
    }

    // 4.6 Fire the AI first-touch to claude-router for EVERY source — this is
    //     what sends the welcome email + SMS and starts nurture. It was missing
    //     from this handler, so leads posted here (e.g. FSBO) got no follow-up.
    try {
      if (lead.id) {
        await fireRegistration(lead.id, source, {
          state: String(body.state || ''),
          residence: String(body.residence || ''),
          credit: String(body.credit || ''),
          concern: String(body.concern || ''),
          timeline: buyTimeline,
          price_range: priceRange,
          financing_status: financingStatus,
          working_with_agent: workingWithAgent,
          property_address: propertyAddress,
          referred_by: referredBy,
          referral_channel: referralChannel,
          webinar_date: String(body.webinar_date || ''),
        });
      }
    } catch (e) {
      console.error('claude-router first-touch error:', e);
    }

    // 4.5 Mirror the lead into Google Contacts (best-effort — never blocks the
    //     response; silently skips until the Google secrets are configured).
    try {
      await syncGoogleContact({ firstName, lastName, email, phone, source });
    } catch (e) {
      console.error('google contacts sync error:', e);
    }

    // 5. Text Scott directly so a new lead is never missed (best-effort).
    try {
      const who = (fullName || `${firstName} ${lastName}`.trim() || email || phone);
      const parts = [`🔔 New ${source} lead: ${who}`];
      if (phone) parts.push(phone);
      if (email) parts.push(email);
      if (referralChannel) parts.push(`via ${referralChannel}`);
      if (referredBy && referredBy !== 'Fate') parts.push(`ref: ${referredBy}`);
      if (propertyAddress) parts.push(propertyAddress);
      await notifyScott(parts.join(' · '));
    } catch (e) {
      console.error('notifyScott error:', e);
    }

    return new Response(JSON.stringify({ ok: true, magic_link: magicLink, redirect: `${SITE_URL}${dest}` }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
