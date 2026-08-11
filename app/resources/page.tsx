import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { resources, resourceCategories } from "@/lib/resources";
import { agentArea } from "@/lib/content";
import { ArrowRight } from "lucide-react";

export default function ResourcesPage() {
  return (
    <Shell>
      <PageHeader eyebrow="Resource Library" title="Homebuyer guides & planners">
        Co-branded guides for buyers in {agentArea} — from your first steps through closing day.
        Read them online or download to keep.
      </PageHeader>

      {resourceCategories.map((category) => (
        <section key={category} className="mb-9">
          <h2 className="mb-4 font-serif text-2xl font-black text-white">{category}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resources
              .filter((r) => r.category === category)
              .map((r) => (
                <Link
                  key={r.slug}
                  href={`/resources/${r.slug}`}
                  className="group card overflow-hidden p-0 transition hover:-translate-y-0.5"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden border-b border-gold/15 bg-[#061426]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.cover}
                      alt={r.title}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <div className="p-5">
                    <p className="kicker mb-2 text-gold">{r.stage}</p>
                    <h3 className="font-serif text-xl font-black leading-snug text-white">{r.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ice/65">{r.description}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold">
                      Open guide <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </Shell>
  );
}
