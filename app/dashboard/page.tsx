"use client";

import Shell from "@/components/Shell";
import { bookingUrl, registrationUrl, webinarJoinUrl } from "@/lib/content";
import { resources } from "@/lib/resources";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Calendar,
  CreditCard,
  FileText,
  Home,
  Landmark,
  Map,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  getDemoUser,
  getUserDisplayName,
  initializeUserFromUrl,
} from "@/lib/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import EventLink from "@/components/EventLink";
import TrackEvent from "@/components/TrackEvent";

const featured = resources.filter((r) => r.featured).slice(0, 3);

const bento = [
  {
    title: "Buyer Confidence Map",
    img: "/images/cards/card-buyer-map.jpg",
    body: "A visual path from webinar education to closing day confidence.",
    href: "/readiness",
    cta: "Resume Journey",
    icon: Map,
    wide: true,
    footer: "Current focus: Strengthen Your Position",
  },
  {
    title: "DPA Options",
    img: "/images/cards/card-dpa.jpg",
    body: "Learn how assistance programs may work and what questions to ask.",
    href: "/dpa",
    cta: "Explore DPA",
    icon: Landmark,
  },
  {
    title: "Decision Calculators",
    img: "/images/cards/card-calculators.jpg",
    body: "Estimate payment, HOA, taxes, insurance, PMI/MIP, and the cost of waiting.",
    href: "/calculators",
    cta: "Launch Tools",
    icon: Calculator,
  },
  {
    title: "Credit Center",
    img: "/images/cards/card-credit.jpg",
    body: "Track utilization goals, safe card nicknames, and credit readiness habits.",
    href: "/credit",
    cta: "Open Center",
    icon: CreditCard,
  },
  {
    title: "Premium PDF Guides",
    img: "/images/cards/card-guides.jpg",
    body: "Your curated guide library for documents, credit, DPA, inspections, and closing day.",
    href: "/resources",
    cta: "Open Library",
    icon: BookOpen,
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState(getDemoUser());

  useEffect(() => {
    setUser(initializeUserFromUrl() || getDemoUser());
  }, []);

  const firstName = user?.email
    ? getUserDisplayName(user).split(" ")[0]
    : "there";

  return (
    <Shell>
      <TrackEvent
        eventType="PORTAL_LOGIN_OR_DASHBOARD_VIEWED"
        metadata={{ page: "dashboard" }}
      />
      <section className="mb-6 rounded-2xl border border-gold/25 bg-[#e9c176]/10 px-5 py-4 text-white shadow-[0_10px_35px_rgba(0,0,0,.16)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold text-[#261900]">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-gold">
                Live webinar access
              </p>
              <p className="mt-1 text-sm text-white/74">
                Join the Move With Mary V webinar when your session begins.
              </p>
            </div>
          </div>
          <EventLink
            href="/webinar"
            eventType="WEBINAR_JOIN_CLICKED"
            eventValue="dashboard_top_bar"
            className="btn-secondary shrink-0"
          >
            Join Webinar <ArrowRight size={15} />
          </EventLink>
        </div>
      </section>

      <section className="hero-dark relative mb-8 overflow-hidden">
        <img src="/images/hero-home.jpg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-65" />
        <div className="pointer-events-none absolute inset-0 bg-[#061426]/55" />
        <div className="relative px-6 py-14 text-center sm:px-10 lg:px-14 lg:py-20">
          <div className="mb-5 inline-flex rounded-full border border-gold/35 px-4 py-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">
              Private Homebuyer Portal
            </span>
          </div>
          <h1 className="font-serif text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Buy &amp; Sell
            <br className="sm:hidden" /> with Confidence
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg italic leading-8 text-white/64">
            Know your home. Plan your next move.
          </p>
          <div className="mx-auto mt-8 flex max-w-xl flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/readiness" className="btn-primary w-full sm:w-auto">
              Continue Your Journey <ArrowRight size={16} />
            </Link>
            <Link href="/resources" className="btn-secondary w-full sm:w-auto">
              Open Resource Library
            </Link>
          </div>
          <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.055] px-5 py-4 text-left backdrop-blur">
            <ShieldCheck size={21} className="text-gold" />
            <p className="max-w-md text-sm leading-6 text-white/70">
              Welcome back, {firstName}. Your strategic buyer tools are in one
              private place.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="kicker mb-3">Welcome Back</p>
          <h2 className="font-serif text-4xl font-semibold leading-tight text-white">
            Member Dashboard
          </h2>
          <p className="mt-2 text-white/54">
            Your homebuyer guidebook, tools, and next steps in one place.
          </p>
        </div>
        <div className="flex items-center gap-2 text-gold">
          <span className="text-[11px] font-bold uppercase tracking-[.18em]">
            Portal Status: Active
          </span>
          <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
        </div>
      </section>

      <section className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-12">
        {bento.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`lux-card gold-border-hover group relative flex flex-col overflow-hidden ${item.wide ? "md:col-span-8" : "md:col-span-4"}`}
            >
              <div className="relative h-36 w-full shrink-0 overflow-hidden sm:h-40">
                <img
                  src={item.img}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101415] via-[#101415]/35 to-transparent" />
                <div className="absolute bottom-3 left-5 grid h-10 w-10 place-items-center rounded-xl border border-gold/40 bg-[#101415]/80 text-gold backdrop-blur">
                  <Icon size={19} />
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between gap-4 px-6 pb-6 pt-4">
                <div>
                  <h3 className="font-serif text-2xl font-semibold leading-tight text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {item.body}
                  </p>
                </div>
                <div>
                  {item.wide && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">
                          {item.footer}
                        </span>
                        <span className="text-[11px] font-bold text-gold">42%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[.06]">
                        <div className="h-full w-[42%] rounded-full bg-gold" />
                      </div>
                    </div>
                  )}
                  <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.14em] text-gold">
                    {item.cta}{" "}
                    <ArrowRight
                      size={14}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="mb-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="kicker mb-3">Featured Guides</p>
            <h2 className="font-serif text-4xl font-semibold text-white">
              Start with these.
            </h2>
          </div>
          <Link
            href="/resources"
            className="hidden text-sm font-semibold text-white/52 transition hover:text-gold sm:block"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {featured.map((resource) => (
            <Link
              key={resource.slug}
              href={`/resources/${resource.slug}`}
              className="cover-card group block"
            >
              <div className="overflow-hidden border-b border-white/10 bg-[#0b0f10]">
                <img
                  src={resource.cover}
                  alt={resource.title}
                  className="aspect-[3/4] w-full object-cover object-top"
                />
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-gold">
                  {resource.stage}
                </p>
                <h3 className="mt-2 font-serif text-xl font-semibold leading-tight text-white">
                  {resource.title}
                </h3>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-gold">
                  View Guide <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-2xl border border-gold/20 bg-[#e9c176]/10 p-7 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="kicker mb-3">Ready for the next phase?</p>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-white">
            A strategy call turns the guidebook into a plan.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
            Connect your numbers, timeline, questions, and goals to a clear path
            forward.
          </p>
        </div>
        <EventLink
          href={bookingUrl}
          eventType="STRATEGY_CALL_CLICKED"
          eventValue="dashboard_footer"
          className="btn-primary shrink-0"
        >
          Schedule Strategy Call <ArrowRight size={16} />
        </EventLink>
      </section>
    </Shell>
  );
}
