import Shell from '@/components/Shell';
import PageHeader from '@/components/PageHeader';
import EventLink from '@/components/EventLink';
import { bookingUrl, agentName, agentArea } from '@/lib/content';
import { Star, Quote, ArrowRight } from 'lucide-react';

// NOTE: Client reviews are intentionally empty. Do not display another
// professional's testimonials here. Add Mary's own verified reviews to this
// array (name, date, text, optional tags) when available.
type Review = { name: string; date: string; text: string; tags?: string[] };
const reviews: Review[] = [];

function Stars() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={16} className="text-gold" fill="currentColor" />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  return (
    <Shell>
      <PageHeader eyebrow="Client Reviews" title={`Working with ${agentName}`}>
        Reviews from {agentName}&rsquo;s clients across {agentArea} will appear here soon. In the
        meantime, the best way to see how she works is a quick, no-pressure conversation.
      </PageHeader>

      {reviews.length === 0 ? (
        <section className="rounded-2xl border border-gold/25 bg-gold/[.06] px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex w-fit items-center gap-1">
            <Stars />
          </div>
          <h2 className="font-serif text-2xl font-bold text-white">Reviews coming soon</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ice/65">
            {agentName} is a licensed Arizona REALTOR&reg; with Keller Williams serving {agentArea}.
            Verified client reviews will be featured here.
          </p>
        </section>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {reviews.map((r) => (
            <article key={r.name + r.date} className="mb-5 break-inside-avoid rounded-2xl border border-white/10 bg-white/[.045] p-5">
              <div className="mb-3 flex items-center justify-between">
                <Stars />
                <Quote size={18} className="text-gold/50" />
              </div>
              <p className="text-sm leading-6 text-ice/80">{r.text}</p>
              {r.tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.tags.map((t) => (
                    <span key={t} className="rounded-full bg-white/[.06] px-2 py-0.5 text-[10px] font-bold text-ice/55">{t}</span>
                  ))}
                </div>
              ) : null}
              <p className="mt-4 text-sm font-bold text-white">
                {r.name} <span className="font-normal text-ice/45">· {r.date}</span>
              </p>
            </article>
          ))}
        </div>
      )}

      <section className="mt-10 rounded-2xl border border-gold/25 bg-[#0b0f10] p-8 text-center">
        <h2 className="font-serif text-3xl font-bold text-white">Ready to write your own success story?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-ice/65">
          Whether you&rsquo;re buying, selling, or just have questions — a quick, no-pressure conversation is
          the best place to start.
        </p>
        <EventLink
          href={bookingUrl}
          eventType="TESTIMONIALS_STRATEGY_CALL_CLICKED"
          eventValue="testimonials_page"
          className="btn-secondary mt-6 inline-flex"
        >
          Book a Free Strategy Call <ArrowRight size={16} />
        </EventLink>
        <p className="mt-4 text-[11px] leading-4 text-ice/40">
          Individual results may vary.
        </p>
      </section>
    </Shell>
  );
}
