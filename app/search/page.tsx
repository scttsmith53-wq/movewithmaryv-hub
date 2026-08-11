import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import TrackEvent from "@/components/TrackEvent";
import EventLink from "@/components/EventLink";
import { bookingUrl, agentArea } from "@/lib/content";
import { ArrowRight, Search } from "lucide-react";

// Home Search is hidden for now. Arizona (ARMLS) IDX to be added once Mary's
// MLS/IDX access is set up. Placeholder avoids showing out-of-market listings.
export default function SearchPage() {
  return (
    <Shell>
      <TrackEvent eventType="HOME_SEARCH_VIEWED" />
      <PageHeader eyebrow="Home Search" title="Arizona home search is coming soon">
        A live {agentArea} listing search is on the way. In the meantime, a quick
        strategy call is the fastest way to get set up with the right homes for
        your budget and goals.
      </PageHeader>

      <section className="card p-8 text-center sm:p-12">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
          <Search size={26} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-white">Live listings, coming soon</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ice/65">
          Mary is setting up a live Arizona MLS search for {agentArea}. Want to be first to see
          new listings that fit? Book a quick call and she&rsquo;ll set you up with a personalized
          search right away.
        </p>
        <EventLink
          href={bookingUrl}
          eventType="STRATEGY_CALL_CLICKED"
          eventValue="home_search_placeholder"
          className="btn-primary mt-6 inline-flex"
        >
          Book a Strategy Call <ArrowRight size={18} />
        </EventLink>
      </section>
    </Shell>
  );
}
