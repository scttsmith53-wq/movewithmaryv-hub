'use client';

import { useEffect, useMemo, useState } from 'react';
import { getDemoUser } from '@/lib/auth';
import { ArrowRight, CheckCircle2, Plus, Trash2 } from 'lucide-react';

type CardDebt = {
  id: string;
  name: string;
  limit: number;
  balance: number;
  target: number;
};

const checklistSections = [
  {
    title: '1. Learn the Basics',
    description: 'Get familiar with the process before you make big decisions.',
    items: [
      'Register for the first-time buyer webinar',
      'Attend the webinar',
      'Run the mortgage payment calculator',
      'Run the cost of waiting calculator'
    ]
  },
  {
    title: '2. Get Ready Financially',
    description: 'Understand your comfort zone and what may need attention.',
    items: [
      'Review your credit picture',
      'Check your savings for down payment and closing costs',
      'Estimate a comfortable monthly payment',
      'Explore down payment assistance resources'
    ]
  },
  {
    title: '3. Get Pre-Approved',
    description: 'Move from learning to a clear plan and price range.',
    items: [
      'Complete your loan application',
      'Upload requested documents',
      'Review your loan options',
      'Choose your target budget'
    ]
  },
  {
    title: '4. Improve Your Buying Position',
    description: 'Small preparation steps can make the next conversation easier.',
    items: [
      'Pay down credit cards where possible',
      'Set bills to autopay or reminders',
      'Avoid new debt before closing',
      'Add positive credit history if needed'
    ]
  },
  {
    title: '5. Start Shopping With Confidence',
    description: 'Use your numbers and team to shop with more clarity.',
    items: [
      'Connect with your real estate agent',
      'Review homes in your range',
      'Make an offer when ready',
      'Move toward closing'
    ]
  }
];

const creditImprovement = [
  'Check your credit report for accuracy',
  'Identify high-balance credit cards',
  'Create a credit card paydown target',
  'Make all payments on time going forward',
  'Set up autopay or reminders',
  'Avoid new car loans or large new debt',
  'Consider a secured card if you need positive credit history',
  'Ask before paying collections or charge-offs'
];

