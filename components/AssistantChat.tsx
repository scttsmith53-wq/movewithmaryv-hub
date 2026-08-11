'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getPortalUser } from '@/lib/auth';
import { trackPortalEvent } from '@/lib/portal-events';
import { MessageCircle, X, Send } from 'lucide-react';

const CHAT_URL =
  process.env.NEXT_PUBLIC_ASSISTANT_CHAT_URL ||
  'https://qfhfuesnjfuwfujhvgpa.supabase.co/functions/v1/assistant-chat';

type Msg = { role: 'user' | 'assistant'; content: string };

const GREETING: Msg = {
  role: 'assistant',
  content: "Hi! I'm here to help with anything about buying or selling — down payments, credit, the process, or finding what you need. What's on your mind?",
};

export default function AssistantChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // The webinar/broadcast page has its own fixed, inline chat — don't also show
  // the floating bubble there.
  const hidden = !!pathname && pathname.startsWith('/webinar');

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending, open]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const user = getPortalUser();
    const next = [...messages, { role: 'user', content: text } as Msg];
    setMessages(next);
    setInput('');
    setSending(true);
    trackPortalEvent({ eventType: 'ASSISTANT_CHAT_MESSAGE', metadata: { source: 'portal' } });
    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'portal',
          email: user?.email,
          first_name: user?.firstName,
          messages: next,
        }),
      });
      const d = await res.json().catch(() => ({}));
      const reply = d?.reply || "Sorry — I had trouble with that. Try again, or book a quick one-on-one with Mary.";
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
      if (user?.email) {
        fetch('/api/webinar/qa-note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, firstName: user.firstName, question: text, answer: reply, source: 'assistant' }),
        }).catch(() => {});
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Connection hiccup — please try again.' }]);
    } finally {
      setSending(false);
    }
  }

  if (hidden) return null;

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full bg-gold text-[#101415] shadow-2xl transition hover:-translate-y-0.5"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[60] flex h-[min(560px,75vh)] w-[min(380px,92vw)] flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0b0f10] shadow-2xl">
          <div className="border-b border-white/10 bg-[#101415] px-5 py-4">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Move With Mary V</p>
            <p className="mt-1 text-sm font-bold text-white">Ask me anything</p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`min-w-0 max-w-[85%] whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                    m.role === 'user' ? 'bg-gold text-[#101415]' : 'border border-white/10 bg-white/[.05] text-ice/85'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/10 bg-white/[.05] px-4 py-2.5 text-sm text-ice/50">typing…</div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                rows={1}
                placeholder="Type your question…"
                className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-white/15 bg-[#101415] p-3 text-sm text-white outline-none transition focus:border-gold/60"
              />
              <button
                type="button"
                onClick={send}
                disabled={sending || !input.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold text-[#101415] transition disabled:opacity-50"
                aria-label="Send"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="mt-2 px-1 text-[10px] leading-4 text-ice/40">
              Educational only — not a loan approval, rate quote, or commitment to lend. NMLS #2244351 · Equal Housing Opportunity.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
