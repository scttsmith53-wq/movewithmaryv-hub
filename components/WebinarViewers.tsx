'use client';

// Live "who's watching" list shown during the webinar for social proof.
// Uses Supabase Realtime Presence: each logged-in viewer announces their first
// name on a shared channel and everyone renders the set. It never writes to the
// database (presence is ephemeral) and pads to a friendly minimum so the room
// never looks empty. Names only — no emails or personal info.

import { useEffect, useRef, useState } from 'react';
import { getPortalUser } from '@/lib/auth';
import { createClient } from '@/utils/supabase/client';

const ROOM = 'webinar-viewers';
const MIN_SHOWN = 4; // never show fewer than this (padded with filler when quiet)
const HIDE = ['host', 'moderator', 'mod', 'admin', 'system', 'test', 'scott', 'scarlet', 'guest'];
const FILLER = [
  'Jessica', 'Michael', 'Ashley', 'David', 'Amanda', 'Brandon', 'Sarah', 'Chris',
  'Nicole', 'Ryan', 'Megan', 'Kevin', 'Lauren', 'Justin', 'Rachel', 'Tyler',
  'Stephanie', 'Brian', 'Danielle', 'Jason', 'Melissa', 'Aaron', 'Katie', 'Eric',
  'Vanessa', 'Marcus', 'Brittany', 'Derek', 'Alicia', 'Jordan', 'Grace', 'Diego',
  'Renee', 'Omar', 'Priya', 'Andre', 'Monica', 'Devon', 'Curtis', 'Yolanda',
];

const firstName = (n?: string) => (n || '').trim().split(/\s+/)[0] || '';
const titleCase = (n: string) => (n ? n[0].toUpperCase() + n.slice(1).toLowerCase() : n);

export default function WebinarViewers() {
  const [names, setNames] = useState<string[]>([]);
  const fillerRef = useRef<string[]>([]);

  useEffect(() => {
    // Shuffle the filler once so the padding stays stable across updates.
    const a = [...FILLER];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    fillerRef.current = a;

    const user = getPortalUser();
    const me = titleCase(firstName(user?.firstName || user?.fullName || 'Guest')) || 'Guest';
    const supabase = createClient();
    const key = 'v_' + Math.random().toString(36).slice(2);
    const channel = supabase.channel('presence:' + ROOM, { config: { presence: { key } } });

    function render() {
      const state = channel.presenceState() as Record<string, Array<{ name?: string }>>;
      const seen = new Set<string>();
      const out: string[] = [];
      for (const k in state) {
        for (const p of state[k]) {
          const fn = titleCase(firstName(p.name));
          if (!fn || HIDE.includes(fn.toLowerCase())) continue;
          const dk = fn.toLowerCase();
          if (seen.has(dk)) continue;
          seen.add(dk);
          out.push(fn);
        }
      }
      // Pad to the minimum with stable filler names when the room is quiet.
      for (const f of fillerRef.current) {
        if (out.length >= MIN_SHOWN) break;
        if (seen.has(f.toLowerCase())) continue;
        seen.add(f.toLowerCase());
        out.push(f);
      }
      setNames(out);
    }

    channel
      .on('presence', { event: 'sync' }, render)
      .on('presence', { event: 'join' }, render)
      .on('presence', { event: 'leave' }, render)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') channel.track({ name: me, at: Date.now() });
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!names.length) return null;

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <p className="text-[11px] font-bold uppercase tracking-[.18em] text-gold">Welcome to all our viewers</p>
        <span className="ml-auto text-[11px] font-semibold text-ice/50">{names.length} watching</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {names.map((n, i) => (
          <span
            key={n + i}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-2.5 text-[13px] text-ice/85"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-gold/80 to-gold text-[10px] font-bold text-[#101415]">
              {n[0].toUpperCase()}
            </span>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
