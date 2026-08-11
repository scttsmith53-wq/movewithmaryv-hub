import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import { bookingUrl, registrationUrl, webinarEmbedUrl } from "@/lib/content";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
} from "lucide-react";
import EventLink from "@/components/EventLink";
import TrackEvent from "@/components/TrackEvent";
import WebinarStage from "@/components/WebinarStage";
import WebinarAdmin from "@/components/WebinarAdmin";

export default function WebinarPage() {
  return (
    <Shell>
      <TrackEvent eventType="WEBINAR_PAGE_VIEWED" />
      <PageHeader
        eyebrow="Live Webinar"
        title="The First-Time Buyer Webinar"
      >
        Join the live session when it&rsquo;s on, or reserve your spot for the
        next one. The replay will live here after the webinar is recorded.
      </PageHeader>
      <WebinarAdmin />
      <WebinarStage embedUrl={webinarEmbedUrl} />
      <section className="card overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 xl:grid-cols-[1fr_.8fr] xl:items-center">
          <div>
            <p className="kicker">Move With Mary V</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Know your home. Plan your next move.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ice/70">
              Join the live webinar to learn the homebuying basics, understand
              common financing questions, and get a clearer path before you
              start shopping.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <EventLink
                href={registrationUrl}
                eventType="WEBINAR_REGISTRATION_CLICKED"
                eventValue="webinar_page"
                className="btn-secondary"
              >
                Reserve Your Spot
              </EventLink>
              <EventLink
                href="/calculators"
                eventType="CALCULATORS_CLICKED"
                eventValue="webinar_page"
                className="btn-secondary"
              >
                <Calculator size={18} /> Run the Calculators
              </EventLink>
            </div>
          </div>
          <div className="rounded-[2rem] border border-gold/20 bg-gold/10 p-5">
            <p className="font-black text-gold">What you’ll learn</p>
            <div className="mt-4 space-y-3">
              {[
                "How to estimate a comfortable payment",
                "What affects pre-approval readiness",
                "How down payment assistance may fit",
                "What to avoid before buying",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl bg-white/[.055] p-3 text-sm font-bold text-ice/78"
                >
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-gold"
                    size={18}
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <EventLink
        href={bookingUrl}
        eventType="STRATEGY_CALL_CLICKED"
        eventValue="webinar_page"
        className="btn-secondary mt-8"
      >
        Talk Through My Situation
      </EventLink>
    </Shell>
  );
}
