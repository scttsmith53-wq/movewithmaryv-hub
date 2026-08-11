import Shell from '@/components/Shell';
import PageHeader from '@/components/PageHeader';

const paths = [
  ['FHA', 'Often used by buyers who need more flexible credit or debt-to-income options. Down payment and mortgage insurance rules apply.'],
  ['Conventional', 'Can be strong for buyers with solid credit and qualifying income. Some first-time buyer options allow lower down payments.'],
  ['VA', 'For eligible veterans, active-duty service members, and certain surviving spouses. Rules and property eligibility still matter.'],
  ['Assistance Programs', 'Can help with funds, but may add rates, restrictions, income limits, repayment rules, or location requirements.']
];

export default function LoanPathPage() {
  return (
    <Shell>
      <PageHeader eyebrow="Loan Path Education" title="Understand the Main Buyer Paths">
        The right path depends on your credit, income, savings, location, property type, and long-term plan.
      </PageHeader>
      <div className="grid gap-5 md:grid-cols-2">
        {paths.map(([title, desc]) => (
          <div key={title} className="card p-6">
            <h2 className="text-3xl font-black text-sky">{title}</h2>
            <p className="mt-4 text-ice/72">{desc}</p>
          </div>
        ))}
      </div>
    </Shell>
  );
}
