import Shell from '@/components/Shell';
import {
  bookingUrl,
  agentName, agentBrokerage, agentArea, agentLicense,
  lenderName, lenderTitle, lenderNmls, lenderCompany, lenderCompanyNmls,
} from '@/lib/content';
import { ArrowRight, Phone, IdCard, GraduationCap, MessageSquare, MapPin, Home, Landmark } from 'lucide-react';

export default function AboutPage() {
  return (
    <Shell>
      {/* Hero */}
      <section className="mb-6 overflow-hidden rounded-[2rem] bg-[#061426] text-white shadow-card">
        <div className="grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto]">
          <div className="order-2 lg:order-1">
            <p className="kicker mb-5 text-white after:bg-gold">Move With Mary V</p>
            <h1 className="brand-serif text-5xl font-black leading-[1.02] sm:text-6xl">Meet Mary Vega</h1>
            <p className="mt-3 text-sm font-black uppercase tracking-[.16em] text-gold">
              REALTOR® · Keller Williams · {agentArea}
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
              I built my business around the two things clients tell me matter most: real education and
              clear, honest communication. When you understand the market and always know where your
              transaction stands, the whole process gets less stressful &mdash; and the decisions get easier.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href={bookingUrl} className="btn-primary">Book a Strategy Call <ArrowRight size={18} /></a>
              <a href="tel:+16235704245" className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-3 text-sm font-bold text-gold transition hover:bg-gold hover:text-[#061426]">
                <Phone size={16} /> (623) 570-4245
              </a>
            </div>
          </div>
          <div className="order-1 flex justify-center lg:order-2">
            <div className="rounded-full border-2 border-gold/50 p-1.5 shadow-card">
              <img
                src="/images/mary-headshot.png"
                alt="Mary Vega, REALTOR®"
                width={240}
                height={240}
                className="h-[220px] w-[220px] rounded-full object-cover sm:h-[260px] sm:w-[260px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* My approach */}
      <section className="mb-6 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="card-light p-7 sm:p-9">
          <p className="kicker mb-4">My Approach</p>
          <h2 className="brand-serif text-3xl font-black leading-tight text-[#061426]">
            Your best interest, at the center of every move.
          </h2>
          <p className="mt-5 text-base leading-8 text-[#465668]">
            With deep knowledge of the {agentArea} market and a strong track record of getting clients to
            their goals, I keep your best interest first. Real estate has a lot of moving parts, and the small
            details are where deals are won or lost. My job is to handle the intricacies, keep you informed
            with up-to-date information, and communicate clearly at every step &mdash; so you can stay focused
            on your goals instead of the guesswork.
          </p>
          <p className="mt-4 text-base leading-8 text-[#465668]">
            Whether you&rsquo;re buying your first home, moving up, or selling, I&rsquo;m here for all of your
            real estate needs.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <div className="card-paper flex items-start gap-4 p-6">
            <GraduationCap className="mt-1 flex-none text-gold" size={26} />
            <div>
              <h3 className="font-serif text-xl font-black text-[#061426]">Education first</h3>
              <p className="mt-1 text-sm leading-6 text-[#465668]">Learn the process before you shop, so you make confident, informed decisions.</p>
            </div>
          </div>
          <div className="card-paper flex items-start gap-4 p-6">
            <MessageSquare className="mt-1 flex-none text-gold" size={26} />
            <div>
              <h3 className="font-serif text-xl font-black text-[#061426]">Clear communication</h3>
              <p className="mt-1 text-sm leading-6 text-[#465668]">You&rsquo;ll always know what&rsquo;s happening and what comes next &mdash; no guessing.</p>
            </div>
          </div>
          <div className="card-paper flex items-start gap-4 p-6 sm:col-span-2 lg:col-span-1">
            <MapPin className="mt-1 flex-none text-gold" size={26} />
            <div>
              <h3 className="font-serif text-xl font-black text-[#061426]">West Valley expertise</h3>
              <p className="mt-1 text-sm leading-6 text-[#465668]">Local knowledge of {agentArea} pricing, neighborhoods, and what actually moves.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Your team — co-brand */}
      <section className="mb-6">
        <p className="kicker mb-4 justify-center text-center">Your Team</p>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="card p-7">
            <Home className="text-gold" size={30} />
            <h3 className="mt-4 brand-serif text-2xl font-black text-white">{agentName}</h3>
            <p className="mt-1 text-xs font-bold uppercase tracking-[.14em] text-gold">Your Real Estate Agent</p>
            <p className="mt-4 leading-7 text-ice/70">
              {agentBrokerage}. From touring and comparing homes to writing offers and getting you to the
              closing table &mdash; Mary handles the real estate side.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ice/50">
              <IdCard size={14} /> {agentLicense}
            </p>
          </div>
          <div className="card p-7">
            <Landmark className="text-gold" size={30} />
            <h3 className="mt-4 brand-serif text-2xl font-black text-white">{lenderName}</h3>
            <p className="mt-1 text-xs font-bold uppercase tracking-[.14em] text-gold">Your Financing Partner</p>
            <p className="mt-4 leading-7 text-ice/70">
              {lenderTitle}, {lenderCompany}. Pre-approval, loan options, down-payment strategy, and payment
              planning &mdash; Scott handles the financing side.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ice/50">
              <IdCard size={14} /> NMLS #{lenderNmls} · Co. NMLS #{lenderCompanyNmls} · Equal Housing Lender
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mb-6 overflow-hidden rounded-[2rem] bg-[#061426] p-8 text-center text-white shadow-card sm:p-10">
        <h2 className="brand-serif text-3xl font-black sm:text-4xl">Ready when you are.</h2>
        <p className="mx-auto mt-3 max-w-xl leading-7 text-white/70">
          Book a no-pressure strategy call and we&rsquo;ll map out your next best step &mdash; together.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a href={bookingUrl} className="btn-primary">Book a Strategy Call <ArrowRight size={18} /></a>
          <a href="/mary-vega.vcf" download className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-3 text-sm font-bold text-gold transition hover:bg-gold hover:text-[#061426]">
            Save my contact
          </a>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="rounded-[2rem] border border-[#c9962b]/25 bg-white/80 p-6 shadow-card sm:p-8">
        <p className="kicker mb-3">Important Note</p>
        <p className="max-w-5xl text-sm leading-7 text-[#465668]">
          This site and the resources inside it are educational only. They are not a loan approval,
          pre-approval, commitment to lend, legal advice, tax advice, or financial advice. Loan options,
          program availability, and eligibility depend on borrower, property, program, and underwriting
          requirements. Equal Housing Opportunity.
        </p>
      </section>
    </Shell>
  );
}
