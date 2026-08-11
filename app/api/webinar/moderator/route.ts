import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Scarlet — the automated webinar chat moderator.
// The chat client POSTs here every ~15s. This route is self-guarded (atomic
// slot claim) so many clients calling ≈ at most one Scarlet post per interval.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
// Hardcoded to the working calendar (env override removed — a stale
// NEXT_PUBLIC_BOOKING_URL was pointing at a dead calendar).
const bookingUrl = 'https://api.leadconnectorhq.com/widget/booking/U3kW2nB0a5VMixUVbfUN';

const MIN_GAP_S = 20; // min seconds between any two Scarlet posts
const LINK_EVERY_MIN = 8; // post the booking link at most this often
const GREETING_RE =
  /\b(hi|hey|hello|hola|howdy|good (morning|afternoon|evening)|i'?m |i am |my name|from |joining|watching|here|excited|first[- ]?time)\b/i;

function db() {
  return createClient(supabaseUrl as string, supabaseServiceKey as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const INTRO =
  "Hi everyone, I'm Scarlet 👋 — the automated chat moderator for today's webinar. " +
  'Say hi and let us know where you’re watching from! Drop any questions in the chat and Scott will get to them.';

const linkMsg = () =>
  `💡 Want to talk through your own situation one-on-one with Scott? Grab a free time here: ${bookingUrl}`;

function fallbackWelcome(name: string) {
  const n = name && name !== 'Guest' ? name : 'there';
  return `Welcome, ${n}! 👋 So glad you're here — drop any questions in the chat anytime.`;
}

async function aiReply(firstName: string, text: string): Promise<string> {
  if (!anthropicKey) return fallbackWelcome(firstName);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 80,
        system:
          "You are Scarlet, the friendly automated chat moderator for Scott Smith's live First-Time Home Buyer webinar. " +
          'You are an AI — warm and human, but never pretend to be a real person; if asked, say you are an automated moderator. ' +
          'Reply in ONE short, friendly sentence (max ~20 words). Welcome the person, acknowledge their name or city if given, ' +
          'and encourage them to enjoy the webinar and ask questions in chat. ' +
          'NEVER give mortgage rates, APRs, approval/qualification opinions, or financial/legal advice — if asked, say Scott will cover that live or one-on-one. Do not repeat yourself.',
        messages: [{ role: 'user', content: `A guest named ${firstName || 'someone'} just said: "${text}"` }],
      }),
    });
    const d = await res.json().catch(() => ({}));
    const out = d?.content?.[0]?.text?.trim();
    return out || fallbackWelcome(firstName);
  } catch {
    return fallbackWelcome(firstName);
  }
}

// Visit https://portal.smithapprovesme.com/api/webinar/moderator to check Scarlet's setup.
export async function GET() {
  const info: Record<string, unknown> = {
    hasSupabase: !!(supabaseUrl && supabaseServiceKey),
    hasAnthropicKey: !!anthropicKey,
    model,
  };
  if (supabaseUrl && supabaseServiceKey) {
    const supabase = db();
    const room = await supabase.from('webinar_room').select('is_open').eq('id', 1).maybeSingle();
    info.room = { error: room.error?.message ?? null, is_open: room.data?.is_open ?? null };
    const st = await supabase.from('webinar_moderator_state').select('*').eq('id', 1).maybeSingle();
    info.moderatorState = {
      error: st.error?.message ?? null, // "relation ... does not exist" => run webinar_moderator.sql
      exists: !!st.data,
      intro_done: st.data?.intro_done ?? null,
    };
  }
  return NextResponse.json(info);
}

export async function POST() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 });
  }
  const supabase = db();

  // Room must be open.
  const { data: room } = await supabase.from('webinar_room').select('is_open').eq('id', 1).maybeSingle();
  if (!room?.is_open) return NextResponse.json({ ok: true, skip: 'closed' });

  // State + recent messages.
  const { data: state } = await supabase.from('webinar_moderator_state').select('*').eq('id', 1).maybeSingle();
  if (!state) return NextResponse.json({ ok: true, skip: 'no-state' });

  const sinceIso = new Date(Date.now() - 3 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from('webinar_messages')
    .select('id, first_name, body, is_moderator, created_at')
    .eq('hidden', false)
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: true })
    .limit(100);
  const msgs = recent ?? [];
  const userMsgs = msgs.filter((m) => !m.is_moderator);

  // Decide intent: intro > link (when due) > reply.
  let intent: 'intro' | 'link' | 'reply' | null = null;
  let target: (typeof msgs)[number] | null = null;

  if (!state.intro_done && userMsgs.length >= 1) {
    intent = 'intro';
  } else if (state.intro_done) {
    const linkDue =
      (!state.last_link_at || Date.now() - new Date(state.last_link_at).getTime() > LINK_EVERY_MIN * 60 * 1000) &&
      userMsgs.length >= 1;
    if (linkDue) {
      intent = 'link';
    } else {
      const lastReply = state.last_reply_at ? new Date(state.last_reply_at).getTime() : 0;
      const now = Date.now();
      // Newest greeting that's 8–120s old and newer than the last one we replied to.
      for (let i = userMsgs.length - 1; i >= 0; i--) {
        const m = userMsgs[i];
        const age = now - new Date(m.created_at).getTime();
        if (age >= 8000 && age <= 120000 && new Date(m.created_at).getTime() > lastReply && GREETING_RE.test(m.body || '')) {
          intent = 'reply';
          target = m;
          break;
        }
      }
    }
  }

  if (!intent) return NextResponse.json({ ok: true, skip: 'nothing' });

  // Atomically claim the post slot (min-gap guard) so concurrent clients don't double-post.
  const cutoff = new Date(Date.now() - MIN_GAP_S * 1000).toISOString();
  const { data: claim } = await supabase
    .from('webinar_moderator_state')
    .update({ last_post_at: new Date().toISOString() })
    .eq('id', 1)
    .or(`last_post_at.is.null,last_post_at.lt.${cutoff}`)
    .select()
    .maybeSingle();
  if (!claim) return NextResponse.json({ ok: true, skip: 'busy' });

  // Build the message.
  let bodyText = '';
  const patch: Record<string, unknown> = {};
  if (intent === 'intro') {
    bodyText = INTRO;
    patch.intro_done = true;
  } else if (intent === 'link') {
    bodyText = linkMsg();
    patch.last_link_at = new Date().toISOString();
  } else if (intent === 'reply' && target) {
    bodyText = await aiReply(target.first_name || 'there', target.body || '');
    patch.last_reply_at = target.created_at;
  }

  await supabase.from('webinar_messages').insert({
    first_name: 'Scarlet',
    body: bodyText,
    is_moderator: true,
    flagged: false,
  });
  if (Object.keys(patch).length) {
    await supabase.from('webinar_moderator_state').update(patch).eq('id', 1);
  }

  return NextResponse.json({ ok: true, posted: intent });
}
