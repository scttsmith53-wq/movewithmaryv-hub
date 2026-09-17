'use client';

import { FormEvent, useState } from 'react';

const REGISTER_URL = 'https://qfhfuesnjfuwfujhvgpa.supabase.co/functions/v1/hyper-handler';
const SUPABASE_KEY = 'sb_publishable_YnBBmClE9jpZMKN-OMuFWA_NB3oGOMv';
const BRYCE_APPLICATION_URL = 'https://apply.citywidehm.com/?emp-id=38274&emp_id=38274&gr_company=cit&langPref=en&loId=38274&loan-purpose=purchase&loid=38274';
const CONSENT_TEXT =
  'I agree that Mary Vega, Scott Smith, and Bryce Waite may contact me by phone, text, and email about real estate and mortgage services. Consent is not required to buy goods or services. Message and data rates may apply. Reply STOP to opt out.';

const inputClass =
  'w-full rounded-xl border border-[#163052] bg-white px-4 py-3.5 text-base text-[#07182d] outline-none transition focus:border-[#d7a33d] focus:ring-4 focus:ring-[#d7a33d]/15';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  area: string;
  housing: string;
  credit: string;
  goal: string;
  route: string;
  timeline: string;
};

const initialForm: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  area: '',
  housing: '',
  credit: '',
  goal: '',
  route: '',
  timeline: '',
};

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#163052]">{label}</span>
      <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} required>
        <option value="">Select one</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

