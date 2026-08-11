import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Host control: open/close the webinar chat room (which also drives the live
// video + chat availability). Authorized against WEBINAR_ADMIN_EMAILS.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admins = (process.env.WEBINAR_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 });
  }
  const { action, email } = (await request.json().catch(() => ({}))) as {
    action?: string;
    email?: string;
  };
  const e = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!e || !admins.includes(e)) {
    return NextResponse.json({ ok: false, error: 'Not authorized' }, { status: 403 });
  }
  if (action !== 'open' && action !== 'close') {
    return NextResponse.json({ ok: false, error: 'Bad action' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
  const patch =
    action === 'open' ? { is_open: true, opened_at: new Date().toISOString() } : { is_open: false };
  const { error } = await supabase.from('webinar_room').update(patch).eq('id', 1);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // Opening a session: start the chat fresh (hide prior messages) + reset Scarlet.
  if (action === 'open') {
    await supabase.from('webinar_messages').update({ hidden: true }).eq('hidden', false);
    await supabase
      .from('webinar_moderator_state')
      .update({ intro_done: false, last_post_at: null, last_link_at: null, last_reply_at: null })
      .eq('id', 1);
  }

  return NextResponse.json({ ok: true, is_open: action === 'open' });
}
