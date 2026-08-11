'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearDemoUser, getDemoUser, getUserDisplayName, initializeUserFromUrl } from '@/lib/auth';
import { BookOpen, CalendarCheck, ClipboardList, CreditCard, FileText, Home, Landmark, LogOut, Map, Menu, MessageCircle, Newspaper, ShieldCheck, Star, Users, Wrench, X } from 'lucide-react';
import { siteName, brandTagline, coBrandDisclosure } from '@/lib/content';
import AssistantChat from '@/components/AssistantChat';
import TestimonialTicker from '@/components/TestimonialTicker';

const nav = [
  { href: '/dashboard', label: 'My Journey', icon: Home },
  { href: '/readiness', label: 'Buyer Map', icon: Map },
  { href: '/my-numbers', label: 'My Numbers', icon: ClipboardList },
  { href: '/calculators', label: 'Tools', icon: Wrench },
  { href: '/credit', label: 'Credit Center', icon: CreditCard },
  { href: '/dpa', label: 'DPA', icon: Landmark },
  { href: '/webinar', label: 'Webinar', icon: CalendarCheck },
  { href: '/testimonials', label: 'Reviews', icon: Star },
  { href: '/about', label: 'About Us', icon: Users },
  { href: '/contact', label: 'Strategy Call', icon: MessageCircle }
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(getDemoUser());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const initialized = initializeUserFromUrl();
    setUser(initialized || getDemoUser());
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  function logout() {
    clearDemoUser();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-luxury text-surface-text">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#101415]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-gold/40 bg-white/[.04] text-gold shadow-gold-soft">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="font-serif text-xl font-bold leading-none tracking-tight text-white">{siteName}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[.2em] text-gold">Member Portal</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {nav.slice(0, 9).map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-2 py-2 text-[12px] font-bold uppercase tracking-[.14em] transition ${active ? 'text-gold' : 'text-white/58 hover:bg-white/[.04] hover:text-white'}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a href="/report/index.html" className="rounded-lg px-2 py-2 text-[12px] font-bold uppercase tracking-[.14em] text-white/58 transition hover:bg-white/[.04] hover:text-white">Market Watch</a>
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <div className="text-right">
              <p className="text-xs font-semibold text-white/78">{getUserDisplayName(user)}</p>
              <p className="max-w-[160px] truncate text-[10px] text-white/38">{user?.email || 'demo user'}</p>
            </div>
            <button onClick={logout} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-white/54 transition hover:border-gold/40 hover:text-gold">
              <LogOut size={14} className="inline" />
            </button>
          </div>

          <button onClick={() => setOpen((v) => !v)} className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 text-white lg:hidden" aria-label="Open navigation">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-white/10 bg-[#101415] p-4 lg:hidden">
            <nav className="grid gap-2">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${active ? 'bg-gold text-[#101415]' : 'bg-white/[.04] text-white/70'}`}>
                    <Icon size={17} /> {item.label}
                  </Link>
                );
              })}
              <a href="/report/index.html" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold bg-white/[.04] text-white/70"><Newspaper size={17} /> Market Watch</a>
              <button onClick={logout} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/55">
                <LogOut size={17} /> Sign out
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto min-h-screen max-w-7xl px-5 pb-16 pt-28 sm:px-8">{children}</main>

      <TestimonialTicker />

      <footer className="border-t border-white/10 bg-[#0b0f10] px-5 py-10 text-white/56 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_1fr_1.2fr]">
          <div>
            <p className="font-serif text-2xl font-bold text-white">{siteName}</p>
            <p className="mt-2 text-sm italic text-white/48">{brandTagline}</p>
          </div>
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[.2em] text-gold">Quick Links</p>
            <div className="grid gap-2 text-sm">
              <Link href="/resources" className="hover:text-gold">Resource Library</Link>
              <Link href="/readiness" className="hover:text-gold">Buyer Map</Link>
              <Link href="/contact" className="hover:text-gold">Strategy Call</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[.2em] text-gold">Compliance</p>
            <p className="text-xs leading-6 text-white/42">{coBrandDisclosure}</p>
            <Link href="/privacy" className="mt-3 inline-block text-xs font-semibold text-gold hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </footer>

      <AssistantChat />
    </div>
  );
}
