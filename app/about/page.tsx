import Shell from '@/components/Shell';
import { brandTagline, bookingUrl } from '@/lib/content';
import { ArrowRight, BadgeCheck, Home, Landmark, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <Shell>
      <section className="mb-8 overflow-hidden rounded-[2rem] bg-[#061426] text-white shadow-card">
        <div className="grid gap-8 p-7 sm:p-10 xl:grid-cols-[1fr_.42fr] xl:items-center">
          <div>
            <p className="kicker mb-5 text-white after:bg-gold">Move With Mary V</p>
            <h1 className="brand-serif max-w-4xl text-5xl font-black leading-tight sm:text-7xl">About Us</h1>
            <p className="mt-4 text-xl font-black text-gold">{brandTagline}</p>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/74">
              This hub was created to help first-time buyers learn the process, stay organized, and move forward with confidence before pressure shows up.
            </p>
          </div>
          <div className="rounded-[2rem] border border-gold/30 bg-white p-3 shadow-card">
            <img src="/images/mary-headshot.png" alt="Mary Vega" className="h-auto w-full rounded-[1.5rem] object-cover" />
          </div>
        </div>
        <div className="pdf-footer-band px-7 py-5 sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-semibold">Mary Vega | Keller Williams</p>
            <p className="font-serif text-2xl font-black">CW <span className="font-sans text-sm uppercase tracking-widest">Citywide Home Mortgage</span></p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <div className="card-light p-7 sm:p-9">
          <p className="kicker mb-5">Your Guide</p>
          <h2 className="brand-serif text-4xl font-black leading-tight text-[#061426]">Mary Vega</h2>
          <p className="mt-2 text-sm font-black uppercase tracking-[.18em] text-[#8a6218]">REALTOR® · Keller Williams · West Valley, Arizona</p>
          <div className="my-6 h-px w-32 bg-gold" />
          <p className="text-base leading-8 text-[#465668]">
            I built my business around the two things clients tell me matter most: real education and clear, honest communication. When you understand the market and always know exactly where your transaction stands, the whole process gets less stressful and the decisions get easier. That is the experience I work to give every client, every time.
          </p>
          <p className="mt-5 text-base leading-8 text-[#465668]">
            With deep knowledge of the West Valley and a strong track record of getting clients to their goals, I keep your best interest at the center of every move. Real estate has a lot of moving parts, and the small details are where deals are won or lost. My job is to handle the intricacies, keep you informed with up-to-date information, and communicate clearly at every step &mdash; so you can stay focused on your goals instead of the guesswork.
          </p>
          <p className="mt-5 text-base leading-8 text-[#465668]">
            Whether you are buying your first home, moving up, or selling, I am here for all of your real estate needs.
          </p>
          <a href={bookingUrl} className="btn-primary mt-7">Book a Strategy Call <ArrowRight size={18}/></a>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="card-paper p-6">
            <Home className="text-gold" size={34}/>
            <h3 className="mt-4 font-serif text-2xl font-black text-[#061426]">Move With Mary V</h3>
            <p className="mt-3 text-sm leading-7 text-[#465668]">A resource center for roadmaps, calculators, document guides, and homebuyer education.</p>
          </div>
          <div className="card-paper p-6">
            <BadgeCheck className="text-gold" size={34}/>
            <h3 className="mt-4 font-serif text-2xl font-black text-[#061426]">Keller Williams</h3>
            <p className="mt-3 text-sm leading-7 text-[#465668]">Real estate services for buyers who are ready to begin touring, comparing homes, and making offers.</p>
          </div>
          <div className="card-paper p-6">
            <Landmark className="text-gold" size={34}/>
            <h3 className="mt-4 font-serif text-2xl font-black text-[#061426]">Citywide Home Mortgage</h3>
            <p className="mt-3 text-sm leading-7 text-[#465668]">Mortgage education, pre-approval support, loan options, and financing guidance.</p>
          </div>
          <div className="card-paper p-6">
            <ShieldCheck className="text-gold" size={34}/>
            <h3 className="mt-4 font-serif text-2xl font-black text-[#061426]">Educational First</h3>
            <p className="mt-3 text-sm leading-7 text-[#465668]">The hub is designed to help you learn before you apply, shop, or make big decisions.</p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-[#c9962b]/25 bg-white/80 p-7 shadow-card sm:p-9">
        <p className="kicker mb-4">Important Note</p>
        <p className="max-w-5xl text-sm leading-7 text-[#465668]">
          This site and the resources inside it are educational only. They are not a loan approval, pre-approval, commitment to lend, legal advice, tax advice, or financial advice. Loan options, program availability, and eligibility depend on borrower, property, program, and underwriting requirements.
        </p>
      </section>
    </Shell>
  );
}
