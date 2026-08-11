export type ResourceItem = {
  slug: string;
  title: string;
  description: string;
  category: string;
  stage: string;
  file: string;
  cover: string;
  featured?: boolean;
};

export const resources: ResourceItem[] = [
  {
    slug: 'buy-with-confidence-roadmap',
    title: 'Buy With Confidence Roadmap',
    description: 'The starting guide for the full homebuyer journey — from learning your options to shopping with confidence.',
    category: 'Start Here',
    stage: 'Build Confidence',
    file: '/resources/buy-with-confidence-roadmap.pdf',
    cover: '/resources/thumbs/buy-with-confidence-roadmap.png',
    featured: true
  },
  {
    slug: 'mortgage-document-guide',
    title: 'Mortgage Document Guide',
    description: 'A calming overview of common documents buyers may be asked for, with W-2 and self-employed examples.',
    category: 'Documents',
    stage: 'Get Pre-Approved',
    file: '/resources/mortgage-document-guide.pdf',
    cover: '/resources/thumbs/mortgage-document-guide.png',
    featured: true
  },
  {
    slug: 'credit-readiness-guide',
    title: 'Credit Readiness Guide',
    description: 'A client-friendly guide to the credit habits and readiness factors that can matter before applying.',
    category: 'Credit',
    stage: 'Strengthen Your Position',
    file: '/resources/credit-readiness-guide.pdf',
    cover: '/resources/thumbs/credit-readiness-guide.png',
    featured: true
  },
  {
    slug: 'credit-card-paydown-planner',
    title: 'Credit Card Paydown Planner',
    description: 'A focused worksheet for utilization targets, paydown strategy, and mortgage-timing cautions.',
    category: 'Credit',
    stage: 'Strengthen Your Position',
    file: '/resources/credit-card-paydown-planner.pdf',
    cover: '/resources/thumbs/credit-card-paydown-planner.png'
  },
  {
    slug: 'down-payment-assistance-guide',
    title: 'Down Payment Assistance Guide',
    description: 'Learn how assistance may work, common eligibility factors, program types, and questions to ask.',
    category: 'Money & Programs',
    stage: 'Understand Your Numbers',
    file: '/resources/down-payment-assistance-guide.pdf',
    cover: '/resources/thumbs/down-payment-assistance-guide.png'
  },
  {
    slug: 'understanding-pre-approval-guide',
    title: 'Understanding Pre-Approval Guide',
    description: 'What pre-approval means, what it does not mean, and how to use it wisely while preparing to shop.',
    category: 'Pre-Approval',
    stage: 'Get Pre-Approved',
    file: '/resources/understanding-pre-approval-guide.pdf',
    cover: '/resources/thumbs/understanding-pre-approval-guide.png'
  },
  {
    slug: 'buyer-confidence-resource-center',
    title: 'Buyer Confidence Resource Center',
    description: 'A quick-connect resource guide with QR access to the hub, webinar, and strategy call.',
    category: 'Next Step',
    stage: 'Continue Your Journey',
    file: '/resources/buyer-confidence-resource-center.pdf',
    cover: '/resources/thumbs/buyer-confidence-resource-center.png'
  },
  {
    slug: 'closing-day-guide',
    title: 'Closing Day Guide',
    description: 'What to expect before, during, and after closing day so buyers feel prepared when it is time to get the keys.',
    category: 'Closing',
    stage: 'Close With Confidence',
    file: '/resources/closing-day-guide.pdf',
    cover: '/resources/thumbs/closing-day-guide.png'
  },
  {
    slug: 'inspection-and-appraisal-guide',
    title: 'Inspection & Appraisal Guide',
    description: 'Understand inspections, appraisals, negotiations, and what buyers should expect once under contract.',
    category: 'Shopping & Contract',
    stage: 'Start Shopping With Confidence',
    file: '/resources/inspection-and-appraisal-guide.pdf',
    cover: '/resources/thumbs/inspection-and-appraisal-guide.png'
  }
];

export const resourceCategories = Array.from(new Set(resources.map((resource) => resource.category)));

export function getResourceBySlug(slug: string) {
  return resources.find((resource) => resource.slug === slug);
}
