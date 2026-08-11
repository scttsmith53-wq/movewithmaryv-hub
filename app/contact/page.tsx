import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import { bookingUrl, brandName } from "@/lib/content";
import EventLink from "@/components/EventLink";
import TrackEvent from "@/components/TrackEvent";
import AskQuestion from "@/components/AskQuestion";

export default function ContactPage() {
  return (
    <Shell>
      <TrackEvent eventType="CONTACT_PAGE_VIEWED" />
      <PageHeader
        eyebrow="Next Step"
        title={`Ask ${brandName} or Schedule a Buyer Call`}
      >
        The goal is to help you understand your next best step before you start
        guessing, shopping, or applying randomly.
      </PageHeader>
      <div className="card max-w-3xl p-6">
        <h2 className="text-2xl font-black">Good questions to ask</h2>
        <ul className="mt-4 space-y-3 text-ice/75">
          <li>• What price range should I realistically start with?</li>
          <li>• Should I focus on credit, savings, or debt first?</li>
          <li>
            • Would FHA, Conventional, VA, or assistance programs make more
            sense?
          </li>
          <li>• What should I avoid doing before applying?</li>
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <EventLink
            href={bookingUrl}
            eventType="STRATEGY_CALL_CLICKED"
            eventValue="contact_page"
            className="btn-primary"
          >
            Schedule a Buyer Strategy Call
          </EventLink>
          <AskQuestion source="contact_page" triggerClassName="btn-secondary" />
        </div>
        <p className="mt-6 text-sm text-ice/65">
          Prefer to talk? Call or text{" "}
          <a href="tel:+19705280874" className="font-bold text-gold hover:underline">(970) 528-0874</a>
          {" "}&middot;{" "}
          <a href="/scott-smith.vcf" download className="font-bold text-gold hover:underline">Save my contact</a>
        </p>
      </div>
    </Shell>
  );
}
