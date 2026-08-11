import Shell from '@/components/Shell';
import PageHeader from '@/components/PageHeader';
import BuyerChecklist from '@/components/BuyerChecklist';

export default function CreditPage() {
  return (
    <Shell>
      <PageHeader eyebrow="Credit Improvement Center" title="Build Stronger Credit Habits Before You Buy">
        Use the credit checklist and credit card paydown planner below. This is educational and does not guarantee approval or a score increase.
      </PageHeader>
      <BuyerChecklist />
    </Shell>
  );
}
