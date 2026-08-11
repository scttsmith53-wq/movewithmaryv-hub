import Shell from "@/components/Shell";
import { getResourceBySlug, resources } from "@/lib/resources";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import EventLink from "@/components/EventLink";
import TrackEvent from "@/components/TrackEvent";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return resources.map((resource) => ({ slug: resource.slug }));
}

export default function ResourceViewerPage({
  params,
}: {
  params: { slug: string };
}) {
  const resource = getResourceBySlug(params.slug);

  if (!resource) {
    notFound();
  }

  return (
    <Shell>
      <TrackEvent
        eventType="RESOURCE_VIEWED"
        eventValue={resource.slug}
        metadata={{ title: resource.title, category: resource.category }}
      />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/resources" className="btn-secondary">
          <ArrowLeft size={18} /> Back to Resources
        </Link>
        <div className="flex flex-wrap gap-2">
          <EventLink
            href={resource.file}
            target="_blank"
            rel="noopener"
            eventType="RESOURCE_OPENED_FULLSCREEN"
            eventValue={resource.slug}
            metadata={{ title: resource.title, file: resource.file }}
            className="btn-secondary"
          >
            <ExternalLink size={18} /> Open Full Screen
          </EventLink>
          <EventLink
            href={resource.file}
            download
            eventType="RESOURCE_DOWNLOADED"
            eventValue={resource.slug}
            metadata={{ title: resource.title, file: resource.file }}
            className="btn-primary"
          >
            <Download size={18} /> Download
          </EventLink>
        </div>
      </div>

      <section className="mb-5 overflow-hidden rounded-[2rem] bg-[#061426] text-white shadow-card">
        <div className="p-6 sm:p-8">
          <p className="kicker mb-3 text-white after:bg-gold">
            {resource.category}
          </p>
          <h1 className="brand-serif text-4xl font-black leading-tight sm:text-6xl">
            {resource.title}
          </h1>
          <p className="mt-4 max-w-3xl text-white/72">{resource.description}</p>
        </div>
        <div className="pdf-footer-band px-6 py-4 sm:px-8">
          <p className="text-sm font-semibold">
            Know your home. Plan your next move.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-[#c9962b]/25 bg-white shadow-2xl">
        <iframe
          src={`${resource.file}#toolbar=1&navpanes=0`}
          title={resource.title}
          className="h-[78vh] w-full bg-white"
        />
      </section>
    </Shell>
  );
}