function money(n: number) {
  if (!Number.isFinite(n)) return '$0';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function makeKey(email: string | undefined, suffix: string) {
  return `buyer-confidence:${email || 'demo'}:${suffix}`;
}

export default function BuyerChecklist() {
  const user = getDemoUser();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [creditChecked, setCreditChecked] = useState<Record<string, boolean>>({});
  const [cards, setCards] = useState<CardDebt[]>([
    { id: 'demo-card-1', name: 'Example Card', limit: 1000, balance: 850, target: 30 }
  ]);

  const progress = useMemo(() => {
    const allItems = checklistSections.flatMap((s) => s.items);
    const done = allItems.filter((item) => checked[item]).length;
    return { done, total: allItems.length, pct: Math.round((done / allItems.length) * 100) };
  }, [checked]);

  useEffect(() => {
    const checklist = localStorage.getItem(makeKey(user?.email, 'checklist'));
    const creditList = localStorage.getItem(makeKey(user?.email, 'credit-checklist'));
    const savedCards = localStorage.getItem(makeKey(user?.email, 'credit-cards'));
    if (checklist) setChecked(JSON.parse(checklist));
    if (creditList) setCreditChecked(JSON.parse(creditList));
    if (savedCards) setCards(JSON.parse(savedCards));
  }, [user?.email]);

  useEffect(() => {
    localStorage.setItem(makeKey(user?.email, 'checklist'), JSON.stringify(checked));
  }, [checked, user?.email]);

  useEffect(() => {
    localStorage.setItem(makeKey(user?.email, 'credit-checklist'), JSON.stringify(creditChecked));
  }, [creditChecked, user?.email]);

  useEffect(() => {
    localStorage.setItem(makeKey(user?.email, 'credit-cards'), JSON.stringify(cards));
  }, [cards, user?.email]);

  function toggle(item: string) {
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }));
  }

  function toggleCredit(item: string) {
    setCreditChecked((prev) => ({ ...prev, [item]: !prev[item] }));
  }

  function addCard() {
    setCards((prev) => [...prev, { id: crypto.randomUUID(), name: 'New Card', limit: 1000, balance: 500, target: 30 }]);
  }

  function updateCard(id: string, patch: Partial<CardDebt>) {
    setCards((prev) => prev.map((card) => card.id === id ? { ...card, ...patch } : card));
  }

  function removeCard(id: string) {
    setCards((prev) => prev.filter((card) => card.id !== id));
  }

  return (
    <div className="grid gap-6">
      <section className="card overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="kicker">Your Buyer Roadmap</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Buyer Confidence Checklist</h2>
            <p className="mt-3 max-w-2xl text-ice/68">A simple, client-friendly path from learning the basics to shopping with confidence. Your progress saves automatically on this device.</p>
          </div>
          <div className="rounded-3xl border border-sky/20 bg-sky/10 p-5 text-center">
            <p className="text-sm font-black uppercase tracking-widest text-sky">Progress</p>
            <p className="mt-1 text-4xl font-black">{progress.pct}%</p>
            <p className="text-sm text-ice/62">{progress.done} of {progress.total} complete</p>
          </div>
        </div>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-sky to-blue" style={{ width: `${progress.pct}%` }} />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {checklistSections.map((section) => (
          <div key={section.title} className="card p-6">
            <h3 className="text-2xl font-black text-sky">{section.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ice/62">{section.description}</p>
            <div className="mt-5 grid gap-3">
              {section.items.map((item) => (
                <button key={item} onClick={() => toggle(item)} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${checked[item] ? 'border-mint/35 bg-mint/10' : 'border-white/10 bg-white/[.045] hover:bg-white/[.075]'}`}>
                  <CheckCircle2 className={`mt-0.5 shrink-0 ${checked[item] ? 'text-mint' : 'text-ice/35'}`} size={20} />
                  <span className={`font-bold ${checked[item] ? 'text-white' : 'text-ice/78'}`}>{item}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-white/10 bg-white/[.04] p-6">
          <p className="kicker">Credit Improvement Center</p>
          <h2 className="mt-2 text-3xl font-black">If Credit Needs Work, Start Here</h2>
          <p className="mt-2 max-w-3xl text-ice/65">This section keeps the guidance thorough without making the main dashboard feel overwhelming. It is educational and not a guarantee of score changes or approval.</p>
        </div>
        <div className="grid gap-6 p-6 xl:grid-cols-[.85fr_1.15fr]">
          <div className="grid gap-3">
            {creditImprovement.map((item) => (
              <button key={item} onClick={() => toggleCredit(item)} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${creditChecked[item] ? 'border-mint/35 bg-mint/10' : 'border-white/10 bg-white/[.045] hover:bg-white/[.075]'}`}>
                <CheckCircle2 className={`mt-0.5 shrink-0 ${creditChecked[item] ? 'text-mint' : 'text-ice/35'}`} size={20} />
                <span className="text-sm font-bold leading-6 text-ice/78">{item}</span>
              </button>
            ))}
          </div>

          <div className="rounded-[2rem] border border-sky/20 bg-sky/10 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="kicker">Paydown Planner</p>
                <h3 className="mt-2 text-2xl font-black">Credit Card Utilization Targets</h3>
                <p className="mt-2 text-sm leading-6 text-ice/62">Add each card, choose a target, and see the estimated balance goal.</p>
              </div>
              <button onClick={addCard} className="btn-primary"><Plus size={18}/> Add Card</button>
            </div>

            <div className="mt-5 grid gap-4">
              {cards.map((card) => {
                const targetBalance = Math.max(card.limit * card.target / 100, 0);
                const paydown = Math.max(card.balance - targetBalance, 0);
                return (
                  <div key={card.id} className="rounded-3xl border border-white/10 bg-white/[.06] p-4">
                    <div className="grid gap-3 md:grid-cols-4">
                      <label className="md:col-span-1"><span className="mb-2 block text-xs font-black uppercase tracking-widest text-ice/50">Card</span><input className="field" value={card.name} onChange={(e) => updateCard(card.id, { name: e.target.value })}/></label>
                      <label><span className="mb-2 block text-xs font-black uppercase tracking-widest text-ice/50">Limit</span><input className="field" type="number" value={card.limit} onChange={(e) => updateCard(card.id, { limit: Number(e.target.value) })}/></label>
                      <label><span className="mb-2 block text-xs font-black uppercase tracking-widest text-ice/50">Balance</span><input className="field" type="number" value={card.balance} onChange={(e) => updateCard(card.id, { balance: Number(e.target.value) })}/></label>
                      <label><span className="mb-2 block text-xs font-black uppercase tracking-widest text-ice/50">Target</span><select className="field" value={card.target} onChange={(e) => updateCard(card.id, { target: Number(e.target.value) })}><option value={75}>75%</option><option value={50}>50%</option><option value={30}>30%</option><option value={10}>10%</option></select></label>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-center">
                      <div className="number-card"><p className="text-xs font-black uppercase tracking-widest text-ice/45">Target Balance</p><strong className="mt-1 block text-2xl">{money(targetBalance)}</strong></div>
                      <div className="number-card"><p className="text-xs font-black uppercase tracking-widest text-ice/45">Pay Down About</p><strong className="mt-1 block text-2xl text-gold">{money(paydown)}</strong></div>
                      <button onClick={() => removeCard(card.id)} className="rounded-full border border-white/10 p-3 text-ice/55 hover:bg-white/10 hover:text-white" aria-label="Remove card"><Trash2 size={18}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs leading-5 text-ice/48">Credit scoring is complex. Utilization targets are educational planning goals and do not guarantee a score increase, approval, or better loan terms.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
