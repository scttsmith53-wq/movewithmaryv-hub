import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import EventLink from "@/components/EventLink";
import { bookingUrl, agentName, agentArea } from "@/lib/content";
import { BookOpen, ArrowRight } from "lucide-react";

// Resource library is intentionally empty for now. The prior guides were
// co-branded to another brokerage; Mary's own Keller Williams / co-branded
// resources will be added here. Do not surface another brand's PDFs.
export default function ResourcesPage() {
  return (
    <Shell>
      <PageHeader eyebrow="Resource Library" title="Guides coming soon">
        {agentName} is putting together a co-branded set of homebuyer and seller guides for {agentArea}.
        They&rsquo;ll live here shortly.
      </PageHeader>

      <section className="card p-8 text-center sm:p-12">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
          <BookOpen size={26} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-white">New resources on the way</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ice/65">
          Want something specific in the meantime? Book a quick strategy call and {agentName} will get you
          exactly what you need for your move.
        </p>
        <EventLink
          href={bookingUrl}
          eventType="RESOURCES_STRATEGY_CALL_CLICKED"
          eventValue="resources_placeholder"
          className="btn-primary mt-6 inline-flex"
        >
          Book a Strategy Call <ArrowRight size={18} />
        </EventLink>
      </section>
    </Shell>
  );
}
