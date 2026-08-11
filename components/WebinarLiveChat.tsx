'use client';

// Webinar Live Chat — public group chat during the live webinar.
// Reads (history + live) come straight from Supabase Realtime with the
// publishable key (RLS allows reading non-hidden rows). Writes go through
// /api/webinar/chat (service role), matching how the rest of the portal writes.

import { useEffect, useRef, useState } from 'react';
import { getPortalUser } from '@/lib/auth';
import { trackPortalEvent } from '@/lib/portal-events';
import { createClient } from '@/utils/supabase/client';
import { Send } from 'lucide-react';

type ChatMessage = {
  id: string;
  first_name: string;
  city: string | null;
  body: string;
  hidden: boolean;
  is_moderator?: boolean;
  created_at: string;
};

const MAX_LEN = 280;
const HOUSE_RULES =
  "Keep it fun. Please don't post interest rates or personal financial details here — for anything private, use the Q&A or a one-on-one with Scott.";

// Renders a URL as a clickable link with a one-tap Copy button (so booking links
// Scarlet posts are both clickable AND easy to copy on mobile).
function LinkChip({ url, showCopy }: { url: string; showCopy?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-1.5 align-middle">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-gold underline underline-offset-2 break-all [overflow-wrap:anywhere]"
      >
        {url}
      </a>
      {showCopy ? (
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              /* clipboard blocked — the link is still selectable */
            }
          }}
          className="shrink-0 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold transition hover:bg-gold/30"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      ) : null}
    </span>
  );
}

// Turns plain-text message bodies into text + clickable links.
function Linkified({ text, showCopy }: { text: string; showCopy?: boolean }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^(https?:\/\/[^\s]*?)([.,;:!?)\]}'"]*)$/);
        if (m && /^https?:\/\//.test(part)) {
          return (
            <span key={i}>
              <LinkChip url={m[1]} showCopy={showCopy} />
              {m[2]}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function WebinarLiveChat() {
  const [open, setOpen] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function refresh() {
      const { data: room } = await supabase
        .from('webinar_room')
        .select('is_open')
        .eq('id', 1)
        .maybeSingle();
      if (!cancelled) setOpen(Boolean(room?.is_open));

      const { data: rows } = await supabase
        .from('webinar_messages')
        .select('*')
        .eq('hidden', false)
        .order('created_at', { ascending: true })
        .limit(300);
      if (cancelled || !rows) return;
      setMessages((prev) => {
        // Server truth (excludes hidden) so a "Go live" reset actually clears old
        // messages — while keeping just-sent local messages that aren't in this
        // fetch yet (< 5s old) so they don't flicker.
        const next = rows as ChatMessage[];
        const serverIds = new Set(next.map((m) => m.id));
        const fiveSecAgo = new Date(Date.now() - 5000).toISOString();
        const localExtra = prev.filter((m) => !serverIds.has(m.id) && m.created_at > fiveSecAgo);
        const merged = localExtra.length ? [...next, ...localExtra] : next;
        if (prev.length === merged.length && prev.every((m, i) => m.id === merged[i].id)) return prev;
        return merged;
      });
    }

    refresh();
    // Poll as a fallback so every viewer sees new messages even if Realtime lags.
    const poll = setInterval(refresh, 4000);

    const channel = supabase
      .channel('webinar-live-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'webinar_messages' },
        ({ new: row }) => {
          const m = row as ChatMessage;
          if (m.hidden) return;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        }
      )
      .subscribe();

    // Nudge Scarlet (the AI moderator). Server-side guarded, so many clients ≈ one post.
    const mod = setInterval(() => {
      fetch('/api/webinar/moderator', { method: 'POST' }).catch(() => {});
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(poll);
      clearInterval(mod);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim().slice(0, MAX_LEN);
    if (!text || sending) return;
    const user = getPortalUser();
    setSending(true);
    setError('');
    setInput('');

    try {
      const res = await fetch('/api/webinar/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: user?.firstName || 'Guest',
          email: user?.email,
          body: text,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d?.message) {
        // Show it right away; dedupe in case Realtime also delivers it.
        setMessages((prev) =>
          prev.some((x) => x.id === d.message.id) ? prev : [...prev, d.message as ChatMessage]
        );
        trackPortalEvent({
          eventType: 'WEBINAR_LIVE_CHAT_POSTED',
          metadata: { source: 'webinar_live_chat' },
        });
      } else {
        setInput(text); // restore on failure
        setError(
          d?.error === 'Room is closed'
            ? 'The chat room is closed right now.'
            : d?.error
              ? `Couldn’t send: ${d.error}`
              : 'Message didn’t send — try again.'
        );
      }
    } catch {
      setInput(text);
      setError('Connection hiccup — try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="card flex h-full min-h-[460px] flex-col overflow-hidden p-0">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Live Chat</p>
        <p className="mt-1 text-sm font-bold text-white">Say hi to the room 👋</p>
        <p className="mt-1 text-[11px] leading-4 text-ice/45">{HOUSE_RULES}</p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden px-5 py-4">
        {open === false && messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-ice/50">
            💬 Chat opens when we go live. See you at the webinar!
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.is_moderator
                ? 'rounded-2xl border border-gold/40 bg-gold/10 px-4 py-2.5'
                : 'rounded-2xl border border-white/10 bg-white/[.05] px-4 py-2.5'
            }
          >
            <p className="text-[11px] font-bold text-gold">
              {m.first_name}
              {m.is_moderator ? (
                <span className="ml-1.5 rounded bg-gold px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#101415]">
                  Moderator
                </span>
              ) : m.city ? (
                <span className="font-normal text-ice/50"> · {m.city}</span>
              ) : null}
            </p>
            <p className="mt-0.5 whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-6 text-ice/85"><Linkified text={m.body} showCopy={m.is_moderator} /></p>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_LEN))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={open === false ? 'Chat opens when we go live…' : 'Say hi and drop your city 📍'}
            disabled={open === false}
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-white/15 bg-[#101415] p-3 text-sm text-white outline-none transition focus:border-gold/60 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || !input.trim() || open === false}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold text-[#101415] transition disabled:opacity-50"
            aria-label="Send"
          >
            <Send size={18} />
          </button>
        </div>
        {error ? <p className="mt-1.5 px-1 text-[11px] text-red-400">{error}</p> : null}
        <p className="mt-2 px-1 text-[10px] leading-4 text-ice/40">
          Public chat — visible to everyone in the room. Educational only. Scott Smith NMLS #2244351 · Equal Housing Opportunity.
        </p>
      </div>
    </section>
  );
}
