import Shell from '@/components/Shell';
import EventLink from '@/components/EventLink';
import AskQuestion from '@/components/AskQuestion';
import { bookingUrl, fsboGuideUrl, fsboLandingUrl } from '@/lib/content';
import { ArrowRight, BookOpen, Calculator, CheckCircle2, ClipboardCheck, FileText, Home, Sparkles, Users } from 'lucide-react';

const fsboStages = [
  {
    title: 'Price with a plan',
    body: 'Understand recent comparable sales, active competition, buyer expectations, and the risk of testing the market too high.',
    icon: Calculator,
  },
  {
    title: 'Prepare your showing strategy',
    body: 'Create a simple process for scheduling, safety, buyer questions, and follow-up without losing control of your time.',
    icon: Home,
  },
  {
    title: 'Screen buyers carefully',
    body: 'Know the difference between interest, pre-qualification, pre-approval, cash proof, and a buyer who can actually close.',
    icon: Users,
  },
  {
    title: 'Protect the paperwork',
    body: 'Disclosures, timelines, contract deadlines, inspection responses, and appraisal issues all need to be handled cleanly.',
    icon: FileText,
  },
];

const guideHighlights = [
  'FSBO pricing and presentation checklist',
  'Questions to ask buyers before accepting an offer',
  'Common inspection and appraisal pressure points',
  'When keeping control still means getting professional help',
];

export default function FSBOPage() {
  return (
    <Shell>
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f10] shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(201,150,43,.18),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(255,255,255,.08),transparent_28%)]" />
        <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_390px] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-gold/35 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[.22em] text-gold">
              FSBO Seller Center
            </p>
            <h1 className="font-serif text-4xl font-bold leading-tight text-white sm:text-6xl">
              Sell by owner with more confidence.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/64">
              The FSBO section is built for sellers who want to stay in control, understand the process, and avoid the expensive surprises that can show up after a buyer is already interested.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <EventLink
                href={fsboGuideUrl}
                eventType="FSBO_GUIDE_OPENED"
                metadata={{ source: 'fsbo_portal_page', guide: 'fsbo_seller_guide' }}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold uppercase tracking-[.08em] text-[#101415] shadow-gold-soft transition hover:-translate-y-0.5"
              >
                Open FSBO Guide <ArrowRight size={16} />
              </EventLink>
              <AskQuestion
                source="fsbo_portal_page"
                triggerClassName="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-5 py-3 text-sm font-bold uppercase tracking-[.08em] text-white/80 transition hover:border-gold/45 hover:text-gold"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gold/25 bg-white/[.06] p-1 backdrop-blur">
            <div className="rounded-[14px] bg-[#fffdf8] p-6 text-[#101415]">
              <img
                src="/resources/thumbs/fsbo-seller-guide.png"
                alt="The Complete FSBO Seller Guide for Arizona Homeowners"
                className="mb-5 w-full rounded-lg border border-black/10 shadow-md"
              />
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#8a6218]">Featured Guide</p>
              <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-[#061426]">FSBO Seller Guide</h2>
              <p className="mt-3 text-sm leading-6 text-[#52616f]">
                A practical guide for Arizona sellers who want to understand pricing, showings, buyer qualification, contracts, and when professional help may be worth it.
              </p>
              <div className="mt-5 space-y-2">
                {guideHighlights.map((item) => (
                  <div key={item} className="flex gap-2 text-sm text-[#52616f]">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-gold" size={16} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <EventLink
                href={fsboLandingUrl}
                eventType="FSBO_LANDING_PAGE_CLICKED"
                metadata={{ source: 'fsbo_portal_page' }}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#061426]"
              >
                View the public FSBO page <ArrowRight size={14} />
              </EventLink>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-2">
        {fsboStages.map((stage, i) => (
          <figure key={stage.title} className="overflow-hidden rounded-2xl border border-white/10 transition hover:border-gold/45">
            <img src={`/images/fsbo/stage-${i + 1}.jpg`} alt={stage.title} className="block w-full" />
          </figure>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-white/[.04] text-gold">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.22em] text-gold">Read it here</p>
            <h2 className="font-serif text-2xl font-bold text-white">FSBO Seller Guide</h2>
          </div>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-[#c9962b]/25 bg-white shadow-2xl">
          <iframe
            src={`${fsboGuideUrl}#toolbar=1&navpanes=0`}
            title="FSBO Seller Guide"
            className="h-[78vh] w-full bg-white"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <EventLink
            href={fsboGuideUrl}
            eventType="FSBO_GUIDE_DOWNLOADED"
            metadata={{ source: 'fsbo_inline_viewer', guide: 'fsbo_seller_guide' }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-sm font-bold uppercase tracking-[.08em] text-gold transition hover:bg-gold hover:text-[#101415]"
          >
            Open / Download PDF <ArrowRight size={15} />
          </EventLink>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border border-white/10 bg-white/[.045] p-7 sm:p-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold">FSBO Reality Check</p>
          <h2 className="font-serif text-3xl font-bold leading-tight text-white">The goal is not to talk you out of selling by owner.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58">
            The goal is to help you understand where FSBO sellers usually keep leverage, where they unintentionally give it away, and what to have ready before a buyer starts asking serious questions.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#0b0f10]/60 p-4">
              <p className="font-bold text-white">Net matters more than price</p>
              <p className="mt-2 text-xs leading-5 text-white/45">Concessions, repairs, appraisal gaps, and timelines can change the real outcome.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0b0f10]/60 p-4">
              <p className="font-bold text-white">A buyer is not a closing</p>
              <p className="mt-2 text-xs leading-5 text-white/45">Financing, contingencies, inspection, and appraisal still have to survive the process.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0b0f10]/60 p-4">
              <p className="font-bold text-white">Control needs structure</p>
              <p className="mt-2 text-xs leading-5 text-white/45">A clean process helps you stay in control without becoming overwhelmed.</p>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-gold/25 bg-gold/10 p-6">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold text-[#101415]">
            <Sparkles size={23} />
          </div>
          <h3 className="mt-5 font-serif text-2xl font-bold leading-tight text-white">Want a second set of eyes?</h3>
          <p className="mt-3 text-sm leading-6 text-white/58">
            If you are not sure about pricing, buyer qualification, inspection response, or paperwork, you can ask Mary before it becomes expensive.
          </p>
          <EventLink
            href={bookingUrl}
            eventType="FSBO_STRATEGY_CALL_CLICKED"
            metadata={{ source: 'fsbo_sidebar_cta' }}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold uppercase tracking-[.08em] text-[#101415]"
          >
            Schedule FSBO Strategy Call <ArrowRight size={16} />
          </EventLink>
        </aside>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-[#0b0f10] p-7 sm:p-8">
        <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-gold/30 bg-white/[.04] text-gold">
            <ClipboardCheck size={26} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.22em] text-gold">Member Portal Resource</p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-white">Add the FSBO Guide to your seller toolkit.</h2>
            <p className="mt-2 text-sm leading-6 text-white/52">
              This page connects the FSBO landing page, guide, and follow-up process inside the same portal experience as the Buyer Confidence Hub.
            </p>
          </div>
          <EventLink
            href={fsboGuideUrl}
            eventType="FSBO_GUIDE_DOWNLOADED"
            metadata={{ source: 'fsbo_bottom_cta', guide: 'fsbo_seller_guide' }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/50 px-5 py-3 text-sm font-bold uppercase tracking-[.08em] text-gold transition hover:bg-gold hover:text-[#101415]"
          >
            Open Guide <ArrowRight size={16} />
          </EventLink>
        </div>
      </section>
    </Shell>
  );
}
