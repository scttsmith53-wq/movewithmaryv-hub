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

export const resources: ResourceItem[] = [];

export const resourceCategories = Array.from(new Set(resources.map((resource) => resource.category)));

export function getResourceBySlug(slug: string) {
  return resources.find((resource) => resource.slug === slug);
}
