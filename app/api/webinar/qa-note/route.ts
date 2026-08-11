import { NextRequest, NextResponse } from 'next/server';

// Logs an AI Q&A exchange to GHL as a contact note (matched by email).
// Forwards to a GHL Inbound Webhook; a GHL workflow upserts the contact + adds the note.
//
// SET THIS: paste your GHL inbound-webhook URL below (or set GHL_QA_NOTE_WEBHOOK_URL in env).
// It's an endpoint, not a secret, so hardcoding here is fine.
const GHL_QA_NOTE_WEBHOOK_URL = process.env.GHL_QA_NOTE_WEBHOOK_URL || '';

function clean(v: unknown, max = 4000) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export async function POST(request: NextRequest) {
  // Best-effort: never surface errors to the chat UI.
  if (!GHL_QA_NOTE_WEBHOOK_URL) return NextResponse.json({ ok: false, reason: 'not-configured' });

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    firstName?: string;
    question?: string;
    answer?: string;
    source?: string;
  };

  const email = clean(body.email, 200).toLowerCase();
  const question = clean(body.question, 1500);
  const answer = clean(body.answer, 2500);
  const source = clean(body.source, 60) || 'portal';
  if (!email || !email.includes('@') || !question) {
    return NextResponse.json({ ok: false, reason: 'missing-fields' });
  }

  const stamp = new Date().toLocaleString('en-US', { timeZone: 'America/Denver' });
  const note = `🤖 AI chat (${source}) · ${stamp}\nQ: ${question}\nA: ${answer}`;

  try {
    await fetch(GHL_QA_NOTE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        first_name: clean(body.firstName, 60),
        source,
        question,
        answer,
        note,
      }),
    });
  } catch {
    // ignore — logging must never block the chat
  }
  return NextResponse.json({ ok: true });
}
