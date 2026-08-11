'use client';

/**
 * DpaInteractive — compliance-light Down Payment Assistance explainer for /dpa.
 *
 * Avoids naming specific programs, states, lenders, or rates. Two interactive
 * pieces:
 *   1) "Cash to close" slider — shows total cash normally needed, then how the
 *      down payment is covered by assistance and the remaining closing costs can
 *      be covered by additional assistance or seller concessions, leaving as
 *      little as $0 out of pocket.
 *   2) "Could you qualify?" quick check -> an encouraging, non-binding result
 *      and a strategy-call CTA.
 *
 * Styled with the repo design system (card / number-card / kicker / gold + ice).
 */

import { useState } from 'react';
import { trackPortalEvent } from '@/lib/portal-events';
import { money } from '@/lib/calc-format';
import { bookingUrl } from '@/lib/content';

// Single global booking calendar (one source of truth: lib/content.ts).
const STRATEGY_CALL_URL = bookingUrl;

type Choice = { value: string; label: string };
type QId = 'firstTime' | 'credit' | 'timing';

const QUESTIONS: { id: QId; q: string; help: string; options: Choice[] }[] = [
  {
    id: 'firstTime',
    q: 'Is this your first home — or have you not owned one in the last 3 years?',
    help: 'Many assistance options are aimed at first-time buyers, but not all require it.',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
  {
    id: 'credit',
    q: 'Is your credit roughly in the mid-600s or higher?',
    help: 'A ballpark is fine — there are paths to strengthen credit if you are not there yet.',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'Not yet' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
  {
    id: 'timing',
    q: 'When are you hoping to buy?',
    help: 'This helps shape the right plan — there is no wrong answer.',
    options: [
      { value: 'soon', label: 'Next few months' },
      { value: 'year', label: 'Within a year' },
      { value: 'exploring', label: 'Just exploring' },
    ],
  },
];

export default function DpaInteractive() {
  const [price, setPrice] = useState(400000);
  const [sellerTouched, setSellerTouched] = useState(false);
  const [sellerManual, setSellerManual] = useState(0);
  const [ans, setAns] = useState<Partial<Record<QId, string>>>({});

  const TARGET_CASH = 1000;
  const downPmt = price * 0.05;
  const closing = price * 0.03;
  const total = downPmt + closing;
  const autoSeller = Math.max(0, closing - TARGET_CASH);
  const sellerConcession = sellerTouched ? Math.min(sellerManual, closing) : autoSeller;
  const buyerBrings = Math.max(0, total - downPmt - sellerConcession);
  const downPct = (downPmt / total) * 100;
  const sellerPct = (sellerConcession / total) * 100;
  const buyerPct = (buyerBrings / total) * 100;

  const answered = QUESTIONS.every((q) => ans[q.id]);
  const blocked = ans.credit === 'no';

  const pick = (id: QId, value: string) => {
    const next = { ...ans, [id]: value };
    setAns(next);
    if (QUESTIONS.every((q) => next[q.id])) {
      trackPortalEvent({ eventType: 'DPA_QUIZ_COMPLETED', eventValue: 'completed', metadata: next });
    }
  };

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <p className="kicker mb-2">See the difference</p>
        <h2 className="text-2xl font-black">How much would you actually bring to closing?</h2>
        <p className="mt-2 text-ice/65">
          Buyers usually need cash for a down payment plus closing costs. Assistance and seller
          concessions can cover most — or all — of it. Slide to a price you have in mind.
        </p>

        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-extrabold uppercase tracking-wide text-ice/60">Home price</label>
            <span className="text-lg font-black text-gold">{money(price)}</span>
          </div>
          <input
            type="range" min={150000} max={800000} step={5000} value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            onMouseUp={() => trackPortalEvent({ eventType: 'DPA_SLIDER_USED', eventValue: String(price) })}
            className="mt-2 w-full" style={{ accentColor: '#c9962b' }}
            aria-label="Home price"
          />
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-extrabold uppercase tracking-wide text-ice/60">Seller concessions <span className="text-ice/40">(negotiated by your agent)</span></label>
            <span className="text-lg font-black text-gold">{money(sellerConcession)}</span>
          </div>
          <input
            type="range" min={0} max={Math.round(closing)} step={500} value={sellerConcession}
            onChange={(e) => { setSellerManual(Number(e.target.value)); setSellerTouched(true); }}
            onMouseUp={() => trackPortalEvent({ eventType: 'DPA_SELLER_CONCESSION_USED', eventValue: String(Math.round(sellerConcession)) })}
            className="mt-2 w-full" style={{ accentColor: '#c9962b' }}
            aria-label="Seller concessions"
          />
          <p className="mt-1 text-[11px] text-ice/45">Seller-paid closing costs your agent negotiates into your offer. Auto-set so you bring about $1,000 \u2014 slide to see how it changes.</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="number-card">
            <p className="text-xs text-ice/55">Cash normally needed</p>
            <p className="mt-1 text-3xl font-black text-[#e0a44b]">{money(total)}</p>
            <p className="mt-1 text-[11px] text-ice/45">Down payment + closing costs</p>
          </div>
          <div className="number-card border-gold/50 shadow-glow">
            <p className="text-xs text-ice/55">You bring to closing, as little as</p>
            <p className="mt-1 text-3xl font-black text-mint">{money(buyerBrings)}</p>
            <p className="mt-1 text-[11px] text-ice/45">With assistance + seller concessions</p>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ice/60">How it gets covered</p>
          <div className="flex h-4 overflow-hidden rounded-full bg-white/10">
            <span className="bg-gold" style={{ width: `${downPct}%` }} />
            <span className="bg-sky" style={{ width: `${sellerPct}%` }} />
            <span className="bg-white/20" style={{ width: `${buyerPct}%` }} />
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-start gap-2 text-sm text-ice/75">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gold" aria-hidden />
              <span><strong className="text-white">{money(downPmt)} down payment</strong> — covered by down payment assistance.</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-ice/75">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sky" aria-hidden />
              <span><strong className="text-white">{money(sellerConcession)} closing costs</strong> — covered by seller-paid concessions you negotiate into the contract.</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-ice/75">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-white/40" aria-hidden />
              <span><strong className="text-white">{money(buyerBrings)}</strong> — what you bring to closing.</span>
            </div>
          </div>
        </div>

        <p className="mt-4 rounded-2xl border border-gold/25 bg-gold/[.07] p-4 text-sm leading-6 text-ice/80">
          Down payment assistance can cover your down payment, and <strong className="text-gold">seller-paid
          closing costs</strong> (concessions you negotiate in your offer) can cover most of the rest — so you
          may bring as little as <strong className="text-gold">{money(buyerBrings)}</strong> to closing.
        </p>

        <p className="mt-3 text-[11px] leading-5 text-ice/45">
          Illustration only. Seller concessions are negotiated in every purchase contract and are different for everyone — your agent negotiates them in your offer. They are capped by loan
          type (for example, FHA allows up to 6%; conventional caps vary by down payment). Actual assistance,
          closing costs, and concessions vary by program, loan, location, and contract. Not a commitment to lend
          or an offer of assistance.
        </p>
      </section>

      <section className="card p-6">
        <p className="kicker mb-2">2-minute check</p>
        <h2 className="text-2xl font-black">Could you qualify for help?</h2>
        <p className="mt-2 text-ice/65">
          A few quick questions — no contact info needed to see your result.
        </p>

        <div className="mt-5 space-y-5">
          {QUESTIONS.map((q, i) => (
            <div key={q.id}>
              <p className="text-sm font-bold text-white">{i + 1}. {q.q}</p>
              <p className="mb-2 text-xs text-ice/50">{q.help}</p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((o) => {
                  const on = ans[q.id] === o.value;
                  return (
                    <button
                      key={o.value} type="button" onClick={() => pick(q.id, o.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${on ? 'border-gold/60 bg-gold/15 text-gold' : 'border-white/12 text-ice/70 hover:border-gold/30'}`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {answered && (
          <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/[.08] p-5">
            <p className="text-lg font-black text-gold">
              {blocked ? 'You may be closer than you think.' : 'Good news — buyers like you often qualify for help.'}
            </p>
            <p className="mt-2 text-sm leading-6 text-ice/75">
              {blocked
                ? 'Some assistance has credit guidelines, but there are real paths to get there — often faster than people expect. A short call can map out the steps and the programs that would fit once you do.'
                : 'Buyers in your situation frequently have down payment assistance options available. The exact fit depends on where you are buying, your income, and your loan type — which is exactly what a quick strategy call sorts out.'}
            </p>
            <a
              href={STRATEGY_CALL_URL} target="_blank" rel="noopener noreferrer"
              onClick={() => trackPortalEvent({ eventType: 'STRATEGY_CALL_CLICKED', eventValue: 'DPA quiz result' })}
              className="btn-primary mt-4"
            >
              Find my options on a call →
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