export default function Home() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  const update = (key: keyof FormData, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!consent) {
      setError('Please check the consent box so Mary and Bryce can follow up with you.');
      return;
    }

    setStatus('sending');
    try {
      const routeInterest = form.route === 'Real-estate help from Mary'
        ? 'mary_real_estate'
        : form.route === 'Mortgage planning call with Scott'
          ? 'scott_mortgage_consultation'
          : 'bryce_application';
      const response = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          full_name: `${form.firstName} ${form.lastName}`.trim(),
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          source: 'maryv_ready_buyer',
          referral_channel: 'Move With Mary V',
          partner_code: 'move-with-maryv',
          program_code: 'move-with-maryv',
          referred_by: 'Mary Vega',
          interests: ['arizona_homebuyer', routeInterest],
          preferred_area: form.area,
          housing_status: form.housing,
          credit_range: form.credit,
          primary_goal: form.goal,
          state: 'AZ',
          situation: form.housing,
          credit: form.credit,
          focus: form.goal,
          lead_route: routeInterest,
          needs: `${form.goal} | Area: ${form.area} | Requested route: ${form.route}`,
          timeline: form.timeline,
          consent: true,
          consent_text: CONSENT_TEXT,
        }),
      });
      if (!response.ok) throw new Error('Registration failed');
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'generate_lead', { method: 'move_with_mary_v' });
      }
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', { content_name: 'Move With Mary V' });
      }
      setStatus('done');
    } catch {
      setStatus('idle');
      setError('We could not save your information. Please try again or call Mary at (623) 570-4245.');
    }
  }

  return (
    <main className="min-h-screen bg-[#07182d] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07182d]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <a href="#top" className="font-serif text-xl font-bold sm:text-2xl">Move With Mary V</a>
          <a href="#buyer-check" className="rounded-full bg-[#e7ad3e] px-4 py-2.5 text-xs font-black uppercase tracking-[.08em] text-[#07182d] sm:px-6">Start your plan</a>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(231,173,62,.24),transparent_31%),radial-gradient(circle_at_15%_75%,rgba(69,135,204,.18),transparent_34%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div>
            <p className="text-xs font-black uppercase tracking-[.25em] text-[#e7ad3e]">Arizona homebuyer guidance</p>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl font-bold leading-[1.02] sm:text-6xl">A clearer path to your next Arizona home.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              Whether you are ready to buy soon or still working through budget, credit, savings, or timing, start with the right person for the help you need.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#buyer-check" className="rounded-xl bg-[#e7ad3e] px-7 py-4 font-black text-[#07182d]">Take the 60-second buyer check</a>
              <a href="tel:+16235704245" className="rounded-xl border border-white/20 px-7 py-4 font-bold">Call Mary</a>
            </div>
            <p className="mt-5 text-xs leading-5 text-white/45">No pressure and no obligation. The check is educational and is not an application or approval.</p>
          </div>

          <div className="rounded-3xl border border-white/12 bg-white/[.06] p-6 shadow-2xl sm:p-8">
            <p className="text-xs font-black uppercase tracking-[.22em] text-[#e7ad3e]">Choose the right next step</p>
            <div className="mt-6 space-y-4">
              <article className="rounded-2xl border border-white/10 bg-[#102642] p-5">
                <p className="text-xs font-bold uppercase tracking-[.15em] text-[#e7ad3e]">Real-estate guidance</p>
                <h2 className="mt-2 text-2xl font-black">Mary Vega</h2>
                <p className="mt-1 text-sm text-white/65">Keller Williams Professional Partners · AZ SA648249000</p>
                <a className="mt-4 inline-block font-bold text-white" href="tel:+16235704245">(623) 570-4245</a>
              </article>
              <article className="rounded-2xl border border-white/10 bg-[#102642] p-5">
                <p className="text-xs font-bold uppercase tracking-[.15em] text-[#e7ad3e]">Mortgage planning call</p>
                <h2 className="mt-2 text-2xl font-black">Scott Smith</h2>
                <p className="mt-1 text-sm text-white/65">Questions about payments, financing, or what to do next</p>
                <a className="mt-4 inline-block font-bold text-white" href="tel:+17202527037">(720) 252-7037</a>
              </article>
              <article className="rounded-2xl border border-white/10 bg-[#102642] p-5">
                <p className="text-xs font-bold uppercase tracking-[.15em] text-[#e7ad3e]">Secure loan application</p>
                <h2 className="mt-2 text-2xl font-black">Bryce Waite</h2>
                <p className="mt-1 text-sm text-white/65">Citywide Home Mortgage · NMLS 1642253 · AZ LO-2009629</p>
                <a className="mt-4 inline-flex rounded-lg bg-[#e7ad3e] px-4 py-2.5 font-black text-[#07182d]" href={BRYCE_APPLICATION_URL} target="_blank" rel="noopener noreferrer">Apply with Bryce →</a>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="buyer-check" className="bg-[#f5f1e9] px-5 py-16 text-[#07182d] sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-[#a36e12]">60-second buyer check</p>
            <h2 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">Tell us where you are. We’ll help with what comes next.</h2>
            <p className="mt-5 text-base leading-7 text-[#33445a]">There is no “perfect” starting point. Your answer routes you to Mary for real estate, Scott for a mortgage-planning conversation, or Bryce’s secure application when you are ready to apply.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {['Understand your buying range', 'Explore down-payment options', 'Plan around credit and timing', 'Coordinate the home and financing search'].map((item) => (
                <div key={item} className="flex gap-3 rounded-xl border border-[#153052]/10 bg-white p-4 font-semibold shadow-sm"><span className="text-[#b87b12]">✓</span>{item}</div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#153052]/12 bg-white p-6 shadow-xl sm:p-9">
            {status === 'done' ? (
              <div className="flex min-h-[580px] flex-col items-center justify-center text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[#e7ad3e] text-3xl">✓</div>
                <h2 className="mt-6 font-serif text-4xl font-bold">You’re all set, {form.firstName}.</h2>
                <p className="mt-4 max-w-lg text-lg leading-8 text-[#42536a]">Your information has been saved and your requested next step is ready.</p>
                {form.route === 'Real-estate help from Mary' ? <a href="tel:+16235704245" className="mt-8 rounded-xl bg-[#07182d] px-7 py-4 font-bold text-white">Call Mary now</a> : null}
                {form.route === 'Mortgage planning call with Scott' ? <a href="tel:+17202527037" className="mt-8 rounded-xl bg-[#07182d] px-7 py-4 font-bold text-white">Call Scott now</a> : null}
                {form.route === 'Start a loan application with Bryce' ? <a href={BRYCE_APPLICATION_URL} target="_blank" rel="noopener noreferrer" className="mt-8 rounded-xl bg-[#e7ad3e] px-7 py-4 font-bold text-[#07182d]">Open Bryce’s secure application</a> : null}
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label><span className="mb-2 block text-sm font-bold">First name</span><input className={inputClass} value={form.firstName} onChange={(e) => update('firstName', e.target.value)} autoComplete="given-name" required /></label>
                  <label><span className="mb-2 block text-sm font-bold">Last name</span><input className={inputClass} value={form.lastName} onChange={(e) => update('lastName', e.target.value)} autoComplete="family-name" required /></label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label><span className="mb-2 block text-sm font-bold">Email</span><input type="email" className={inputClass} value={form.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" required /></label>
                  <label><span className="mb-2 block text-sm font-bold">Mobile phone</span><input type="tel" className={inputClass} value={form.phone} onChange={(e) => update('phone', e.target.value)} autoComplete="tel" required /></label>
                </div>
                <SelectField label="Where in Arizona are you considering?" value={form.area} onChange={(v) => update('area', v)} options={['Phoenix / West Valley', 'Phoenix / East Valley', 'North Phoenix / Scottsdale', 'Tucson area', 'Northern Arizona', 'Another Arizona area', 'Not sure yet']} />
                <SelectField label="What is your current housing situation?" value={form.housing} onChange={(v) => update('housing', v)} options={['Renting', 'Own a home', 'Living with family or friends', 'Relocating to Arizona', 'Another situation']} />
                <SelectField label="How would you describe your credit today?" value={form.credit} onChange={(v) => update('credit', v)} options={['Excellent (740+)', 'Good (680–739)', 'Fair (620–679)', 'Still working on it', 'I am not sure']} />
                <SelectField label="What would help you most right now?" value={form.goal} onChange={(v) => update('goal', v)} options={['Understanding what I can afford', 'Down-payment options', 'Monthly-payment planning', 'Credit guidance', 'Finding the right home', 'I need a place to start']} />
                <SelectField label="Who should handle your next step?" value={form.route} onChange={(v) => update('route', v)} options={['Real-estate help from Mary', 'Mortgage planning call with Scott', 'Start a loan application with Bryce']} />
                <SelectField label="When might you want to buy?" value={form.timeline} onChange={(v) => update('timeline', v)} options={['As soon as possible', 'Within 3 months', '3–6 months', '6–12 months', 'More than a year', 'Just exploring']} />
                <label className="flex gap-3 rounded-xl bg-[#f3f5f7] p-4 text-xs leading-5 text-[#48576b]">
                  <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <span>{CONSENT_TEXT}</span>
                </label>
                {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
                <button disabled={status === 'sending'} className="w-full rounded-xl bg-[#e7ad3e] px-6 py-4 text-base font-black uppercase tracking-[.06em] text-[#07182d] disabled:opacity-60">
                  {status === 'sending' ? 'Saving your answers…' : 'Get my next-step plan'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#e7ad3e]">One coordinated team</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-bold">The home search and financing plan should work together.</h2>
          <p className="mx-auto mt-5 max-w-3xl leading-7 text-white/65">Mary handles the real-estate path. Scott is the first phone conversation for mortgage planning. When you are ready for a formal loan application, the secure application goes directly to Bryce, the Arizona-licensed loan officer.</p>
          <div className="mt-10 grid gap-5 text-left md:grid-cols-3">
            {[['Start with clarity', 'Understand the variables that shape price, payment, and timing.'], ['Build the plan', 'Identify practical next steps based on your goals—not a generic checklist.'], ['Move when ready', 'Coordinate financing and the home search when the timing makes sense for you.']].map(([title, copy], index) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/[.05] p-6"><span className="text-sm font-black text-[#e7ad3e]">0{index + 1}</span><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-white/60">{copy}</p></article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-10 text-sm text-white/50">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <div><p className="font-serif text-xl font-bold text-white">Move With Mary V</p><p className="mt-2">Mary Vega · Keller Williams Professional Partners · AZ SA648249000</p><p>Mortgage planning: Scott Smith · NMLS 2244351</p><p>Arizona application: Bryce Waite · Citywide Home Mortgage · NMLS 1642253 · AZ LO-2009629</p></div>
          <div className="md:text-right"><p>Equal Housing Opportunity. Information is educational and does not constitute a loan approval, commitment to lend, or guarantee of financing.</p><div className="mt-3 flex gap-4 md:justify-end"><a href="/privacy" className="text-white/75">Privacy</a><a href="/login" className="text-white/75">Member login</a></div></div>
        </div>
      </footer>
    </main>
  );
}
