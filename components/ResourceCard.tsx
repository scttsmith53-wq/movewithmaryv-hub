import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function ResourceCard({ title, description, href, tag }: { title: string; description: string; href: string; tag?: string }) {
  return (
    <Link href={href} className="card-light group relative block overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-card">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gold/10 blur-2xl transition group-hover:bg-gold/20" />
      {tag && <span className="mb-5 inline-flex rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#8a6218]">{tag}</span>}
      <h3 className="relative font-serif text-2xl font-black leading-tight text-[#061426]">{title}</h3>
      <p className="relative mt-3 min-h-20 text-sm leading-7 text-[#465668]">{description}</p>
      <p className="relative mt-6 flex items-center gap-2 font-black text-[#061426]">Open <ArrowRight className="transition group-hover:translate-x-1" size={18}/></p>
    </Link>
  );
}
