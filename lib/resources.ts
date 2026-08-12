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

// Co-branded Arizona guides (Mary Vega, Keller Williams — agent · Scott Smith,
// Citywide Home Mortgage — lender). Rebuilt Aug 2026: Mary's ChatGPT cover on
// page 1 + generated content pages behind it.
export const resources: ResourceItem[] = [
  {
    slug: "buy-with-confidence-roadmap",
    title: "Buy With Confidence Roadmap",
    description: "Your step-by-step, five-stage roadmap from early planning to getting the keys.",
    category: "Getting Started",
    stage: "Start Here",
    file: "/resources/buy-with-confidence-roadmap.pdf",
    cover: "/resources/thumbs/buy-with-confidence-roadmap.png",
    featured: true,
  },
  {
    slug: "understanding-pre-approval-guide",
    title: "Understanding Pre-Approval",
    description: "What pre-approval really means, what your loan team reviews, and what can change.",
    category: "Financing",
    stage: "Prepare",
    file: "/resources/understanding-pre-approval-guide.pdf",
    cover: "/resources/thumbs/understanding-pre-approval-guide.png",
    featured: true,
  },
  {
    slug: "down-payment-assistance-guide",
    title: "Down Payment Assistance Guide",
    description: "How assistance programs may help reduce upfront costs — with an Arizona focus.",
    category: "Financing",
    stage: "Prepare",
    file: "/resources/down-payment-assistance-guide.pdf",
    cover: "/resources/thumbs/down-payment-assistance-guide.png",
    featured: true,
  },
  {
    slug: "credit-readiness-guide",
    title: "Credit Readiness Guide",
    description: "The credit factors that matter most and a clear path to prepare your profile.",
    category: "Credit",
    stage: "Prepare",
    file: "/resources/credit-readiness-guide.pdf",
    cover: "/resources/thumbs/credit-readiness-guide.png",
  },
  {
    slug: "credit-card-paydown-planner",
    title: "Credit Card Paydown Planner",
    description: "Lower utilization and protect savings before you apply — with a sample plan.",
    category: "Credit",
    stage: "Prepare",
    file: "/resources/credit-card-paydown-planner.pdf",
    cover: "/resources/thumbs/credit-card-paydown-planner.png",
  },
  {
    slug: "mortgage-document-guide",
    title: "Mortgage Document Guide",
    description: "What to gather, what to expect, and how to stay organized for a smooth loan.",
    category: "Financing",
    stage: "Prepare",
    file: "/resources/mortgage-document-guide.pdf",
    cover: "/resources/thumbs/mortgage-document-guide.png",
  },
  {
    slug: "inspection-and-appraisal-guide",
    title: "Inspection & Appraisal Guide",
    description: "What each one is, what they look at, and how to make smart decisions.",
    category: "The Process",
    stage: "Shop",
    file: "/resources/inspection-and-appraisal-guide.pdf",
    cover: "/resources/thumbs/inspection-and-appraisal-guide.png",
  },
  {
    slug: "closing-day-guide",
    title: "Closing Day Guide",
    description: "What to expect before, during, and after you get the keys — plus wire-fraud safety.",
    category: "Closing",
    stage: "Close",
    file: "/resources/closing-day-guide.pdf",
    cover: "/resources/thumbs/closing-day-guide.png",
  },
  {
    slug: "buyer-confidence-resource-center",
    title: "Your Buyer Resource Center",
    description: "Everything inside the hub and how to use it, step by step.",
    category: "Getting Started",
    stage: "Start Here",
    file: "/resources/buyer-confidence-resource-center.pdf",
    cover: "/resources/thumbs/buyer-confidence-resource-center.png",
  },
  {
    slug: "fsbo-seller-guide",
    title: "Sell With Confidence — FSBO Guide",
    description: "A step-by-step FSBO roadmap for West Valley sellers: prep, pricing, offers, and closing.",
    category: "Selling",
    stage: "Selling",
    file: "/resources/fsbo-seller-guide.pdf",
    cover: "/resources/thumbs/fsbo-seller-guide.png",
  },
];

export const resourceCategories = Array.from(new Set(resources.map((resource) => resource.category)));

export function getResourceBySlug(slug: string) {
  return resources.find((resource) => resource.slug === slug);
}
