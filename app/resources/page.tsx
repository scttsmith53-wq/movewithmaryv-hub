import Shell from "@/components/Shell";
import { resources, resourceCategories } from "@/lib/resources";
import { brandTagline } from "@/lib/content";
import { ArrowRight, Download, Search } from "lucide-react";
import EventLink from "@/components/EventLink";
import TrackEvent from "@/components/TrackEvent";

const featured = resources.filter((r) => r.featured);

export default function ResourcesPage() {
  return (
    <Shell>
      <TrackEvent eventType="RESOURCE_LIBRARY_VIEWED" />
      <section className="hero-dark mb-8">
        <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_330px] lg:items-center">
          <div>
            <p className="kicker mb-4">Move With Mary V</p>
            <h1 className="font-serif text-5xl font-bold leading-tight text-white sm:text-6xl">
              Resource Library
            </h1>
            <p className="mt-3 text-lg italic text-gold">{brandTagline}</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">
              A curated collection of premium homebuyer guides for every stage
              of the journey. View inside the portal or download to keep with
              your notes.
            </p>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gold text-[#261900]">
                <Search size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.18em] text-gold">
                  Guidebook Shelf
                </p>
                <p className="mt-1 text-sm text-white/62">
                  Start with the roadmap, then follow your stage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="kicker mb-3">Recommended First</p>
          <h2 className="font-serif text-4xl font-semibold text-white">
            Start here.
          </h2>
        </div>
      </div>

      <section className="resource-shelf mb-10">
        {featured.map((resource) => (
          <EventLink
            key={resource.slug}
            href={`/resources/${resource.slug}`}
            eventType="RESOURCE_VIEW_CLICKED"
            eventValue={resource.slug}
            metadata={{ title: resource.title, source: "featured_shelf" }}
            className="cover-card group block"
          >
            <div className="overflow-hidden border-b border-white/10 bg-[#0b0f10]">
              <img
                src={resource.cover}
                alt={resource.title}
                className="aspect-[3/4] w-full object-cover object-top"
              />
            </div>
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-gold">
                {resource.stage}
              </p>
              <h3 className="mt-2 font-serif text-lg font-semibold leading-snug text-white">
                {resource.title}
              </h3>
            </div>
          </EventLink>
        ))}
      </section>

      <div className="mb-6 flex flex-wrap gap-2">
        {resourceCategories.map((cat) => (
          <span
            key={cat}
            className="stage-pill rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-[.13em]"
          >
            {cat}
          </span>
        ))}
      </div>

      <section className="space-y-4">
        {resources.map((resource) => (
          <article
            key={resource.slug}
            className="resource-row gold-border-hover"
          >
            <EventLink
              href={`/resources/${resource.slug}`}
              eventType="RESOURCE_VIEW_CLICKED"
              eventValue={resource.slug}
              metadata={{ title: resource.title, source: "library_row_cover" }}
              className="block overflow-hidden rounded-xl bg-[#0b0f10]"
            >
              <img
                src={resource.cover}
                alt={resource.title}
                className="aspect-[2/3] w-full object-cover object-top"
              />
            </EventLink>

            <div className="flex flex-col justify-between py-1">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-gold">
                    {resource.category}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[.14em] text-white/42">
                    {resource.stage}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-semibold leading-tight text-white">
                  {resource.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/52">
                  {resource.description}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <EventLink
                  href={`/resources/${resource.slug}`}
                  eventType="RESOURCE_VIEW_CLICKED"
                  eventValue={resource.slug}
                  metadata={{
                    title: resource.title,
                    source: "library_row_button",
                  }}
                  className="btn-primary text-xs"
                >
                  View Guide <ArrowRight size={14} />
                </EventLink>
                <EventLink
                  href={resource.file}
                  download
                  eventType="RESOURCE_DOWNLOADED"
                  eventValue={resource.slug}
                  metadata={{ title: resource.title, file: resource.file }}
                  className="btn-secondary text-xs"
                >
                  <Download size={14} /> Download
                </EventLink>
              </div>
            </div>
          </article>
        ))}
      </section>
    </Shell>
  );
}
