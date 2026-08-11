'use client';

import Shell from '@/components/Shell';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator,
  CreditCard,
  FileCheck2,
  Handshake,
  Home,
  KeyRound,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { bookingUrl } from '@/lib/content';

const journeyPages = [
  {
    phase: 'Foundation',
    img: '/images/chapters/chapter-foundation.jpg',
    eyebrow: 'Chapter 1',
    title: 'Build the foundation.',
    summary: 'Start with clarity before pressure shows up. Learn the process, understand the big picture, and begin with confidence.',
    coverNote: 'Start Here',
    stops: [
      {
        n: 1,
        title: 'Build Confidence',
        body: 'Review the roadmap and learn the homebuying path before you start comparing houses.',
        icon: BookOpen,
        actions: [
          { label: 'View Roadmap', href: '/resources/buy-with-confidence-roadmap' },
          { label: 'Watch Webinar', href: '/webinar' }
        ],
        current: false
      },
      {
        n: 2,
        title: 'Understand Your Numbers',
        body: 'Explore payment comfort, upfront costs, assistance options, and the cost of waiting.',
        icon: Calculator,
        actions: [
          { label: 'Open Calculators', href: '/calculators' },
          { label: 'DPA Options', href: '/dpa' }
        ],
        current: false
      }
    ]
  },
  {
    phase: 'Preparation',
    img: '/images/chapters/chapter-preparation.jpg',
    eyebrow: 'Chapter 2',
    title: 'Strengthen your position.',
    summary: 'Use the right resources to organize your credit, documents, and financing questions before the pre-approval conversation.',
    coverNote: 'You Are Here',
    stops: [
      {
        n: 3,
        title: 'Strengthen Your Position',
        body: 'Use the Credit Center, readiness guide, and paydown planner to prepare without overwhelming yourself.',
        icon: CreditCard,
        actions: [{ label: 'Credit Center', href: '/credit' }],
        current: true
      },
      {
        n: 4,
        title: 'Get Pre-Approved',
        body: 'Gather common documents and turn your information into a clear financing strategy.',
        icon: FileCheck2,
        actions: [
          { label: 'Document Guide', href: '/resources/mortgage-document-guide' },
          { label: 'Book Strategy Call', href: bookingUrl, external: true }
        ],
        current: false
      }
    ]
  },
  {
    phase: 'Home Search',
    img: '/images/chapters/chapter-search.jpg',
    eyebrow: 'Chapter 3',
    title: 'Shop with a plan.',
    summary: 'Move from preparation into home search with clearer numbers, stronger questions, and a better team around you.',
    coverNote: 'Next Stage',
    stops: [
      {
        n: 5,
        title: 'Start Shopping',
        body: 'Tour homes and compare options with a clearer picture of payment, timing, and next steps.',
        icon: Home,
        actions: [{ label: 'Shopping Resources', href: '/resources/inspection-and-appraisal-guide' }],
        current: false
      },
      {
        n: 6,
        title: 'Make a Strong Offer',
        body: 'Use inspection, appraisal, negotiation, and contract resources to make smart decisions.',
        icon: Handshake,
        actions: [{ label: 'Offer Resources', href: '/resources/inspection-and-appraisal-guide' }],
        current: false
      }
    ]
  },
  {
    phase: 'Closing',
    img: '/images/chapters/chapter-closing.jpg',
    eyebrow: 'Chapter 4',
    title: 'Close with confidence.',
    summary: 'Prepare for closing day, protect your funds, understand what you may sign, and get ready for the keys.',
    coverNote: 'Finish Line',
    stops: [
      {
        n: 7,
        title: 'Close With Confidence',
        body: 'Know what to expect before, during, and after closing day so the final step feels more predictable.',
        icon: KeyRound,
        actions: [
          { label: 'Closing Day Guide', href: '/resources/closing-day-guide' },
          { label: 'Schedule Strategy Call', href: bookingUrl, external: true }
        ],
        current: false
      }
    ]
  }
];

type JourneyPage = (typeof journeyPages)[number];
type JourneyStop = JourneyPage['stops'][number];

function ActionLink({ action, primary }: { action: JourneyStop['actions'][number]; primary?: boolean }) {
  const className = primary ? 'btn-primary' : 'btn-secondary';

  if ('external' in action && action.external) {
    return (
      <a href={action.href} className={className} target="_blank" rel="noopener noreferrer">
        {action.label} <ArrowRight size={15} />
      </a>
    );
  }

  return (
    <Link href={action.href} className={className}>
      {action.label} <ArrowRight size={15} />
    </Link>
  );
}

