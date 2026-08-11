import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import TrackEvent from "@/components/TrackEvent";
import CalculatorGrid from "@/components/CalculatorGrid";

export default function CalculatorsPage() {
  return (
    <Shell>
      <TrackEvent eventType="CALCULATORS_PAGE_VIEWED" />
      <PageHeader eyebrow="Homebuyer Tools" title="Run the Numbers Before You Shop">
        Eight planning tools, built to give you clarity — not pressure. Jump to any
        tool using the bar above: payments, affordability, refinance, debt payoff,
        the cost of waiting, and a full equity-rollover path to your dream home.
        Estimates are educational only.
      </PageHeader>
      <CalculatorGrid />
    </Shell>
  );
}
