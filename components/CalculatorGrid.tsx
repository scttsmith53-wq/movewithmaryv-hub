'use client';

/**
 * CalculatorGrid — guided "Homebuyer Tools" page for /calculators.
 * Slider-driven, live-updating, shared BuyerProfile cross-population.
 * Formulas audited June 2026 (see Calculator_Fixes_Prompt.md).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { trackPortalEvent } from '@/lib/portal-events';
import { money, monthLabel, monthlyPayment } from '@/lib/calc-format';
import { BuyerProfileProvider, useBuyerProfile, totalMonthlyDebts } from '@/lib/buyer-profile';
import { bookingUrl } from '@/lib/content';
import { Home, Wallet, Map, RefreshCw, Car, CreditCard, Coins, GraduationCap } from 'lucide-react';

// Single global booking calendar (one source of truth: lib/content.ts).
const STRATEGY_CALL_URL = bookingUrl;

type Tone = 'default' | 'gold' | 'green' | 'warn' | 'red';
const TONE: Record<Tone, string> = {
  default: 'text-white', gold: 'text-gold', green: 'text-mint', warn: 'text-[#e0a44b]', red: 'text-[#e06b5a]',
};
const pctFmt = (n: number) => `${n}%`;
const pct3 = (n: number) => `${n.toFixed(3)}%`;

// Shared "check today's rate" helper with a compliance-safe disclaimer.
const RATE_HELP = (
  <>Check today&apos;s U.S. average at <a href="https://www.mortgagenewsdaily.com/mortgage-rates" target="_blank" rel="noopener noreferrer" className="font-semibold text-gold hover:underline">Mortgage News Daily</a> — averages change daily and are not a quote; your rate depends on credit, loan type, and down payment.</>
);

/** Max purchase price from income + debts (50% back-end DTI, 30yr). */
function maxPrice(incomeMonthly: number, debts: number, ratePct: number, downPct: number): number {
  const maxPITI = incomeMonthly * 0.5 - debts;
  if (maxPITI <= 0 || incomeMonthly <= 0) return 0;
  const maxPI = maxPITI * 0.82;               // reserve ~18% for taxes/insurance/PMI
  const pf = monthlyPayment(1, ratePct, 360); // P&I per $1 of loan
  const loan = maxPI / pf;
  return loan / (1 - downPct / 100);
}

function useMark(eventType: string) {
  const sent = useRef(false);
  return (metadata?: Record<string, unknown>) => {
    if (sent.current) return;
    sent.current = true;
    trackPortalEvent({ eventType, metadata });
  };
}

