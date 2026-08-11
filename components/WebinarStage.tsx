'use client';

// Watch-party layout for the webinar: video + a tabbed chat rail (Live Chat +
// Live Q&A), plus a Theater mode that fills the screen while keeping the chat
// visible. When the webinar isn't live (room closed), we show a branded
// placeholder instead of YouTube's "video unavailable" error.

import { useEffect, useState } from 'react';
import { Maximize2, Minimize2, PlayCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import WebinarPresence from '@/components/WebinarPresence';
import WebinarViewers from '@/components/WebinarViewers';
import WebinarChat from '@/components/WebinarChat';
import WebinarLiveChat from '@/components/WebinarLiveChat';
import { webinarReplayUrl } from '@/lib/content';

const VIDEO_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
const REPLAY_URL = webinarReplayUrl;
const replayValid = /^https?:\/\//i.test(REPLAY_URL);

const tabBase = 'flex-1 rounded-lg px-3 py-2 text-xs font-bold transition';
const tabActive = `${tabBase} bg-gold text-[#101415]`;
const tabIdle = `${tabBase} border border-white/12 text-ice/70 hover:text-white`;

export default function WebinarStage({ embedUrl }: { embedUrl?: string }) {
  const [tab, setTab] = useState<'chat' | 'qa'>('chat');
  const [theater, setTheater] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const [replayEmbed, setReplayEmbed] = useState<string | null>(replayValid ? REPLAY_URL : null);

  // The webinar is "live" when the chat room is open (Scott flips this before going live).
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    async function check() {
      const { data } = await supabase.from('webinar_room').select('is_open').eq('id', 1).maybeSingle();
      if (!cancelled) setLive(Boolean(data?.is_open));
    }
    check();
    const t = setInterval(check, 20000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  // When off-air, default the rail to Q&A (the live group chat is quiet then,
  // but people can still drop questions). Flip back to Live Chat when we go live.
  useEffect(() => {
    if (live === true) setTab('chat');
    else if (live === false) setTab('qa');
  }, [live]);

  // Pinned replay wins; otherwise pull the newest auto-recorded replay.
  useEffect(() => {
    if (replayValid) return; // a pinned replay is already showing
    let cancelled = false;
    fetch('/api/webinar/latest-replay')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d?.ok && d.iframe) setReplayEmbed(d.iframe);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const videoInner =
    embedUrl && live === true ? (
      <iframe
        src={embedUrl}
        title="Move With Mary V — Live Webinar"
        allow={VIDEO_ALLOW}
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    ) : replayEmbed ? (
      <iframe
        src={replayEmbed}
        title="Move With Mary V — Latest Replay"
        allow={VIDEO_ALLOW}
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    ) : (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#061426] px-6 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl border border-gold/40 bg-gold/10 text-gold">
          <PlayCircle size={30} />
        </div>
        <div>
          <p className="font-serif text-2xl font-bold text-white sm:text-3xl">The First-Time Buyer Webinar</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ice/65">
            We’re not live right now. Join us live every{' '}
            <span className="font-bold text-ice/85">Tuesday at 7:00 PM Mountain Time</span> — see you there!
          </p>
        </div>
        {replayValid ? (
          <a
            href={REPLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-[#101415] transition hover:-translate-y-0.5"
          >
            Watch the latest replay ↗
          </a>
        ) : null}
      </div>
    );

  const rail = (
    <div
      className={`flex min-h-0 flex-col ${
        theater ? 'flex-1 lg:h-full lg:w-[380px] lg:flex-none' : 'h-[560px]'
      }`}
    >
      <div className="mb-2 flex gap-2">
        <button type="button" onClick={() => setTab('chat')} className={tab === 'chat' ? tabActive : tabIdle}>
          Live Chat
        </button>
        <button type="button" onClick={() => setTab('qa')} className={tab === 'qa' ? tabActive : tabIdle}>
          Live Q&amp;A
        </button>
      </div>
      <div className={`min-h-0 flex-1 ${tab === 'chat' ? '' : 'hidden'}`}>
        <WebinarLiveChat />
      </div>
      <div className={`min-h-0 flex-1 ${tab === 'qa' ? '' : 'hidden'}`}>
        <WebinarChat />
      </div>
    </div>
  );

  async function enterTheater() {
    setTheater(true);
    try {
      if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const o = (screen as any).orientation;
      if (o?.lock) await o.lock('landscape');
    } catch {
      /* orientation/fullscreen lock unsupported (e.g. iOS Safari) — landscape layout still applies */
    }
  }
  function exitTheater() {
    setTheater(false);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (screen as any).orientation?.unlock?.();
    } catch {
      /* ignore */
    }
    try {
      if (document.fullscreenElement) document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }

  if (theater) {
    // Landscape watch layout (works on phones held sideways): video ~2/3, chat ~1/3.
    return (
      <div className="fixed inset-0 z-[80] flex flex-col gap-2 bg-[#0b0f10] p-2 sm:p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-gold sm:text-[11px]">Live Webinar — Theater</p>
          <button
            type="button"
            onClick={exitTheater}
            className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-ice/80 hover:text-white"
          >
            <Minimize2 size={14} /> Exit
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-row gap-2 sm:gap-4">
          <div className="relative min-h-0 flex-[2] overflow-hidden rounded-2xl bg-black">
            {videoInner}
          </div>
          {rail}
        </div>
        {live === true && <WebinarViewers />}
        <WebinarPresence />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={enterTheater}
          className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-ice/80 hover:text-white"
        >
          <Maximize2 size={14} /> Theater mode
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-stretch">
        <section className="card overflow-hidden p-3 sm:p-4">
          <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{ paddingTop: '56.25%' }}>
            {videoInner}
          </div>
          <p className="mt-3 px-2 text-sm text-ice/60">
            Live every Tuesday at 7:00 PM Mountain Time. For the best view with chat, use{' '}
            <span className="font-bold text-ice/80">Theater mode</span> above (not the video’s fullscreen button).
          </p>
          {live === true && <WebinarViewers />}
          <WebinarPresence />
        </section>
        {rail}
      </div>
    </div>
  );
}
