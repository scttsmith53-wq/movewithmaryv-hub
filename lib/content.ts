// Hardcoded to the same working calendar the landing pages use (env override removed
// so a stale NEXT_PUBLIC_BOOKING_URL can't point the portal at a dead calendar).
export const bookingUrl = 'https://api.leadconnectorhq.com/widget/booking/ZanIHTWoRm48NxZzqaWw';
export const registrationUrl = process.env.NEXT_PUBLIC_WEBINAR_REGISTRATION_URL || 'https://movewithmaryv.com';
export const webinarJoinUrl = process.env.NEXT_PUBLIC_WEBINAR_JOIN_URL || '/webinar';
// Embedded live stream so members watch inside the portal (keeps them logged in
// for attendance tracking). For an evergreen weekly YouTube live, use the
// channel live-stream embed: https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID
export const webinarEmbedUrl = process.env.NEXT_PUBLIC_WEBINAR_EMBED_URL || 'https://www.youtube.com/embed/live_stream?channel=UCWHBjG4Gp7KXkr28JzZo-xA';
// Pinned replay: the specific Cloudflare recording to show in the webinar spot
// when we're not live. Paste the recording's /iframe URL here (env can override).
// Leave '' to fall back to the auto "latest recording" API route.
export const webinarReplayUrl = process.env.NEXT_PUBLIC_WEBINAR_REPLAY_URL || '';
export const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'Mary Vega';
export const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Move With Mary V';
export const brandTagline = 'Know your home. Plan your next move.';

export const fsboLandingUrl = process.env.NEXT_PUBLIC_FSBO_LANDING_URL || 'https://movewithmaryv.com';
export const fsboGuideUrl = process.env.NEXT_PUBLIC_FSBO_GUIDE_URL || '#';

export const dpaPrograms = [
  {
    state: 'Arizona',
    county: 'General',
    title: 'Arizona homebuyer assistance resources',
    note: 'Arizona buyers may have access to state, county, or lender-specific options. Availability may vary by income, location, and loan program.'
  },
  {
    state: 'Arizona',
    county: 'Maricopa County / West Valley',
    title: 'West Valley & Maricopa County assistance resources',
    note: 'Some city and county programs may provide down payment help, but rules can change. Always verify eligibility before making an offer.'
  }
];

// ---------------------------------------------------------------------------
// Co-brand identity — Move With Mary V hub (Mary = agent, Scott = lender).
// All env-overridable so the same code can serve another co-brand later.
// ---------------------------------------------------------------------------
export const hubName = process.env.NEXT_PUBLIC_HUB_NAME || 'Homeowner Hub';
export const hubTagline = process.env.NEXT_PUBLIC_HUB_TAGLINE || 'Your home & next-move plan';

// Agent (real estate)
export const agentName = process.env.NEXT_PUBLIC_AGENT_NAME || 'Mary Vega';
export const agentTitle = process.env.NEXT_PUBLIC_AGENT_TITLE || 'REALTOR®';
export const agentInitials = process.env.NEXT_PUBLIC_AGENT_INITIALS || 'MV';
export const agentBrokerage = process.env.NEXT_PUBLIC_AGENT_BROKERAGE || 'Keller Williams';
export const agentLicense = process.env.NEXT_PUBLIC_AGENT_LICENSE || 'AZ Lic. SA648249000';
export const agentArea = process.env.NEXT_PUBLIC_AGENT_AREA || 'West Valley, Arizona';

// Lender (mortgage)
export const lenderName = process.env.NEXT_PUBLIC_LENDER_NAME || 'Scott Smith';
export const lenderTitle = process.env.NEXT_PUBLIC_LENDER_TITLE || 'Mortgage Loan Originator';
export const lenderInitials = process.env.NEXT_PUBLIC_LENDER_INITIALS || 'SS';
export const lenderNmls = process.env.NEXT_PUBLIC_LENDER_NMLS || '2244351';
export const lenderCompany = process.env.NEXT_PUBLIC_LENDER_COMPANY || 'Citywide Home Mortgage';
export const lenderCompanyNmls = process.env.NEXT_PUBLIC_LENDER_COMPANY_NMLS || '2611';

// Combined co-brand disclosure line (Fair Housing + NMLS + EHL)
export const coBrandDisclosure =
  process.env.NEXT_PUBLIC_COBRAND_DISCLOSURE ||
  `${agentName}, ${agentTitle}, ${agentBrokerage} (${agentLicense}). ` +
  `Financing information provided by ${lenderName}, ${lenderTitle}, NMLS #${lenderNmls}, ` +
  `${lenderCompany}, NMLS #${lenderCompanyNmls}, Equal Housing Lender. ` +
  `Educational planning tools only — not a loan approval, rate quote, commitment to lend, ` +
  `guarantee of program eligibility, or a settlement statement. Equal Housing Opportunity.`;
