import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Move With Mary V',
  description: 'How Scott Smith / Move With Mary V collects, uses, and protects your information.',
};

const EFFECTIVE = 'June 30, 2026';

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 font-serif text-2xl font-bold text-white">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[15px] leading-7 text-white/72">{children}</p>;
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#061426] text-white">
      <header className="border-b border-white/10 px-6 py-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <p className="font-serif text-lg font-bold">Move With Mary V</p>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-gold">Move With Mary V</p>
          </div>
          <a href="/dashboard" className="text-sm text-gold hover:underline">Back to portal</a>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 pb-20 pt-10">
        <h1 className="font-serif text-4xl font-bold sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-white/50">Effective {EFFECTIVE}</p>

        <P>
          This Privacy Policy explains how Move With Mary V, operating as “Move With Mary V,” in
          connection with mortgage services through Citywide Home Mortgage (NMLS #2611) and real estate
          services through Keller Williams (collectively, “we,” “us,” or “our”), collects, uses, and shares
          information when you visit our websites, register through our forms, use our member portal, or
          communicate with us. By using our sites or submitting information, you agree to this Policy.
        </P>

        <H>Information We Collect</H>
        <P>
          <strong className="text-white">Information you give us:</strong> your name, email address, phone
          number, and details you provide in our forms or chats — such as the state you’re buying in, whether
          you rent or own, a general sense of your credit, your timeline, and your homebuying or selling goals.
        </P>
        <P>
          <strong className="text-white">Information collected automatically:</strong> device and usage
          information such as IP address, browser type, pages viewed, referring links, and interactions with
          our pages, collected through cookies and similar technologies (including advertising and analytics
          pixels).
        </P>

        <H>How We Use Your Information</H>
        <P>
          We use your information to respond to your inquiries; provide educational resources, tools, and the
          member portal; deliver the free webinar and related reminders; follow up about mortgage and real
          estate services you’ve expressed interest in; improve our sites and content; measure and improve our
          advertising; and comply with legal and regulatory obligations. We do not use the information you
          provide to make automated credit decisions.
        </P>

        <H>Text Messages &amp; Phone Calls</H>
        <P>
          If you provide your phone number and consent, we (and automated systems acting on our behalf) may
          contact you by phone call and text message about your inquiry, appointments, the webinar, and related
          services. Consent to receive texts is not a condition of any purchase. Message frequency varies, and
          message and data rates may apply. You can opt out of texts at any time by replying <strong className="text-white">STOP</strong>,
          or get help by replying <strong className="text-white">HELP</strong>. Opting out of texts will not remove you
          from email or other communications you’ve requested.
        </P>

        <H>Cookies, Pixels &amp; Advertising</H>
        <P>
          We use cookies and tracking technologies, including the Meta (Facebook) Pixel and similar tools, to
          understand site usage, measure the performance of our ads, and show relevant advertising on
          third-party platforms. These technologies may collect information such as pages visited and actions
          taken (for example, submitting a form). You can control cookies through your browser settings and can
          opt out of certain interest-based advertising through the platforms’ own ad settings and industry
          opt-out tools.
        </P>

        <H>How We Share Information</H>
        <P>
          We share information with service providers who help us operate — such as our CRM and messaging
          platform, hosting and database providers, email/SMS delivery, scheduling, and advertising and
          analytics partners — who are permitted to use it only to provide services to us. We may share
          information with Citywide Home Mortgage and Keller Williams as needed to provide the services you request,
          and with others when required by law, to protect our rights, or in connection with a business
          transfer. <strong className="text-white">We do not sell your personal information.</strong>
        </P>

        <H>Your Choices &amp; Rights</H>
        <P>
          You may opt out of texts (reply STOP) and emails (use the unsubscribe link) at any time. Depending on
          where you live, you may have rights to access, correct, or delete your personal information, or to opt
          out of certain sharing. To make a request, contact us using the details below and we’ll respond
          consistent with applicable law.
        </P>

        <H>Data Retention &amp; Security</H>
        <P>
          We keep your information for as long as needed to provide our services and for legitimate business or
          legal purposes, then delete or de-identify it. We use reasonable administrative, technical, and
          physical safeguards to protect your information; however, no method of transmission or storage is
          completely secure.
        </P>

        <H>Third-Party Links</H>
        <P>
          Our sites may link to third-party websites and tools (such as our scheduling calendar or the webinar
          stream). Their privacy practices are governed by their own policies, and we are not responsible for
          them.
        </P>

        <H>Children’s Privacy</H>
        <P>
          Our services are intended for adults 18 and older. We do not knowingly collect information from
          children under 18.
        </P>

        <H>Changes to This Policy</H>
        <P>
          We may update this Policy from time to time. The “Effective” date above reflects the latest version,
          and material changes will be posted on this page.
        </P>

        <H>Contact Us</H>
        <P>
          Questions about this Policy or your information? Contact us at{' '}
          <a href="tel:+16235704245" className="text-gold hover:underline">(623) 570-4245</a>.
        </P>

        <p className="mt-12 border-t border-white/10 pt-6 text-xs leading-6 text-white/45">
          Scott Smith, NMLS #2244351. Mortgage services offered through Citywide Home Mortgage, NMLS #2611.
          Real estate services offered through Keller Williams. This is not a commitment to lend or a guarantee of
          program eligibility. Equal Housing Opportunity / Equal Housing Lender. Information provided is for
          general educational purposes and is not legal or financial advice.
        </p>
      </article>
    </main>
  );
}
