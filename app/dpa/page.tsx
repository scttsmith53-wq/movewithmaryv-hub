import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import TrackEvent from "@/components/TrackEvent";
import DpaInteractive from "@/components/DpaInteractive";

export default function DpaPage() {
  return (
    <Shell>
      <TrackEvent eventType="DPA_PAGE_VIEWED" />
      <PageHeader eyebrow="Down Payment Help" title="You may need less cash than you think">
        Many buyers assume they need 20% down. In reality, assistance can cover much of the cash
        due at closing. See the difference below, then take a 2-minute check to see if help could
        be within reach.
      </PageHeader>

      <DpaInteractive />
    </Shell>
  );
}