function Slider({ label, value, onChange, min, max, step = 1, fmt = (n: number) => String(n), help, linked }:
  { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; fmt?: (n: number) => string; help?: React.ReactNode; linked?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ice/60">
          {label}{linked ? <span title="Shared across your tools" className="text-[10px] text-gold/70" aria-label="shared across tools">↔</span> : null}
        </label>
        <span className="text-sm font-black text-gold">{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full" style={{ accentColor: '#c9962b' }} aria-label={label} />
      {help ? <p className="mt-1 text-[11px] leading-4 text-ice/45">{help}</p> : null}
    </div>
  );
}

function Segmented({ label, value, onChange, options }:
  { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-ice/60">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o.value;
          return (
            <button key={o.value} type="button" onClick={() => onChange(o.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? 'border-gold/60 bg-gold/15 text-gold' : 'border-white/12 text-ice/65 hover:border-gold/30'}`}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Tile({ label, value, tone = 'default' }: { label: string; value: string; tone?: Tone }) {
  return (
    <div className="number-card flex items-center justify-between gap-3">
      <span className="text-xs text-ice/55">{label}</span>
      <strong className={`text-lg font-black tracking-tight ${TONE[tone]}`}>{value}</strong>
    </div>
  );
}
function Insight({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-gold/25 bg-gold/[.07] p-4 text-sm leading-6 text-ice/80">{children}</div>;
}
/** Stronger, highlighted positive callout. */
function Win({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border-2 border-mint/50 bg-mint/[.10] p-4 text-sm leading-6 text-ice/90">{children}</div>;
}
function Disclaimer({ children }: { children?: React.ReactNode }) {
  return <p className="mt-1 text-[11px] leading-5 text-ice/45">{children ?? 'Estimate only. Not a pre-approval, commitment to lend, or financial advice. Actual figures depend on credit, program, and underwriting.'}</p>;
}
function PrivacyNote() {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[.03] p-3 text-[11px] leading-5 text-ice/55">
      <span aria-hidden>🔒</span>
      <span>For your privacy, enter rough amounts only — never your card numbers, account numbers, Social Security number, or other sensitive personal information.</span>
    </p>
  );
}

/* 1) MORTGAGE PAYMENT */
function MortgageCalc() {
  const mark = useMark('MORTGAGE_CALCULATOR_USED');
  const { p, set } = useBuyerProfile();
  const [price, setPrice] = useState(350000);
  const [down, setDown] = useState(3.5);
  const rate = p.rate;
  const [term, setTerm] = useState('30');
  const [tax, setTax] = useState(3500);
  const [ins, setIns] = useState(1200);
  const [pmiRate, setPmiRate] = useState(0.55);
  const [amort, setAmort] = useState(false);
  const ch = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); mark({}); };

  const r = useMemo(() => {
    const n = Number(term) * 12, downP = down / 100, r12 = rate / 100 / 12;
    const loan = price * (1 - downP);
    const pi = monthlyPayment(loan, rate, n);
    const ti = (tax + ins) / 12;
    const pmi = downP < 0.2 ? (loan * (pmiRate / 100)) / 12 : 0;
    const totInt = pi * n - loan;

    // amortization rows (standard)
    let bal = loan; const rows: { yr: number; p: number; i: number; b: number }[] = [];
    for (let yr = 1; yr <= n / 12; yr++) {
      let yP = 0, yI = 0;
      for (let m = 0; m < 12; m++) { const ic = bal * r12; const pp = pi - ic; yI += ic; yP += pp; bal -= pp; }
      rows.push({ yr, p: yP, i: yI, b: Math.max(0, bal) });
    }
    // one extra P&I payment per year applied to principal
    let eb = loan, em = 0, eInt = 0;
    while (eb > 0.01 && em < n + 24) {
      const ic = eb * r12; eInt += ic; eb -= (pi - ic); em++;
      if (em % 12 === 0) eb -= pi;            // extra principal-only payment yearly
    }
    const monthsSaved = Math.max(0, n - em);
    const interestSaved = Math.max(0, totInt - eInt);

    return { total: pi + ti + pmi, pi, ti, pmi, loan, totInt, years: n / 12, rows,
      yearsSooner: monthsSaved / 12, interestSaved };
  }, [price, down, rate, term, tax, ins, pmiRate]);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Slider label="Home price" value={price} onChange={ch(setPrice)} min={100000} max={1500000} step={5000} fmt={money} help="The purchase price of the home." />
        <Slider label="Down payment" value={down} onChange={ch(setDown)} min={0} max={50} step={0.5} fmt={(n) => `${n}%`} help="3.5% is the most common. Slide to your number." />
        <Slider label="Interest rate" value={rate} onChange={ch((v) => set('rate', v))} min={3} max={12} step={0.125} fmt={pct3} help={RATE_HELP} linked />
        <Segmented label="Loan term" value={term} onChange={ch(setTerm)} options={[{ value: '30', label: '30 yrs' }, { value: '20', label: '20 yrs' }, { value: '15', label: '15 yrs' }]} />
        <Slider label="Annual property taxes" value={tax} onChange={ch(setTax)} min={0} max={15000} step={250} fmt={money} />
        <Slider label="Annual home insurance" value={ins} onChange={ch(setIns)} min={0} max={6000} step={100} fmt={money} />
        {down < 20 && <Slider label="PMI rate" value={pmiRate} onChange={ch(setPmiRate)} min={0.2} max={1.5} step={0.05} fmt={(n) => `${n.toFixed(2)}%`} help="Mortgage insurance, charged until you reach 20% equity." />}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Tile label="Total Monthly" value={money(r.total)} tone="gold" />
        <Tile label="Principal + Interest" value={money(r.pi)} />
        <Tile label="Taxes + Insurance" value={money(r.ti)} />
        <Tile label="PMI" value={r.pmi > 0 ? money(r.pmi) : 'None'} />
        <Tile label="Loan Amount" value={money(r.loan)} />
        <Tile label="Total Interest" value={money(r.totInt)} tone="warn" />
      </div>

      <Win>
        💡 <strong className="text-mint">Pay it off faster:</strong> just <strong className="text-mint">one extra principal payment a year</strong> would pay your home off about{' '}
        <strong className="text-mint">{r.yearsSooner.toFixed(1)} years sooner</strong> and save you{' '}
        <strong className="text-mint">{money(r.interestSaved)}</strong> in interest.
      </Win>

      {r.pmi > 0 ? (
        <Insight>
          You&apos;ll pay <strong className="text-gold">{money(r.totInt)}</strong> in interest over {r.years} years on your <strong className="text-gold">{money(r.loan)}</strong> loan. Once you&apos;ve paid your home down to <strong className="text-gold">20% equity</strong>, you can remove PMI and save <strong className="text-gold">{money(r.pmi * 12)}/year</strong>.
        </Insight>
      ) : (
        <Insight>
          You&apos;ll pay <strong className="text-gold">{money(r.totInt)}</strong> in interest over {r.years} years on your <strong className="text-gold">{money(r.loan)}</strong> loan. Your 20%+ down payment means <strong className="text-gold">no PMI</strong>.
        </Insight>
      )}

      <button type="button" className="btn-secondary w-full" onClick={() => setAmort((a) => !a)}>{amort ? 'Hide schedule' : 'Show amortization schedule'}</button>
      {amort && (
        <div className="max-h-56 overflow-auto rounded-2xl border border-white/10">
          <table className="w-full text-right text-xs">
            <thead className="sticky top-0 bg-[#1d2022] text-gold"><tr><th className="p-2 text-left">Year</th><th className="p-2">Principal</th><th className="p-2">Interest</th><th className="p-2">Balance</th></tr></thead>
            <tbody className="text-ice/70">{r.rows.map((rw) => (<tr key={rw.yr} className="border-t border-white/5"><td className="p-2 text-left">Yr {rw.yr}</td><td className="p-2">{money(rw.p)}</td><td className="p-2">{money(rw.i)}</td><td className="p-2">{money(rw.b)}</td></tr>))}</tbody>
          </table>
        </div>
      )}
      <Disclaimer />
    </div>
  );
}

/* 2) HOME AFFORDABILITY */
const AF_DESC: Record<string, string> = {
  w2: 'Uses gross annual salary ÷ 12. Lenders apply a 50% back-end DTI — existing debts reduce the available mortgage payment.',
  selfemployed: 'Uses a 2-year average of Schedule C net profit (Line 31). Lenders cannot use gross revenue.',
  bankstatement: 'Uses bank deposits. Personal = 100%, Business = 70%. Rates typically 9.5–10.5%.',
};
function AffordCalc() {
  const mark = useMark('AFFORDABILITY_CALCULATOR_USED');
  const { p, set } = useBuyerProfile();
  const [type, setType] = useState('w2');
  const salary = Math.round(p.income * 12);
  const [y1, setY1] = useState(72000);
  const [y2, setY2] = useState(68000);
  const [acct, setAcct] = useState('personal');
  const [dep, setDep] = useState(12000);
  const debts = totalMonthlyDebts(p);
  const [rate, setRate] = useState(10);           // independent of the shared purchase rate
  const [down, setDown] = useState(3.5);
  const [tax, setTax] = useState(3500);
  const ch = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); mark({}); };

  const r = useMemo(() => {
    const rate12 = rate / 100 / 12, downP = down / 100, d = debts;
    let qIncome = 0, loanType = '';
    if (type === 'w2') { qIncome = salary / 12; loanType = 'W2 / Salaried'; }
    else if (type === 'selfemployed') { qIncome = (y1 + y2) / 2 / 12; loanType = 'Self-Employed'; }
    else { const f = acct === 'business' ? 0.7 : 1.0; qIncome = dep * f; loanType = `Bank Statement (${Math.round(f * 100)}%)`; }
    const maxDTI = qIncome * 0.5, maxPITI = maxDTI - d, ti = (tax + 1200) / 12, n = 360;
    if (maxPITI <= ti) return { error: true as const, qIncome, loanType, maxDTI, debts: d };
    const pmiRate = downP < 0.2 ? 0.0055 / 12 : 0;
    let maxPI = maxPITI - ti;
    let maxLoan = (maxPI * (1 - Math.pow(1 + rate12, -n))) / rate12;
    const pmi = maxLoan * pmiRate; maxPI -= pmi;
    maxLoan = (maxPI * (1 - Math.pow(1 + rate12, -n))) / rate12;
    const maxPriceV = maxLoan / (1 - downP), downAmt = maxPriceV * downP;
    const totalPmt = maxPI + ti + pmi, dti = ((totalPmt + d) / qIncome) * 100;
    const hp = (totalPmt / qIncome) * 100, dp = (d / qIncome) * 100, rp = Math.max(0, 100 - hp - dp);
    return { error: false as const, qIncome, loanType, maxDTI, debts: d, maxPrice: maxPriceV, maxLoan, downAmt, dti, hp, dp, rp, nudge: d > qIncome * 0.2 };
  }, [type, salary, y1, y2, acct, dep, debts, rate, down, tax]);

  return (
    <div className="space-y-4">
      <Segmented label="Income type" value={type} onChange={ch(setType)} options={[{ value: 'w2', label: 'W-2' }, { value: 'selfemployed', label: 'Self-employed' }, { value: 'bankstatement', label: 'Bank statement' }]} />
      <p className="rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs leading-5 text-ice/55">{AF_DESC[type]}</p>
      <div className="space-y-3">
        {type === 'w2' && <Slider label="Annual gross salary" value={salary} onChange={ch((v) => set('income', Math.round(v / 12)))} min={30000} max={300000} step={1000} fmt={money} linked />}
        {type === 'selfemployed' && (<>
          <Slider label="Schedule C — year 1" value={y1} onChange={ch(setY1)} min={20000} max={300000} step={1000} fmt={money} />
          <Slider label="Schedule C — year 2" value={y2} onChange={ch(setY2)} min={20000} max={300000} step={1000} fmt={money} />
        </>)}
        {type === 'bankstatement' && (<>
          <Segmented label="Account type" value={acct} onChange={ch(setAcct)} options={[{ value: 'personal', label: 'Personal (100%)' }, { value: 'business', label: 'Business (70%)' }]} />
          <Slider label="Avg last 12 monthly deposits" value={dep} onChange={ch(setDep)} min={3000} max={50000} step={500} fmt={money} />
        </>)}
        <Slider label="Other monthly debts" value={p.otherDebts} onChange={ch((v) => set('otherDebts', v))} min={0} max={5000} step={50} fmt={money}
          help={`Car, student loans, credit cards, and loans for toys (4-wheelers, 5th wheels, boats). Not rent. + ${money(p.ccPayment + p.autoPayment + p.studentPayment)} from your other tools. Total used: ${money(debts)}.`} linked />
        <Slider label="Interest rate" value={rate} onChange={ch(setRate)} min={3} max={15} step={0.125} fmt={pct3} help={RATE_HELP} />
        <Slider label="Down payment" value={down} onChange={ch(setDown)} min={0} max={99} step={0.5} fmt={(n) => `${n}%`} />
        <Slider label="Annual property taxes" value={tax} onChange={ch(setTax)} min={0} max={15000} step={250} fmt={money} />
      </div>
      {r.error ? (
        <Insight>⚠️ Existing debts leave no room for a mortgage at 50% DTI. Lowering debt or raising income opens this up.</Insight>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Tile label="Qualifying Income / mo" value={money(r.qIncome)} tone="gold" />
            <Tile label="Loan Type" value={r.loanType} />
            <Tile label="Max DTI Budget" value={money(r.maxDTI)} />
            <Tile label="Existing Debts" value={money(r.debts)} tone="warn" />
            <Tile label="Max Purchase Price" value={money(r.maxPrice)} tone="gold" />
            <Tile label="Max Loan" value={money(r.maxLoan)} />
            <Tile label="Down Payment" value={money(r.downAmt)} />
            <Tile label="Back-End DTI" value={`${r.dti.toFixed(1)}%`} tone={r.dti > 45 ? 'warn' : 'green'} />
          </div>
          <div className="flex h-3.5 overflow-hidden rounded-full bg-white/10">
            <span className="bg-gold" style={{ width: `${r.hp}%` }} />
            <span className="bg-[#e0a44b]" style={{ width: `${r.dp}%` }} />
            <span className="bg-white/15" style={{ width: `${r.rp}%` }} />
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-ice/55"><span>Housing {r.hp.toFixed(0)}%</span><span>Other debts {r.dp.toFixed(0)}%</span><span>Remaining {r.rp.toFixed(0)}%</span></div>
          <Insight>
            At a 50% back-end DTI you could support roughly <strong className="text-gold">{money(r.maxPrice)}</strong> in purchase price.{' '}
            {r.nudge && <>Trimming your <strong className="text-gold">{money(r.debts)}</strong> in monthly debt would meaningfully raise your buying power.</>}
          </Insight>
        </>
      )}
      <Disclaimer />
    </div>
  );
}

/* 3) HOMEOWNERSHIP ROADMAP */
const ROAD_BEDS = ['3 bed', '4 bed', '5+ bed'];
function StepCard({ tag, title, rows, note }:
  { tag: string; title: string; rows: [string, string, Tone?][]; note: string }) {
  return (
    <div className="number-card">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gold">{tag}</p>
      <p className="mt-0.5 text-base font-black text-white">{title}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {rows.map(([l, v, t]) => (<span key={l} className="text-ice/55">{l} <strong className={`block text-sm ${t ? TONE[t] : 'text-white'}`}>{v}</strong></span>))}
      </div>
      <p className="mt-3 text-[12px] leading-5 text-ice/60">{note}</p>
    </div>
  );
}
function RoadmapCalc() {
  const mark = useMark('DREAM_HOME_PATH_USED');
  const { p, set } = useBuyerProfile();
  const rent = p.rent;
  const savings = p.savings;
  const comfort = p.targetPayment;
  const debts = totalMonthlyDebts(p);
  const income = p.income;
  const rate = p.rate;
  const [appr, setAppr] = useState(4);
  const [yearsPer, setYearsPer] = useState(5);
  const [sellPct, setSellPct] = useState(7);
  const [beds, setBeds] = useState('4 bed');
  const ch = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); mark({}); };

  const r = useMemo(() => {
    const r12 = rate / 100 / 12, a = appr / 100, n = 360, yrs = yearsPer;
    const piPerDollar = monthlyPayment(1, rate, n);
    const tiRate = 0.0125;

    // value, balance, equity after holding `yrs`
    const stage = (price: number, down: number) => {
      const loan = Math.max(0, price - down);
      const pi = monthlyPayment(loan, rate, n);
      let bal = loan;
      for (let m = 0; m < yrs * 12; m++) { const ic = bal * r12; bal = Math.max(0, bal - (pi - ic)); }
      const value = price * Math.pow(1 + a, yrs);
      const sellCost = value * (sellPct / 100);
      const payment = pi + (price * tiRate) / 12;
      return { price, down, loan, payment, value, bal, sellCost, netEq: Math.max(0, value - bal - sellCost) };
    };

    // Stage 1 — starter: derive price from the comfortable payment (reserve ~18% for taxes/ins)
    const piBudget = comfort * 0.82;
    const starterLoan = piBudget / piPerDollar;
    const starterDown = Math.min(savings, starterLoan); // savings as down (cap at loan)
    const s = stage(starterLoan + starterDown, starterDown);
    const starterDti = income > 0 ? ((comfort + debts) / income) * 100 : 0;

    // Stage 2 — step-up: roll equity as 20% down
    const su = stage(s.netEq / 0.2, s.netEq);
    // Stage 3 — dream: roll step-up equity as 20% down
    const dr = stage(su.netEq / 0.2, su.netEq);

    const totalYears = yrs * 2;
    const rentWaste = rent * totalYears * 12;
    return { s, su, dr, starterDti, totalYears, rentWaste };
  }, [rent, savings, comfort, debts, income, rate, appr, yearsPer, sellPct]);

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ice/45">Section 1 — Your starting point</p>
        <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
          <Slider label="Monthly rent" value={rent} onChange={ch((v) => set('rent', v))} min={800} max={5000} step={50} fmt={money} linked />
          <Slider label="Savings available" value={savings} onChange={ch((v) => set('savings', v))} min={0} max={150000} step={1000} fmt={money} linked />
          <Slider label="Target comfortable payment" value={comfort} onChange={ch((v) => set('targetPayment', v))} min={1000} max={6000} step={50} fmt={money} help="What you'd feel good paying each month." linked />
          <Slider label="Current monthly debts" value={p.otherDebts} onChange={ch((v) => set('otherDebts', v))} min={0} max={5000} step={50} fmt={money}
            help={`+ ${money(p.ccPayment + p.autoPayment + p.studentPayment)} from your other tools. Total: ${money(debts)}.`} linked />
          <Slider label="Estimated monthly income" value={income} onChange={ch((v) => set('income', v))} min={3000} max={30000} step={250} fmt={money} linked />
          <Slider label="Interest rate" value={rate} onChange={ch((v) => set('rate', v))} min={3} max={12} step={0.125} fmt={pct3} help={RATE_HELP} linked />
          <Slider label="Yearly appreciation" value={appr} onChange={ch(setAppr)} min={0} max={10} step={0.5} fmt={pctFmt} />
          <Slider label="Years in each home" value={yearsPer} onChange={ch(setYearsPer)} min={3} max={10} step={1} fmt={(n) => `${n} yrs`} />
          <Slider label="Selling cost" value={sellPct} onChange={ch(setSellPct)} min={5} max={10} step={0.5} fmt={pctFmt} help="Agent + closing costs when you sell." />
          <Segmented label="Dream bedrooms" value={beds} onChange={ch(setBeds)} options={ROAD_BEDS.map((b) => ({ value: b, label: b }))} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ice/45">Today · Renting</p>
        <p className="mt-1 text-sm leading-6 text-ice/80">
          You are currently paying <strong className="text-white">{money(rent)}/mo</strong> in rent. Over{' '}
          <strong className="text-white">{r.totalYears} years</strong>, that is{' '}
          <strong className="text-gold">{money(r.rentWaste)}</strong> paid without building ownership equity.
        </p>
      </div>

      <StepCard tag="Step 1" title="Buy the starter home"
        rows={[['Purchase price', money(r.s.price)], ['Down payment', money(r.s.down)], ['Monthly payment', `${money(r.s.payment)}/mo`, 'gold'], [`Equity after ${yearsPer} yrs`, money(r.s.netEq), 'green']]}
        note="This home may not be your forever home. Its job is to help you stop renting and start building equity." />
      <p className="px-1 text-[12px] text-ice/55">This payment is about <strong className="text-white">{r.starterDti.toFixed(0)}%</strong> of your income with current debts.</p>

      <div className="number-card border-mint/30">
        <p className="text-[11px] font-bold uppercase tracking-wide text-mint">Equity bridge</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <span className="text-ice/55">Home value after appreciation <strong className="block text-sm text-white">{money(r.s.value)}</strong></span>
          <span className="text-ice/55">Loan balance <strong className="block text-sm text-white">{money(r.s.bal)}</strong></span>
          <span className="text-ice/55">Selling costs <strong className="block text-sm text-[#e0a44b]">{money(r.s.sellCost)}</strong></span>
          <span className="text-ice/55">Net equity available <strong className="block text-sm text-mint">{money(r.s.netEq)}</strong></span>
        </div>
        <p className="mt-3 text-[12px] leading-5 text-ice/60">This equity becomes the down payment for your next home.</p>
      </div>

      <StepCard tag="Step 2" title="Move into the step-up home"
        rows={[['Purchase price', money(r.su.price)], ['Down from equity', money(r.su.down), 'green'], ['Monthly payment', `${money(r.su.payment)}/mo`, 'gold'], [`Equity after ${yearsPer} yrs`, money(r.su.netEq), 'green']]}
        note="The first home helps fund the second — you may be using equity you already built instead of saving a whole new down payment." />

      <div className="number-card border-mint/30">
        <p className="text-[11px] font-bold uppercase tracking-wide text-mint">Equity bridge</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <span className="text-ice/55">Home value after appreciation <strong className="block text-sm text-white">{money(r.su.value)}</strong></span>
          <span className="text-ice/55">Loan balance <strong className="block text-sm text-white">{money(r.su.bal)}</strong></span>
          <span className="text-ice/55">Selling costs <strong className="block text-sm text-[#e0a44b]">{money(r.su.sellCost)}</strong></span>
          <span className="text-ice/55">Net equity available <strong className="block text-sm text-mint">{money(r.su.netEq)}</strong></span>
        </div>
        <p className="mt-3 text-[12px] leading-5 text-ice/60">This equity becomes the down payment for your long-term home.</p>
      </div>

      <StepCard tag="Step 3" title={`Reach the ${beds} long-term home`}
        rows={[['Est. purchase price', money(r.dr.price)], ['Down from equity', money(r.dr.down), 'green'], ['Monthly payment', `${money(r.dr.payment)}/mo`, 'gold'], ['Funded by', 'Stages 1 & 2']]}
        note="The long-term home becomes more realistic because the earlier homes helped create equity along the way." />

      <div className="rounded-2xl border border-gold/40 bg-gold/[.08] p-5">
        <p className="text-sm leading-6 text-ice/85">
          <strong className="text-gold">The point:</strong> Buying the perfect home first may not be realistic. But buying the <strong className="text-white">right first home</strong> may create the equity path that gets you closer to the home you really want.
        </p>
        <a href={STRATEGY_CALL_URL} target="_blank" rel="noopener noreferrer"
          onClick={() => trackPortalEvent({ eventType: 'STRATEGY_CALL_CLICKED', eventValue: 'Roadmap' })}
          className="btn-primary mt-4">Map My Real Numbers →</a>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ice/45">Assumptions</p>
        <ul className="space-y-1 text-[12px] leading-5 text-ice/60">
          <li>• Starter price is backed out of your comfortable payment (≈82% to principal &amp; interest, the rest to taxes/insurance).</li>
          <li>• Appreciation <strong className="text-white">{appr}%</strong>/yr · Selling cost <strong className="text-white">{sellPct}%</strong> of sale price · Rate <strong className="text-white">{rate}%</strong> · Taxes + insurance ≈1.25%/yr.</li>
          <li>• Equity rollover: net equity from each sale becomes a <strong className="text-white">20% down payment</strong> on the next home (so the next price ≈ equity ÷ 0.20).</li>
          <li>• Planning estimate, not a pre-approval. Actual figures depend on credit, program, and underwriting.</li>
        </ul>
      </div>
    </div>
  );
}

/* 4) REFINANCE + CASH-OUT SAVINGS */
function RefiCalc() {
  const mark = useMark('REFINANCE_CALCULATOR_USED');
  const { p, set } = useBuyerProfile();
  const [goal, setGoal] = useState('both');
  const [bal, setBal] = useState(320000);
  const [cpmt, setCpmt] = useState(2100);
  const [nrate, setNrate] = useState(6.25);
  const [term, setTerm] = useState('30');
  const [costs, setCosts] = useState(6000);
  const [cashout, setCashout] = useState(30000);
  const cc = p.ccPayment;
  const auto = p.autoPayment;
  const student = p.studentPayment;
  const [personal, setPersonal] = useState(250);
  const [other, setOther] = useState(0);
  const ch = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); mark({ goal }); };
  const showCash = goal !== 'lower';

  const r = useMemo(() => {
    const n = Number(term) * 12;
    const co = showCash ? cashout : 0;
    const oldDebts = showCash ? cc + auto + student + personal + other : 0;
    const newLoan = bal + co;
    const newPmt = monthlyPayment(newLoan, nrate, n);
    const totalOld = cpmt + oldDebts;
    const trueSavings = totalOld - newPmt;
    const be = trueSavings > 0 ? Math.ceil(costs / trueSavings) : null;
    const net = trueSavings * n - costs;
    const tone: Tone = trueSavings <= 0 ? 'red' : be && be < 84 ? 'green' : 'warn';
    return { oldMortgage: cpmt, oldDebts, totalOld, newPmt, remainingDebt: 0, trueSavings, be, net, tone };
  }, [goal, bal, cpmt, nrate, term, costs, cashout, cc, auto, student, personal, other]);

  return (
    <div className="space-y-4">
      <Segmented label="Your refinance goal" value={goal} onChange={ch(setGoal)} options={[{ value: 'lower', label: 'Lower my payment' }, { value: 'cashout', label: 'Cash out to pay off debt' }, { value: 'both', label: 'Both' }]} />
      <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
        <Slider label="Current loan balance" value={bal} onChange={ch(setBal)} min={50000} max={1000000} step={5000} fmt={money} />
        <Slider label="Current mortgage payment" value={cpmt} onChange={ch(setCpmt)} min={500} max={8000} step={25} fmt={money} help="Principal + interest now." />
        <Slider label="New interest rate" value={nrate} onChange={ch(setNrate)} min={3} max={9} step={0.125} fmt={pct3} />
        <Segmented label="New loan term" value={term} onChange={ch(setTerm)} options={[{ value: '30', label: '30 yrs' }, { value: '20', label: '20 yrs' }, { value: '15', label: '15 yrs' }]} />
        <Slider label="Estimated closing costs" value={costs} onChange={ch(setCosts)} min={0} max={20000} step={250} fmt={money} />
        {showCash && <Slider label="Cash-out amount" value={cashout} onChange={ch(setCashout)} min={0} max={200000} step={1000} fmt={money} help="Added to your new loan balance." />}
      </div>
      {showCash && (
        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-ice/45">Monthly debt payments to pay off with cash-out</p>
          <PrivacyNote />
          <div className="mt-3 grid gap-x-5 gap-y-3 sm:grid-cols-2">
            <Slider label="Credit cards" value={cc} onChange={ch((v) => set('ccPayment', v))} min={0} max={3000} step={25} fmt={money} linked />
            <Slider label="Auto loans" value={auto} onChange={ch((v) => set('autoPayment', v))} min={0} max={3000} step={25} fmt={money} linked />
            <Slider label="Student loans" value={student} onChange={ch((v) => set('studentPayment', v))} min={0} max={3000} step={25} fmt={money} linked />
            <Slider label="Personal loans" value={personal} onChange={ch(setPersonal)} min={0} max={3000} step={25} fmt={money} />
            <Slider label="Other debt" value={other} onChange={ch(setOther)} min={0} max={3000} step={25} fmt={money} />
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Tile label="Old Mortgage Payment" value={money(r.oldMortgage)} />
        <Tile label="Old Debt Payments" value={money(r.oldDebts)} tone="warn" />
        <Tile label="Total Old Obligations" value={money(r.totalOld)} tone="warn" />
        <Tile label="New Mortgage Payment" value={money(r.newPmt)} />
        <Tile label="Remaining Debt Payments" value={money(r.remainingDebt)} tone="green" />
        <Tile label="True Monthly Savings" value={r.trueSavings > 0 ? money(r.trueSavings) : '—'} tone={r.trueSavings > 0 ? 'gold' : 'red'} />
        <Tile label="Break-Even" value={r.be ? `${r.be} mo (${(r.be / 12).toFixed(1)} yr)` : 'No savings'} tone={r.tone} />
        <Tile label="Net Benefit (term)" value={money(r.net)} tone={r.net > 0 ? 'green' : 'red'} />
      </div>
      <Insight>
        {goal === 'lower'
          ? (r.trueSavings > 0
            ? <>Refinancing to <strong className="text-gold">{money(r.newPmt)}/mo</strong> trims your payment by <strong className="text-gold">{money(r.trueSavings)}/mo</strong>, recovering closing costs in about <strong className="text-gold">{r.be} months</strong>.</>
            : <>At these terms the new payment isn&apos;t lower — there may be no payment savings from refinancing alone.</>)
          : (r.trueSavings > 0
            ? <>Your new mortgage payment may be higher (<strong className="text-gold">{money(r.newPmt)}</strong> vs <strong className="text-gold">{money(r.oldMortgage)}</strong>), but by eliminating <strong className="text-gold">{money(r.oldDebts)}/mo</strong> in debt payments, your real monthly savings could be <strong className="text-gold">{money(r.trueSavings)}/mo</strong>.</>
            : <>Even after paying off <strong className="text-gold">{money(r.oldDebts)}/mo</strong> of debt, the higher mortgage payment offsets the savings at these terms. A call can find a better structure.</>)}
      </Insight>
      <Disclaimer>Cash-out refinancing increases your mortgage balance and may extend the time you pay interest. This is an estimate only and not a commitment to lend.</Disclaimer>
    </div>
  );
}

/* 5) NEW AUTO LOAN IMPACT */
function AutoCalc() {
  const mark = useMark('AUTO_LOAN_CALCULATOR_USED');
  const { p, set } = useBuyerProfile();
  const [price, setPrice] = useState(35000);
  const [down, setDown] = useState(5000);
  const [trade, setTrade] = useState(0);
  const [rate, setRate] = useState(7.5);
  const [term, setTerm] = useState('60');
  const [tax, setTax] = useState(6);
  const touched = useRef(false);
  const ch = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); touched.current = true; mark({}); };

  const r = useMemo(() => {
    const n = Number(term), t = price * (tax / 100);
    const loan = price + t - down - trade;
    const pmt = monthlyPayment(loan, rate, n);
    const totInt = pmt * n - loan;
    return { pmt, loan, totInt, totCost: price + t + totInt, term: n };
  }, [price, down, trade, rate, term, tax]);

  useEffect(() => { if (touched.current) set('autoPayment', Math.round(r.pmt)); }, [r.pmt, set]);

  // Real buying-power impact from the shared profile
  const debtsBase = p.otherDebts + p.ccPayment + p.studentPayment; // exclude this car
  const ppWithout = maxPrice(p.income, debtsBase, p.rate, 5);
  const ppWith = maxPrice(p.income, debtsBase + r.pmt, p.rate, 5);
  const hasIncome = p.income > 0 && ppWithout > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Slider label="Vehicle price" value={price} onChange={ch(setPrice)} min={5000} max={120000} step={1000} fmt={money} />
        <Slider label="Down payment" value={down} onChange={ch(setDown)} min={0} max={40000} step={500} fmt={money} />
        <Slider label="Trade-in value" value={trade} onChange={ch(setTrade)} min={0} max={40000} step={500} fmt={money} />
        <Slider label="Interest rate" value={rate} onChange={ch(setRate)} min={0} max={15} step={0.25} fmt={(n) => `${n}%`} />
        <Segmented label="Term" value={term} onChange={ch(setTerm)} options={[24, 36, 48, 60, 72, 84].map((m) => ({ value: String(m), label: `${m} mo` }))} />
        <Slider label="Sales tax" value={tax} onChange={ch(setTax)} min={0} max={12} step={0.25} fmt={(n) => `${n}%`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Tile label="Monthly Payment" value={money(r.pmt)} tone="gold" />
        <Tile label="Total Loan" value={money(r.loan)} />
        <Tile label="Total Interest" value={money(r.totInt)} tone="warn" />
        <Tile label="Total Cost" value={money(r.totCost)} />
      </div>
      {hasIncome ? (
        <Insight>
          Taking on this <strong className="text-gold">{money(r.pmt)}/mo</strong> car payment lowers your estimated max home price from{' '}
          <strong className="text-gold">{money(ppWithout)}</strong> to <strong className="text-gold">{money(ppWith)}</strong> — about{' '}
          <strong className="text-gold">{money(ppWithout - ppWith)}</strong> less buying power. (Based on your income, debts, and rate; assumes ~5% down.)
          {r.term >= 72 && <> A {r.term}-month term often leaves you underwater on the vehicle for years.</>}
        </Insight>
      ) : (
        <Insight>
          That <strong className="text-gold">{money(r.pmt)}/mo</strong> car payment counts against your mortgage DTI. Fill in your income in the Affordability tool to see exactly how much home buying power it costs.
          {r.term >= 72 && <> A {r.term}-month term often leaves you underwater on the vehicle for years.</>}
        </Insight>
      )}
      <p className="text-[11px] leading-5 text-ice/45">This payment is shared with your Affordability, Roadmap, and Refinance tools so your debt totals stay in sync.</p>
      <Disclaimer />
    </div>
  );
}

/* 6) CREDIT CARD PAYOFF */
function CreditCalc() {
  const mark = useMark('CREDIT_CARD_CALCULATOR_USED');
  const { p, set } = useBuyerProfile();
  const bal = p.ccBalance;
  const apr = p.ccApr;
  const pmt = p.ccPayment;
  const income = p.income;
  const ch = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); mark({}); };

  const r = useMemo(() => {
    const a = apr / 100 / 12;
    const userPay = pmt > 0 ? pmt : Math.max(25, bal * 0.01 + bal * a); // realistic minimum
    if (userPay <= bal * a) return { error: true as const, intMonthly: bal * a };

    // payoff at user's payment
    let b = bal, mo = 0, tot = 0;
    while (b > 0.01 && mo < 600) { const ic = b * a; tot += ic; b = Math.max(0, b - (userPay - ic)); mo++; }

    // realistic minimum-only path: min = greater of $25 or (interest + 1% of balance) — always amortizes
    let mb = bal, mm = 0, mi = 0;
    while (mb > 0.01 && mm < 600) { const ic = mb * a; const mp = Math.max(25, ic + mb * 0.01); mi += ic; mb = Math.max(0, mb - (mp - ic)); mm++; }

    const removed = userPay;
    const buyingPower = income > 0 ? maxPrice(income, p.otherDebts + p.autoPayment + p.studentPayment, p.rate, 5) - maxPrice(income, p.otherDebts + p.autoPayment + p.studentPayment + removed, p.rate, 5) : removed * 154;
    const dtiImprovement = income > 0 ? (removed / income) * 100 : 0;
    const saved = (mm < 600 && mo < 600) ? Math.max(0, mi - tot) : 0;
    return { error: false as const, mo, date: monthLabel(mo), totInt: tot, removed, buyingPower, dtiImprovement, saved, capped: mm >= 600 };
  }, [bal, apr, pmt, income, p.otherDebts, p.autoPayment, p.studentPayment, p.rate]);

  return (
    <div className="space-y-4">
      <PrivacyNote />
      <div className="space-y-3">
        <Slider label="Current balance" value={bal} onChange={ch((v) => set('ccBalance', v))} min={100} max={50000} step={100} fmt={money} linked />
        <Slider label="APR" value={apr} onChange={ch((v) => set('ccApr', v))} min={5} max={36} step={0.01} fmt={(n) => `${n.toFixed(2)}%`} linked />
        <Slider label="Current monthly payment" value={pmt} onChange={ch((v) => set('ccPayment', v))} min={0} max={3000} step={25} fmt={(n) => (n === 0 ? 'Minimum' : money(n))} help="Slide to 0 to use a realistic minimum. Shared with your other tools." linked />
        <Slider label="Estimated monthly income" value={income} onChange={ch((v) => set('income', v))} min={3000} max={30000} step={250} fmt={money} help="Used to estimate buying-power impact." linked />
      </div>
      {r.error ? (
        <Insight>⚠️ That payment doesn&apos;t cover the monthly interest of <strong className="text-gold">{money(r.intMonthly)}</strong>. The balance would grow — nudge the payment up.</Insight>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Tile label="Months to Pay Off" value={`${r.mo} months`} tone="gold" />
            <Tile label="Payoff Date" value={r.date} />
            <Tile label="Total Interest Paid" value={money(r.totInt)} tone="warn" />
            <Tile label="Est. Monthly Debt Removed" value={money(r.removed)} tone="green" />
            <Tile label="Est. Buying Power Gained" value={money(r.buyingPower)} tone="gold" />
            <Tile label="Est. DTI Improvement" value={`${r.dtiImprovement.toFixed(1)} pts`} tone="green" />
          </div>
          <Insight>
            Paying off this card removes <strong className="text-gold">{money(r.removed)}/mo</strong> of debt and could raise your home buying power by about <strong className="text-gold">{money(r.buyingPower)}</strong>.
          </Insight>
          {r.saved > 0 && <p className="text-[11px] leading-5 text-ice/45">Versus a true minimum payment (interest + 1% of balance), paying this card down faster saves roughly <strong className="text-ice/70">{money(r.saved)}</strong> in interest.</p>}
        </>
      )}
      <Disclaimer />
    </div>
  );
}

/* 7) DEBT PAYOFF PLANNER */
type DebtRow = { n: string; b: number; r: number; pay: number };
function DebtCalc() {
  const mark = useMark('DEBT_PAYOFF_CALCULATOR_USED');
  const { p, set } = useBuyerProfile();
  const [rows, setRows] = useState<DebtRow[]>([
    { n: 'Credit Card', b: 6500, r: 24.99, pay: 200 },
    { n: 'Auto Loan', b: 14000, r: 7.5, pay: 320 },
    { n: 'Student Loan', b: 22000, r: 5.75, pay: 230 },
  ]);
  const [strat, setStrat] = useState<'av' | 'sn'>('av');
  const [extra, setExtra] = useState(200);

  const setRow = (i: number, key: keyof DebtRow, val: string) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: key === 'n' ? val : Number(val) || 0 } : r)));
  const addRow = () => { mark({}); setRows((rs) => [...rs, { n: 'New Debt', b: 1000, r: 10, pay: 50 }]); };
  const removeRow = (i: number) => setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs));

  const r = useMemo(() => {
    const tot = rows.reduce((s, d) => s + d.b, 0);
    const totalPay = rows.reduce((s, d) => s + d.pay, 0);

    // simulate paying each debt at its current payment; roll freed payments + extra into target
    const sim = (useExtra: boolean) => {
      const ds = rows.map((d) => ({ ...d, bal: d.b }));
      if (strat === 'av') ds.sort((a, b) => b.r - a.r); else ds.sort((a, b) => a.b - b.b);
      let mo = 0, interest = 0;
      while (ds.some((d) => d.bal > 0.01) && mo < 600) {
        let freed = 0;
        ds.forEach((d) => {
          if (d.bal <= 0) { freed += d.pay; return; }
          const ic = (d.bal * d.r) / 100 / 12; interest += ic;
          const principal = Math.min(d.pay - ic, d.bal);
          d.bal = Math.max(0, d.bal - principal);
          if (d.bal === 0) freed += d.pay;
        });
        const boost = (useExtra ? extra : 0) + freed;
        const tgt = ds.find((d) => d.bal > 0);
        if (tgt && boost > 0) tgt.bal = Math.max(0, tgt.bal - boost);
        mo++;
      }
      return { mo, interest, done: mo < 600 };
    };

    const plan = sim(true);     // current payments + rollover + extra
    const base = sim(false);    // current payments only, no rollover boost... but rollover still helps
    // baseline = pay each at current payment, NO rollover, NO extra
    const baseNoRoll = (() => {
      const ds = rows.map((d) => ({ ...d, bal: d.b }));
      let mo = 0, interest = 0;
      while (ds.some((d) => d.bal > 0.01) && mo < 600) {
        ds.forEach((d) => { if (d.bal <= 0) return; const ic = (d.bal * d.r) / 100 / 12; interest += ic; d.bal = Math.max(0, d.bal - (d.pay - ic)); });
        mo++;
      }
      return { mo, interest, done: mo < 600 };
    })();

    const saved = (plan.done && baseNoRoll.done) ? Math.max(0, baseNoRoll.interest - plan.interest) : 0;
    return { tot, totalPay, mo: plan.mo, totInt: plan.interest, saved, done: plan.done, baseMonths: baseNoRoll.mo, baseDone: baseNoRoll.done };
  }, [rows, strat, extra]);

  return (
    <div className="space-y-4">
      <PrivacyNote />
      <Segmented label="Strategy" value={strat} onChange={(v) => { mark({}); setStrat(v as 'av' | 'sn'); }} options={[{ value: 'av', label: 'Avalanche (highest APR)' }, { value: 'sn', label: 'Snowball (lowest balance)' }]} />
      <div className="space-y-2">
        <div className="grid grid-cols-[1.3fr_1fr_0.7fr_0.9fr_auto] gap-2 text-[10px] uppercase tracking-wide text-ice/40">
          <span>Debt</span><span>Balance</span><span>APR</span><span>Payment</span><span></span>
        </div>
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1.3fr_1fr_0.7fr_0.9fr_auto] gap-2">
            <input className="field !py-2 text-sm" value={row.n} onChange={(e) => setRow(i, 'n', e.target.value)} />
            <input className="field !py-2 text-sm" type="number" value={row.b} onChange={(e) => setRow(i, 'b', e.target.value)} />
            <input className="field !py-2 text-sm" type="number" step={0.01} value={row.r} onChange={(e) => setRow(i, 'r', e.target.value)} />
            <input className="field !py-2 text-sm" type="number" value={row.pay} onChange={(e) => setRow(i, 'pay', e.target.value)} />
            <button type="button" onClick={() => removeRow(i)} aria-label="Remove debt" className="rounded-lg border border-white/10 px-2 text-[#e06b5a] hover:border-[#e06b5a]/50">✕</button>
          </div>
        ))}
      </div>
      <button type="button" className="btn-secondary w-full" onClick={addRow}>+ Add debt</button>
      <button type="button" className="btn-secondary w-full" onClick={() => {
        const seed: DebtRow[] = [];
        if (p.ccBalance > 0) seed.push({ n: 'Credit Card', b: p.ccBalance, r: p.ccApr, pay: p.ccPayment || 200 });
        if (p.autoBalance > 0) seed.push({ n: 'Auto Loan', b: p.autoBalance, r: p.autoRate, pay: p.autoPayment || 320 });
        if (p.studentBalance > 0) seed.push({ n: 'Student Loan', b: p.studentBalance, r: p.studentRate, pay: p.studentPayment || 230 });
        if (seed.length) { mark({}); setRows(seed); }
      }}>Load my debts from My Numbers →</button>
      <Slider label="Extra monthly payment" value={extra} onChange={(v) => { mark({}); setExtra(v); }} min={0} max={2000} step={25} fmt={money} help="Above your current payments — this accelerates payoff." />

      <button type="button" className="btn-secondary w-full" onClick={() => { mark({}); set('otherDebts', Math.round(r.totalPay)); }}>
        Use my ${Math.round(r.totalPay).toLocaleString()}/mo as my monthly debts →
      </button>

      <div className="grid grid-cols-2 gap-3">
        <Tile label="Total Debt" value={money(r.tot)} />
        <Tile label="Debt-Free In" value={r.done ? `${(r.mo / 12).toFixed(1)} yrs` : '30+ yrs'} tone="gold" />
        <Tile label="Total Interest" value={money(r.totInt)} tone="warn" />
        <Tile label="Interest Saved" value={r.saved > 0 ? money(r.saved) : '—'} tone="green" />
      </div>
      <Insight>
        Using the <strong className="text-gold">{strat === 'av' ? 'Avalanche' : 'Snowball'}</strong> method with <strong className="text-gold">{money(extra)}/mo</strong> extra, you&apos;re debt-free in{' '}
        <strong className="text-gold">{r.done ? `${(r.mo / 12).toFixed(1)} years` : 'over 30 years'}</strong>
        {r.saved > 0 && <>, saving <strong className="text-gold">{money(r.saved)}</strong> in interest versus paying the same amounts with no rollover.</>}.
      </Insight>
      <Disclaimer />
    </div>
  );
}

/* 8) STUDENT LOAN IMPACT */
function StudentLoanCalc() {
  const mark = useMark('STUDENT_LOAN_CALCULATOR_USED');
  const { p, set } = useBuyerProfile();
  const bal = p.studentBalance;
  const rate = p.studentRate;
  const [years, setYears] = useState('10');
  const [plan, setPlan] = useState('standard');
  const income = p.income;
  const touched = useRef(false);
  const ch = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); touched.current = true; mark({}); };

  const r = useMemo(() => {
    const n = Number(years) * 12;
    const stdPmt = monthlyPayment(bal, rate, n);
    const totInt = stdPmt * n - bal;
    const dtiPmt = plan === 'standard' ? stdPmt : bal * 0.005;
    const buyingPower = income > 0 ? maxPrice(income, p.otherDebts + p.ccPayment + p.autoPayment, p.rate, 5) - maxPrice(income, p.otherDebts + p.ccPayment + p.autoPayment + dtiPmt, p.rate, 5) : dtiPmt * 154;
    const dtiImpact = income > 0 ? (dtiPmt / income) * 100 : 0;
    return { stdPmt, totInt, dtiPmt, buyingPower, dtiImpact };
  }, [bal, rate, years, plan, income, p.otherDebts, p.ccPayment, p.autoPayment, p.rate]);

  useEffect(() => { if (touched.current) set('studentPayment', Math.round(r.dtiPmt)); }, [r.dtiPmt, set]);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Slider label="Total student loan balance" value={bal} onChange={ch((v) => set('studentBalance', v))} min={0} max={250000} step={1000} fmt={money} linked />
        <Slider label="Interest rate" value={rate} onChange={ch((v) => set('studentRate', v))} min={0} max={12} step={0.125} fmt={pct3} linked />
        <Segmented label="Repayment term" value={years} onChange={ch(setYears)} options={[10, 15, 20, 25].map((y) => ({ value: String(y), label: `${y} yrs` }))} />
        <Segmented label="Plan type" value={plan} onChange={ch(setPlan)} options={[{ value: 'standard', label: 'Standard' }, { value: 'idr', label: 'Deferred / income-driven' }]} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Tile label="Standard Monthly Payment" value={money(r.stdPmt)} tone="gold" />
        <Tile label="Total Interest" value={money(r.totInt)} tone="warn" />
        <Tile label="Payment Counted for DTI" value={money(r.dtiPmt)} />
        <Tile label="Est. Buying Power Impact" value={money(r.buyingPower)} tone="gold" />
        <Tile label="Est. DTI Impact" value={`${r.dtiImpact.toFixed(1)} pts`} tone="warn" />
      </div>
      <Insight>
        Your student loan adds about <strong className="text-gold">{money(r.dtiPmt)}/mo</strong> to the debt lenders count against your mortgage DTI — roughly{' '}
        <strong className="text-gold">{money(r.buyingPower)}</strong> of home buying power.{' '}
        {plan !== 'standard' && <>On a deferred or income-driven plan, many lenders count <strong className="text-gold">0.5% of the balance</strong> even if your actual payment is lower.</>}
      </Insight>
      <p className="text-[11px] leading-5 text-ice/45">This payment is shared with your Affordability, Roadmap, and Refinance tools so your debt totals stay in sync.</p>
      <Disclaimer />
    </div>
  );
}

/* ---- Page scaffolding ---- */
const TOOLS = [
  { id: 'afford', icon: Wallet, label: 'Affordability', title: 'Home Affordability', subtitle: 'How much home can I afford? Start here.', Comp: AffordCalc },
  { id: 'mortgage', icon: Home, label: 'Mortgage', title: 'Mortgage Payment', subtitle: 'What would my monthly payment be?', Comp: MortgageCalc },
  { id: 'roadmap', icon: Map, label: 'Roadmap', title: 'Homeownership Roadmap', subtitle: 'From renting to your dream home — one step at a time.', Comp: RoadmapCalc },
  { id: 'credit', icon: CreditCard, label: 'Credit Card', title: 'Credit Card Payoff', subtitle: 'Is credit-card debt hurting my approval?', Comp: CreditCalc },
  { id: 'student', icon: GraduationCap, label: 'Student Loan', title: 'Student Loan Impact', subtitle: 'Will student loans affect approval?', Comp: StudentLoanCalc },
  { id: 'debt', icon: Coins, label: 'Debt Payoff', title: 'Debt Payoff Planner', subtitle: 'Avalanche vs. snowball.', Comp: DebtCalc },
  { id: 'auto', icon: Car, label: 'Auto Loan', title: 'New Auto Loan Impact', subtitle: 'How a new car payment affects your approval.', Comp: AutoCalc },
  { id: 'refi', icon: RefreshCw, label: 'Refinance', title: 'Refinance + Cash-Out', subtitle: 'Already own? See if refinancing helps.', Comp: RefiCalc },
];

function BuyerPlanCTA({ where }: { where: string }) {
  return (
    <div className="card-light flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
      <div>
        <p className="kicker mb-1">Want the real number?</p>
        <p className="text-sm font-semibold text-navy/80">These tools are estimates. A short buyer strategy call turns them into a personalized plan based on your income, credit, debt, savings, and goals.</p>
      </div>
      <a className="btn-primary whitespace-nowrap" href={STRATEGY_CALL_URL} target="_blank" rel="noopener noreferrer"
        onClick={() => trackPortalEvent({ eventType: 'STRATEGY_CALL_CLICKED', eventValue: where })}>Build My Buyer Plan →</a>
    </div>
  );
}

function YourNumbersBar() {
  const { p } = useBuyerProfile();
  const items: [string, string][] = [
    ['Income/mo', money(p.income)],
    ['Rate', `${p.rate}%`],
    ['Monthly debts', money(totalMonthlyDebts(p))],
    ['Savings', money(p.savings)],
  ];
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 rounded-2xl border border-gold/25 bg-gold/[.06] px-4 py-3">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
        {items.map(([l, v]) => (<span key={l} className="text-ice/55">{l}: <strong className="text-white">{v}</strong></span>))}
      </div>
      <a href="/my-numbers" className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-gold hover:underline">Edit my numbers →</a>
    </div>
  );
}

export default function CalculatorGrid() {
  const [active, setActive] = useState(TOOLS[0].id);
  const activeTool = TOOLS.find((t) => t.id === active) ?? TOOLS[0];

  return (
    <BuyerProfileProvider>
      {/* Tool selector — pick one tool at a time */}
      <div className="sticky top-20 z-30 -mx-5 mb-5 border-b border-white/10 bg-[#101415]/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {TOOLS.map((t) => {
            const on = t.id === active;
            const Icon = t.icon;
            return (
              <button key={t.id} type="button"
                onClick={() => { setActive(t.id); trackPortalEvent({ eventType: 'TOOLS_GUIDE_CLICKED', eventValue: t.id }); }}
                aria-current={on ? 'true' : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${on ? 'border-gold/60 bg-gold/15 text-gold' : 'border-white/12 text-ice/60 hover:border-gold/40 hover:text-ice'}`}>
                <Icon size={16} />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mb-5 text-center text-[12px] leading-5 text-ice/45">
        Your income, debts, and payments carry across every tool — enter them once. <span className="text-gold">↔</span> marks a shared field. Estimates only; never enter account or card numbers.
      </p>

      <YourNumbersBar />

      {/* Every tool stays mounted so your numbers persist; only the selected one is shown. */}
      {TOOLS.map((t) => {
        const on = t.id === active;
        const Icon = t.icon;
        const Comp = t.Comp;
        return (
          <div key={t.id} style={{ display: on ? 'block' : 'none' }}>
            <section className="card overflow-hidden">
              <header className="flex items-center gap-3 border-b border-white/10 bg-white/[.04] p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold"><Icon size={22} /></span>
                <div>
                  <h2 className="brand-serif text-xl font-bold leading-tight text-white sm:text-2xl">{t.title}</h2>
                  <p className="text-xs text-ice/55">{t.subtitle}</p>
                </div>
              </header>
              <div className="p-5 sm:p-7"><Comp /></div>
            </section>
          </div>
        );
      })}

      <div className="mt-6"><BuyerPlanCTA where={`Tools · ${activeTool.label}`} /></div>
      <p className="mt-5 text-center text-[12px] text-ice/45">Switch tools with the tabs above — your numbers stay in sync across all of them.</p>
    </BuyerProfileProvider>
  );
}
