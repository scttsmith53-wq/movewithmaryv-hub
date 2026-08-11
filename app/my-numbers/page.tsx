'use client';

import Shell from '@/components/Shell';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import { BuyerProfileProvider, useBuyerProfile, emptyCoBorrower, type BuyerProfile, type CoBorrower } from '@/lib/buyer-profile';
import { money } from '@/lib/calc-format';
import { ArrowRight, RotateCcw, Wallet, Home, CreditCard, Landmark, Users, type LucideIcon } from 'lucide-react';

function Field({ label, value, onChange, prefix, suffix, step = 1, help }:
  { label: string; value: number; onChange: (v: number) => void; prefix?: string; suffix?: string; step?: number; help?: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ice/60">{label}</span>
      <div className="flex items-center rounded-xl border border-white/12 bg-[#101415] transition focus-within:border-gold/50">
        {prefix ? <span className="pl-3 text-ice/45">{prefix}</span> : null}
        <input
          type="number"
          step={step}
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
          className="w-full bg-transparent px-3 py-2.5 text-white outline-none"
        />
        {suffix ? <span className="pr-3 text-ice/45">{suffix}</span> : null}
      </div>
      {help ? <p className="mt-1 text-[11px] leading-4 text-ice/45">{help}</p> : null}
    </label>
  );
}

