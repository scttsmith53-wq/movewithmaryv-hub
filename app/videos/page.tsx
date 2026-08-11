import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import EventLink from "@/components/EventLink";
import { bookingUrl, agentArea } from "@/lib/content";
import { ArrowRight, FileText } from "lucide-react";

// ---------------------------------------------------------------------------
// Curated third-party educational videos. To swap any video, replace `id` with
// the YouTube video ID (the part after watch?v=). REVIEW each one before making
// the site public — these are general-education videos, not our advice, and no
// video should be relied on for rates, approval, or eligibility.
// ---------------------------------------------------------------------------
type Vid = { topic: string; title: string; id: string; blurb: string; start?: number };

const videos: Vid[] = [
  { topic: "Getting Started", title: "Mortgage Pre-Approval, Explained", id: "oWpFicPbUPI", start: 86,
    blurb: "What pre-approval is, why it matters, and what to expect — before you shop." },
  { topic: "Credit", title: "Boost Your Credit Score to Buy a Home", id: "JNL7ZsfKD_4",
    blurb: "Simple, practical ways to strengthen your credit profile before you apply." },
  { topic: "Financing", title: "Down Payment Assistance Programs", id: "GRcRFBLM7uY",
    blurb: "How assistance programs work and who may qualify — ask us about Arizona options." },
  { topic: "Buy vs. Rent", title: "Renting vs. Buying — The Real Case for Owning", id: "yhBAMAsu4Qk",
    blurb: "A clear look at the math and the long-term picture behind owning a home." },
  { topic: "The Process", title: "What to Expect at a Home Inspection", id: "j-SJ9G1K8bo",
    blurb: "What inspectors look at, and how to think about the results." },
  { topic: "The Process", title: "The Home Appraisal, Explained", id: "MqfQJFCq5U4",
    blurb: "How value is determined and what happens if it comes in low." },
  { topic: "Closing", title: "What to Expect on Closing Day", id: "wP7qD6MtlwA",
    blurb: "The final step — what you'll sign, what to bring, and how to prepare." },
];

export default function VideosPage() {
  return (
    <Shell>
      <PageHeader eyebrow="Learn" title="Homebuyer video library">
        Short, plain-English videos on the parts of buying that trip people up — curated for buyers
        in {agentArea}. Watch anytime, then bring your questions to a strategy call.
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        {videos.map((v) => (
          <article key={v.id} className="card overflow-hidden p-0">
            <div className="aspect-video w-full bg-black">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${v.id}${v.start ? `?start=${v.start}` : ""}`}
                title={v.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-5">
              <p className="kicker mb-2 text-gold">{v.topic}</p>
              <h3 className="font-serif text-xl font-black leading-snug text-white">{v.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ice/65">{v.blurb}</p>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-9 grid gap-4 sm:grid-cols-[1.4fr_1fr]">
        <div className="card p-6">
          <h3 className="font-serif text-2xl font-black text-white">Have a question a video didn&rsquo;t answer?</h3>
          <p className="mt-2 text-sm leading-7 text-ice/65">
            Every situation is different. Book a quick strategy call and we&rsquo;ll give you answers
            specific to your goals, timeline, and numbers.
          </p>
          <EventLink
            href={bookingUrl}
            eventType="STRATEGY_CALL_CLICKED"
            eventValue="videos_page"
            className="btn-primary mt-5 inline-flex"
          >
            Book a Strategy Call <ArrowRight size={18} />
          </EventLink>
        </div>
        <Link href="/resources" className="card flex flex-col justify-center p-6 transition hover:-translate-y-0.5">
          <FileText className="text-gold" size={28} />
          <h3 className="mt-3 font-serif text-xl font-black text-white">Prefer to read?</h3>
          <p className="mt-2 text-sm leading-6 text-ice/65">
            Download the printable homebuyer guides.
          </p>
          <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-gold">
            Browse the guides <ArrowRight size={16} />
          </span>
        </Link>
      </section>

      <p className="mt-8 max-w-4xl text-xs leading-6 text-ice/45">
        Videos are third-party educational content curated for general learning. They are not advice
        and not a statement of your rates, loan approval, program eligibility, or the terms of any
        transaction. Views expressed are the creators&rsquo; own. For guidance specific to your
        situation, speak with Mary and Scott.
      </p>
    </Shell>
  );
}