function StopCard({ stop, index }: { stop: JourneyStop; index: number }) {
  const Icon = stop.icon;

  return (
    <article
      className={`group rounded-2xl border p-5 transition duration-200 md:p-6 ${
        stop.current
          ? 'border-gold/55 bg-gold/[.075] shadow-[0_0_34px_rgba(233,193,118,.08)]'
          : 'border-white/10 bg-white/[.035] hover:border-gold/35 hover:bg-white/[.055]'
      }`}
    >
      <div className="flex gap-5">
        <div className="hidden shrink-0 font-serif text-6xl font-bold leading-none text-white/[.08] sm:block">
          {String(stop.n).padStart(2, '0')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-3">
            <div
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${
                stop.current ? 'border-gold/45 bg-gold/20 text-gold' : 'border-gold/25 bg-gold/[.08] text-gold/80'
              }`}
            >
              <Icon size={21} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-gold/80">
                Step {stop.n} {stop.current ? '• You Are Here' : ''}
              </p>
              <h3 className="brand-serif mt-1 text-xl font-bold leading-tight text-white">{stop.title}</h3>
            </div>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/58">{stop.body}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {stop.actions.map((action, actionIndex) => (
              <ActionLink key={action.label} action={action} primary={stop.current || (index === 0 && actionIndex === 0)} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ReadinessPage() {
  const currentIndex = Math.max(0, journeyPages.findIndex((chapter) => chapter.stops.some((stop) => stop.current)));
  const [page, setPage] = useState(currentIndex);
  const current = journeyPages[page];
  const progress = useMemo(() => Math.round(((page + 1) / journeyPages.length) * 100), [page]);

  return (
    <Shell>
      <section className="hero-dark mb-7 p-7 text-white sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <p className="kicker mb-5">Buyer Confidence Guidebook</p>
            <h1 className="brand-serif text-4xl font-bold leading-tight sm:text-6xl">
              Your homebuying journey, <span className="text-gold">one chapter at a time.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              Move through the major stages of the buying process with the right guide, tool, or next step at the right time.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-gold">Current Chapter</p>
                <h2 className="brand-serif mt-1 text-2xl font-bold text-white">{current.phase}</h2>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
                <Sparkles size={24} />
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-3 text-sm font-semibold text-white/58">Chapter {page + 1} of {journeyPages.length} • {progress}% through the guidebook</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="lux-card p-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-gold/20 bg-white/[.04] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.22em] text-gold">{current.eyebrow}</p>
            <h2 className="brand-serif mt-3 text-4xl font-bold leading-tight text-white">{current.phase}</h2>
            <p className="mt-4 text-sm leading-7 text-white/58">{current.summary}</p>
            <div className="mt-6 inline-flex rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-gold">
              {current.coverNote}
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {journeyPages.map((chapter, index) => (
              <button
                key={chapter.phase}
                onClick={() => setPage(index)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  index === page
                    ? 'border-gold/45 bg-gold/10 text-gold'
                    : 'border-white/10 bg-white/[.03] text-white/58 hover:border-gold/25 hover:text-white'
                }`}
              >
                <span className="text-sm font-bold">{chapter.phase}</span>
                <span className="text-xs font-bold uppercase tracking-[.14em]">{index + 1}/{journeyPages.length}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="lux-card overflow-hidden">
          <div className="relative h-44 w-full overflow-hidden sm:h-56">
            <img src={current.img} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101415] via-[#101415]/55 to-[#101415]/10" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <p className="kicker mb-2">{current.eyebrow}</p>
              <h2 className="brand-serif text-3xl font-bold leading-tight text-white sm:text-5xl">{current.title}</h2>
            </div>
          </div>

          <div className="relative p-5 sm:p-8">
            <div className="pointer-events-none absolute bottom-0 left-10 top-8 hidden w-px bg-gradient-to-b from-gold/60 via-gold/20 to-transparent sm:block" />
            <div className="space-y-5">
              {current.stops.map((stop, index) => (
                <StopCard key={stop.n} stop={stop} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="btn-secondary disabled:pointer-events-none disabled:opacity-35"
        >
          <ArrowLeft size={16} /> Previous Chapter
        </button>

        <div className="flex items-center gap-2">
          {journeyPages.map((chapter, index) => (
            <button
              key={chapter.phase}
              onClick={() => setPage(index)}
              className={`h-2.5 rounded-full transition-all ${index === page ? 'w-10 bg-gold' : 'w-2.5 bg-white/18 hover:bg-gold/50'}`}
              aria-label={`Open ${chapter.phase}`}
            />
          ))}
        </div>

        {page < journeyPages.length - 1 ? (
          <button onClick={() => setPage((p) => Math.min(journeyPages.length - 1, p + 1))} className="btn-primary">
            Next Chapter <ArrowRight size={16} />
          </button>
        ) : (
          <a href={bookingUrl} className="btn-primary" target="_blank" rel="noopener noreferrer">
            Book Strategy Call <ArrowRight size={16} />
          </a>
        )}
      </div>

      <section className="mt-7 rounded-2xl border border-gold/20 bg-[#0b0f10] p-7 text-white sm:p-9">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="kicker mb-3">Need guidance?</p>
            <h2 className="brand-serif text-3xl font-bold">The guidebook gives you the path. A strategy call makes it personal.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
              Connect your numbers, timeline, and questions to a plan built around your goals.
            </p>
          </div>
          <a href={bookingUrl} className="btn-primary" target="_blank" rel="noopener noreferrer">
            Schedule a Buyer Strategy Call <ShieldCheck size={17} />
          </a>
        </div>
      </section>
    </Shell>
  );
}
