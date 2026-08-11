import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import EventLink from "@/components/EventLink";
import { bookingUrl, agentName, agentArea } from "@/lib/content";
import { FileText, ArrowRight } from "lucide-react";

// FSBO guide is intentionally hidden for now (prior PDF was co-branded to
// another brokerage). Mary's own co-branded seller resources will go here.
export default function FsboPage() {
  return (
    <Shell>
      <PageHeader eyebrow="Selling on your own?" title="For-sale-by-owner help, coming soon">
        {agentName} can walk you through pricing, buyer qualification, contracts, and the parts of a
        {` ${agentArea} `} sale that are easy to get wrong — with no pressure to list.
      </PageHeader>

      <section className="card p-8 text-center sm:p-12">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
          <FileText size={26} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-white">A co-branded seller guide is on the way</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ice/65">
          In the meantime, the fastest help is a quick conversation. {agentName} is happy to answer FSBO
          questions before they get expensive.
        </p>
        <EventLink
          href={bookingUrl}
          eventType="FSBO_STRATEGY_CALL_CLICKED"
          eventValue="fsbo_placeholder"
          className="btn-primary mt-6 inline-flex"
        >
          Ask {agentName} a Question <ArrowRight size={18} />
        </EventLink>
      </section>
    </Shell>
  );
}
