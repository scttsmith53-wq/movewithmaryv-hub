'use client';

// -----------------------------------------------------------------------------
// Open-house sign-in.  QR -> phone -> this page.
//
// One page serves every open house: set the address via URL, e.g.
//   /open-house?property=123%20Main%20St%2C%20Denver
// Generate a QR code to that URL per listing.
//
// On submit it posts to the same register/hyper-handler function as the landing
// pages with source: 'open_house', so the lead drops into the Open House funnel
// in GHL (tagged "Open House Lead" + "Property: <address>") with all qualifiers.
// -----------------------------------------------------------------------------

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

const REGISTER_URL = 'https://qfhfuesnjfuwfujhvgpa.supabase.co/functions/v1/hyper-handler';
const SUPABASE_KEY = 'sb_publishable_YnBBmClE9jpZMKN-OMuFWA_NB3oGOMv';
const CONSENT_TEXT =
  'I agree to be contacted by Mary Vega / Keller Williams about this home and others like it by phone, text, and email. No obligation; reply STOP to opt out.';

const AGENT_OPTS = ['No, not yet', 'Yes, I have an agent', 'Just started looking'];
const FINANCE_OPTS = ['Pre-approved', 'Need a lender', 'Paying cash', 'Not sure yet'];
const TIMELINE_OPTS = ['ASAP', '1–3 months', '3–6 months', 'Just browsing'];
const PRICE_OPTS = ['Under $300k', '$300k–$400k', '$400k–$500k', '$500k–$650k', '$650k–$800k', '$800k+'];

const inputCls =
  'w-full rounded-xl border border-white/15 bg-[#101415] px-4 py-3.5 text-base text-white outline-none transition focus:border-gold/60';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-white/70">{label}</span>
      {children}
    </label>
  );
}

function OpenHouseForm() {
  const params = useSearchParams();
  const property = (params.get('property') || params.get('address') || '').trim();

  const [f, setF] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    agent: '', financing: '', timeline: '', price: '', needs: '',
  });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [err, setErr] = useState('');

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  async function submit() {
    setErr('');
    if (!f.firstName.trim() || !f.email.includes('@')) return setErr('Please enter your name and a valid email.');
    if (!consent) return setErr('Please check the box so Mary can send you info.');
    setStatus('sending');
    try {
      const res = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({
          full_name: `${f.firstName} ${f.lastName}`.trim(),
          first_name: f.firstName.trim(),
          last_name: f.lastName.trim(),
          email: f.email.trim(),
          phone: f.phone.trim(),
          source: 'open_house',
          interests: ['open_house'],
          referral_channel: 'Open House',
          property_address: property,
          working_with_agent: f.agent,
          financing_status: f.financing,
          timeline: f.timeline,
          price_range: f.price,
          needs: f.needs.trim(),
          consent: true,
          consent_text: CONSENT_TEXT,
        }),
      });
      if (!res.ok) throw new Error('register failed');
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'generate_lead', { method: 'open_house' });
      }
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', { content_name: 'Open House' });
      }
      setStatus('done');
    } catch {
      setStatus('idle');
      setErr('Something went wrong. Please try again.');
    }
  }

  if (status === 'done') {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mb-5 text-5xl">🤝</div>
        <h1 className="font-serif text-3xl font-bold text-white">Great meeting you, {f.firstName}!</h1>
        <p className="mt-3 text-base leading-7 text-white/70">
          I&apos;ll follow up with details on{' '}
          {property ? <span className="text-gold">{property}</span> : 'this home'} and others that fit what you&apos;re
          looking for. Save my info so you can reach me anytime.
        </p>
        <a
          href="/scott-smith.vcf"
          download="Scott-Smith.vcf"
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[.08em] text-[#101415]"
        >
          📇 Save my contact card
        </a>
        <a
          href={`/dashboard?email=${encodeURIComponent(f.email.trim())}&firstName=${encodeURIComponent(f.firstName.trim())}`}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold/45 px-6 py-3.5 text-sm font-bold uppercase tracking-[.08em] text-gold transition hover:bg-gold hover:text-[#101415]"
        >
          Explore your buyer hub →
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-gold/10 text-xl font-bold tracking-wide text-gold">
          SS
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[.25em] text-gold">Hi, I&apos;m Mary 👋</p>
        <h1 className="mt-2 font-serif text-4xl font-bold leading-tight text-white">Nice to meet you!</h1>
        {property ? (
          <p className="mt-3 rounded-xl border border-gold/25 bg-gold/[.07] px-4 py-2.5 text-sm text-ice/85">
            Welcome to <span className="font-bold text-gold">{property}</span> — so glad you stopped by.
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-6 text-white/55">
          Sign in below and I&apos;ll send you the details on this home plus others like it. No pressure — I&apos;m just here to help.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[.04] p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3">
          <input className={inputCls} placeholder="First name" autoComplete="given-name" value={f.firstName} onChange={set('firstName')} />
          <input className={inputCls} placeholder="Last name" autoComplete="family-name" value={f.lastName} onChange={set('lastName')} />
        </div>
        <input className={inputCls} type="email" inputMode="email" placeholder="Email" autoComplete="email" value={f.email} onChange={set('email')} />
        <input className={inputCls} type="tel" inputMode="tel" placeholder="Phone" autoComplete="tel" value={f.phone} onChange={set('phone')} />

        <Field label="Are you working with an agent?">
          <select className={inputCls} value={f.agent} onChange={set('agent')}>
            <option value="">Select…</option>
            {AGENT_OPTS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Financing">
          <select className={inputCls} value={f.financing} onChange={set('financing')}>
            <option value="">Select…</option>
            {FINANCE_OPTS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Timeline">
            <select className={inputCls} value={f.timeline} onChange={set('timeline')}>
              <option value="">Select…</option>
              {TIMELINE_OPTS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Price range">
            <select className={inputCls} value={f.price} onChange={set('price')}>
              <option value="">Select…</option>
              {PRICE_OPTS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
        <Field label="What are you looking for?">
          <input className={inputCls} placeholder="e.g. 3 bed / 2 bath, big yard, near schools" value={f.needs} onChange={set('needs')} />
        </Field>

        <label className="flex gap-2.5 text-xs leading-5 text-white/55">
          <input type="checkbox" className="mt-0.5 shrink-0" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>{CONSENT_TEXT}</span>
        </label>

        {err ? <p className="text-sm font-semibold text-red-400">{err}</p> : null}

        <button
          type="button"
          onClick={submit}
          disabled={status === 'sending'}
          className="w-full rounded-xl bg-gold py-4 text-base font-bold uppercase tracking-[.08em] text-[#101415] transition disabled:opacity-50"
        >
          {status === 'sending' ? 'One moment…' : 'Get the Details →'}
        </button>
      </div>

      <p className="mx-auto mt-4 max-w-md text-center text-[10px] leading-4 text-white/35">
        Mary Vega, Keller Williams · Financing by Scott Smith, Citywide Home Mortgage, NMLS #2244351 · Equal Housing
        Opportunity. Educational only — not a loan approval or commitment to lend.
      </p>
    </div>
  );
}

export default function OpenHousePage() {
  return (
    <div className="min-h-screen bg-[#0b0f10] px-4 py-10 sm:py-14">
      <Suspense fallback={<div className="text-center text-white/50">Loading…</div>}>
        <OpenHouseForm />
      </Suspense>
    </div>
  );
}
