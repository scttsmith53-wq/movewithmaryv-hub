'use client';

import { useState, useEffect, useRef } from 'react';
import { getPortalUser } from '@/lib/auth';
import { trackPortalEvent } from '@/lib/portal-events';

const ASK_URL =
  process.env.NEXT_PUBLIC_ASK_URL ||
  'https://qfhfuesnjfuwfujhvgpa.supabase.co/functions/v1/ask';

// Cloudflare Turnstile site key (public). Set NEXT_PUBLIC_TURNSTILE_SITE_KEY in
// Amplify to turn on the bot check. Until it's set, the widget is skipped.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

type Props = {
  source?: string;
  triggerLabel?: string;
  triggerClassName?: string;
};

export default function AskQuestion({
  source = 'portal',
  triggerLabel = 'Ask Mary a Question',
  triggerClassName = '',
}: Props) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [token, setToken] = useState('');
  const widgetRef = useRef<HTMLDivElement>(null);

  // Render the Turnstile widget when the form opens (only if a site key is set).
  useEffect(() => {
    if (!open || !TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    const render = () => {
      const ts = (window as any).turnstile;
      if (ts && widgetRef.current && !widgetRef.current.hasChildNodes()) {
        ts.render(widgetRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'dark',
          callback: (t: string) => setToken(t),
          'expired-callback': () => setToken(''),
        });
      }
    };
    if ((window as any).turnstile) { render(); return; }
    const id = 'cf-turnstile-script';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id;
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      s.async = true; s.defer = true;
      s.onload = () => { if (!cancelled) render(); };
      document.head.appendChild(s);
    } else {
      const poll = setInterval(() => {
        if ((window as any).turnstile) { clearInterval(poll); if (!cancelled) render(); }
      }, 200);
      return () => { cancelled = true; clearInterval(poll); };
    }
    return () => { cancelled = true; };
  }, [open]);

  async function submit() {
    const text = question.trim();
    if (!text) return;
    if (TURNSTILE_SITE_KEY && !token) { setStatus('error'); return; }
    setStatus('sending');
    const user = getPortalUser();
    try {
      const res = await fetch(ASK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          email: user?.email,
          first_name: user?.firstName,
          last_name: user?.lastName,
          full_name: user?.fullName,
          phone: user?.phone,
          source,
          cf_turnstile_token: token,
        }),
      });
      if (!res.ok) throw new Error('failed');
      trackPortalEvent({ eventType: 'QUESTION_SUBMITTED', metadata: { source } });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>
    );
  }

  if (status === 'done') {
    return (
      <div className="w-full rounded-2xl border border-gold/30 bg-gold/10 p-5 text-sm leading-6 text-white/80">
        Got it! We just sent an answer to your <strong>email</strong>{' '}
        <span className="text-white/60">(and a text, if you shared your number)</span>. Mary will also follow up with you personally &mdash; feel free to reply anytime.
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-white/15 bg-[#0b0f10]/70 p-5">
      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[.18em] text-gold">
        Your question for Mary
      </label>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={4}
        placeholder="Ask anything — pricing, offers, inspections, paperwork…"
        className="w-full rounded-xl border border-white/15 bg-[#101415] p-3 text-sm text-white outline-none transition focus:border-gold/60"
      />
      {status === 'error' && (
        <p className="mt-2 text-xs text-red-400">Something went wrong — please complete the verification and try again.</p>
      )}
      {TURNSTILE_SITE_KEY && <div ref={widgetRef} className="mt-3" />}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={status === 'sending' || !question.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-bold uppercase tracking-[.08em] text-[#101415] transition disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Send Question'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-bold uppercase tracking-[.08em] text-white/55 transition hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