function Section({ icon: Icon, title, desc, children }:
  { icon: LucideIcon; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold"><Icon size={19} /></span>
        <div>
          <h2 className="brand-serif text-lg font-bold text-white">{title}</h2>
          {desc ? <p className="text-xs text-ice/55">{desc}</p> : null}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

// Monthly income lenders would count for one earner (base + OT only if stable 2+ yrs).
function countedIncome(c: { incomeType: string; hourlyRate: number; hoursPerWeek: number; annualSalary: number; monthlyBase: number; otMonthly: number; otStable: boolean }) {
  const base = c.incomeType === 'hourly' ? (c.hourlyRate * c.hoursPerWeek * 52) / 12
    : c.incomeType === 'annual' ? c.annualSalary / 12
    : c.monthlyBase;
  return base + (c.otStable ? c.otMonthly : 0);
}

// Reusable income entry (pay type → conditional fields → OT stability → their debts).
function IncomeInputs({ cb, onChange }: { cb: CoBorrower; onChange: (patch: Partial<CoBorrower>) => void }) {
  return (
    <>
      <div className="mb-4">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ice/60">How are they paid?</span>
        <div className="flex flex-wrap gap-2">
          {[['hourly', 'Hourly'], ['annual', 'Annual salary'], ['monthly', 'Monthly income']].map(([v, l]) => (
            <button key={v} type="button" onClick={() => onChange({ incomeType: v })}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${cb.incomeType === v ? 'border-gold/60 bg-gold/15 text-gold' : 'border-white/12 text-ice/65 hover:border-gold/30'}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {cb.incomeType === 'hourly' && (
          <>
            <Field label="Hourly rate" prefix="$" suffix="/hr" value={cb.hourlyRate} onChange={(v) => onChange({ hourlyRate: v })} step={0.5} />
            <Field label="Hours per week" suffix="hrs" value={cb.hoursPerWeek} onChange={(v) => onChange({ hoursPerWeek: v })} step={1} />
          </>
        )}
        {cb.incomeType === 'annual' && <Field label="Annual salary" prefix="$" value={cb.annualSalary} onChange={(v) => onChange({ annualSalary: v })} step={1000} />}
        {cb.incomeType === 'monthly' && <Field label="Monthly income (before OT)" prefix="$" value={cb.monthlyBase} onChange={(v) => onChange({ monthlyBase: v })} step={100} />}
        <Field label="Overtime / bonus (monthly avg)" prefix="$" value={cb.otMonthly} onChange={(v) => onChange({ otMonthly: v })} step={50} help="Leave 0 if none." />
        {cb.otMonthly > 0 && (
          <div>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ice/60">OT steady 2+ years?</span>
            <div className="flex gap-2">
              {[['yes', 'Yes'], ['no', 'No']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => onChange({ otStable: v === 'yes' })}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${(cb.otStable ? 'yes' : 'no') === v ? 'border-gold/60 bg-gold/15 text-gold' : 'border-white/12 text-ice/65 hover:border-gold/30'}`}>{l}</button>
              ))}
            </div>
          </div>
        )}
        <Field label="Their monthly debt payments" prefix="$" value={cb.monthlyDebts} onChange={(v) => onChange({ monthlyDebts: v })} step={25} help="Debts on their credit report — car, cards, student loans. Not rent/utilities." />
      </div>
    </>
  );
}

function MyNumbersForm() {
  const { p, set, reset } = useBuyerProfile();

  // Qualifying income = you + all co-borrowers (each base + OT only if stable).
  const recomputeIncome = (n: BuyerProfile) => {
    const total = countedIncome(n) + n.coBorrowers.reduce((s, c) => s + countedIncome(c), 0);
    set('income', Math.round(total));
  };
  const setIncome = <K extends keyof BuyerProfile>(k: K, v: BuyerProfile[K]) => {
    set(k, v);
    recomputeIncome({ ...p, [k]: v } as BuyerProfile);
  };
  const setCoBorrowers = (next: CoBorrower[]) => {
    set('coBorrowers', next);
    recomputeIncome({ ...p, coBorrowers: next });
  };
  const updateCo = (i: number, patch: Partial<CoBorrower>) =>
    setCoBorrowers(p.coBorrowers.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const addCo = () => setCoBorrowers([...p.coBorrowers, emptyCoBorrower()]);
  const removeCo = (i: number) => setCoBorrowers(p.coBorrowers.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gold/25 bg-gold/[.06] p-4 text-sm leading-6 text-ice/80">
        <strong className="text-gold">New to this? Take a breath — there are no wrong answers.</strong> The fields below start with <strong className="text-white">example numbers</strong>, so replace what you can with your own and leave the rest. Most first-time buyers are surprised by how much they qualify for. When ready, open your tools and start with <strong className="text-white">Affordability</strong>.
      </div>
      <p className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[.03] p-3 text-[12px] leading-5 text-ice/60">
        <span aria-hidden>🔒</span>
        <span>Enter rough amounts only. Never enter account numbers, account names, card numbers, your Social Security number, or any personal information. Your numbers are saved only on this device.</span>
      </p>

      <Section icon={Wallet} title="Income &amp; Rate" desc="Lenders qualify you on income they can document — enter it the way you're paid.">
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ice/60">How are you paid?</span>
          <div className="flex flex-wrap gap-2">
            {[['hourly', 'Hourly'], ['annual', 'Annual salary'], ['monthly', 'Monthly income']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setIncome('incomeType', v)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${p.incomeType === v ? 'border-gold/60 bg-gold/15 text-gold' : 'border-white/12 text-ice/65 hover:border-gold/30'}`}>{l}</button>
            ))}
          </div>
        </div>

        {p.incomeType === 'hourly' && (
          <>
            <Field label="Hourly rate" prefix="$" suffix="/hr" value={p.hourlyRate} onChange={(v) => setIncome('hourlyRate', v)} step={0.5} />
            <Field label="Hours per week" suffix="hrs" value={p.hoursPerWeek} onChange={(v) => setIncome('hoursPerWeek', v)} step={1} help="Your typical weekly hours." />
          </>
        )}
        {p.incomeType === 'annual' && (
          <Field label="Annual salary" prefix="$" value={p.annualSalary} onChange={(v) => setIncome('annualSalary', v)} step={1000} />
        )}
        {p.incomeType === 'monthly' && (
          <Field label="Monthly income (before OT)" prefix="$" value={p.monthlyBase} onChange={(v) => setIncome('monthlyBase', v)} step={100} />
        )}

        <Field label="Overtime / bonus (monthly avg)" prefix="$" value={p.otMonthly} onChange={(v) => setIncome('otMonthly', v)} step={50} help="Leave 0 if none." />
        {p.otMonthly > 0 && (
          <div>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ice/60">Has your OT/bonus been steady 2+ years?</span>
            <div className="flex gap-2">
              {[['yes', 'Yes'], ['no', 'No']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => setIncome('otStable', v === 'yes')}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${(p.otStable ? 'yes' : 'no') === v ? 'border-gold/60 bg-gold/15 text-gold' : 'border-white/12 text-ice/65 hover:border-gold/30'}`}>{l}</button>
              ))}
            </div>
            {!p.otStable && (
              <p className="mt-1.5 text-[11px] leading-4 text-ice/45">Lenders usually can&apos;t count OT/bonus unless it&apos;s stable 2+ years — so it&apos;s left out of the qualifying income below.</p>
            )}
          </div>
        )}

        <div className="rounded-xl border border-gold/25 bg-gold/[.06] px-4 py-3 text-sm text-ice/80 sm:col-span-2">
          Total qualifying income (you{p.coBorrowers.length ? ' + co-borrowers' : ''}): <strong className="text-gold">{money(p.income)}/mo</strong>{' '}
          <span className="text-ice/50">({money(p.income * 12)}/yr)</span>
        </div>
        <Field label="Interest rate" suffix="%" value={p.rate} onChange={(v) => set('rate', v)} step={0.125}
          help={<>We&apos;ve filled in an estimate — check the current U.S. average at <a href="https://www.mortgagenewsdaily.com/mortgage-rates" target="_blank" rel="noopener noreferrer" className="font-semibold text-gold hover:underline">Mortgage News Daily</a>. Averages change daily and are not a quote or an offer of credit; your real rate depends on your credit, loan type, down payment, and property.</>} />
      </Section>

      <Section icon={Users} title="Co-borrowers" desc="Add anyone else on the loan — their income and debts both count toward qualifying.">
        <div className="space-y-4 sm:col-span-2">
          {p.coBorrowers.length === 0 && (
            <p className="text-sm text-ice/50">No co-borrowers added. Buying with someone else? Add them so their income and debts are included.</p>
          )}
          {p.coBorrowers.map((cb, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[.02] p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gold/80">Co-borrower {i + 1}</p>
                <button type="button" onClick={() => removeCo(i)} className="text-xs font-semibold text-[#e06b5a] hover:underline">Remove</button>
              </div>
              <IncomeInputs cb={cb} onChange={(patch) => updateCo(i, patch)} />
            </div>
          ))}
          <button type="button" onClick={addCo} className="btn-secondary w-full">+ Add co-borrower</button>
        </div>
      </Section>

      <Section icon={Home} title="Housing Goals" desc="Where you are and where you're headed.">
        <Field label="Current monthly rent" prefix="$" value={p.rent} onChange={(v) => set('rent', v)} step={50} />
        <Field label="Savings available" prefix="$" value={p.savings} onChange={(v) => set('savings', v)} step={1000} help="Toward a down payment + closing costs." />
        <Field label="Comfortable monthly payment" prefix="$" value={p.targetPayment} onChange={(v) => set('targetPayment', v)} step={50} help="What you'd feel good paying each month." />
        <p className="rounded-xl border border-gold/20 bg-gold/[.05] px-4 py-2.5 text-[12px] leading-5 text-ice/70 sm:col-span-2">💡 Think you need 20% down? Many first-time buyers put down far less — sometimes 3–3.5% — and there may be <a href="/dpa" className="font-semibold text-gold hover:underline">down-payment assistance</a> you can use.</p>
      </Section>

      <Section icon={CreditCard} title="Credit Card Debt" desc="Leave at 0 if it doesn't apply.">
        <Field label="Total balance" prefix="$" value={p.ccBalance} onChange={(v) => set('ccBalance', v)} step={100} />
        <Field label="APR" suffix="%" value={p.ccApr} onChange={(v) => set('ccApr', v)} step={0.01} />
        <Field label="Monthly payment" prefix="$" value={p.ccPayment} onChange={(v) => set('ccPayment', v)} step={25} />
      </Section>

      <Section icon={Landmark} title="Other Debts" desc="Only what applies — leave the rest at 0.">
        <Field label="Auto loan balance" prefix="$" value={p.autoBalance} onChange={(v) => set('autoBalance', v)} step={500} />
        <Field label="Auto monthly payment" prefix="$" value={p.autoPayment} onChange={(v) => set('autoPayment', v)} step={25} />
        <Field label="Student loan balance" prefix="$" value={p.studentBalance} onChange={(v) => set('studentBalance', v)} step={1000} />
        <Field label="Student monthly payment" prefix="$" value={p.studentPayment} onChange={(v) => set('studentPayment', v)} step={25} />
        <Field label="All other monthly debts" prefix="$" value={p.otherDebts} onChange={(v) => set('otherDebts', v)} step={50} help="Debts that appear on your credit report — personal loans, etc. Not rent, utilities, or phone." />
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button type="button" onClick={reset} className="btn-secondary"><RotateCcw size={15} /> Reset to example numbers</button>
        <Link href="/calculators" className="btn-primary">Open my tools <ArrowRight size={16} /></Link>
      </div>
      <p className="text-center text-[12px] text-ice/45">Your numbers now flow into every calculator — and adjusting any tool updates them here too.</p>
    </div>
  );
}

export default function MyNumbersPage() {
  return (
    <Shell>
      <PageHeader eyebrow="Your Buyer Profile" title="My Numbers">
        Enter what you know — the more you add, the more your tools fill in automatically. Everything is optional and stays on your device.
      </PageHeader>
      <BuyerProfileProvider>
        <MyNumbersForm />
      </BuyerProfileProvider>
    </Shell>
  );
}
