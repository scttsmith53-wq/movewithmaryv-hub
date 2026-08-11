# Buyer Confidence Hub

Polished Next.js member portal for first-time homebuyer webinar attendees.

## What's included

- Branded login page
- Dashboard
- Webinar replay page
- Buyer readiness checklist
- Credit education center
- Down payment assistance resource page
- Loan path education
- Mortgage payment calculator with PITI, HOA, and PMI/MIP
- Cost of waiting calculator
- Demo localStorage login
- Supabase packages included for future real authentication

## Run locally on Windows PowerShell

```bash
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`.

Demo login: use any email and any password with 6+ characters.

## Important note

The calculators are educational estimates only. They are not a loan approval, rate quote, commitment to lend, or guarantee of down payment assistance eligibility.

## GoHighLevel Embed Setup

Use this URL in GHL URL Embed:

```text
https://hub.smithapprovesme.com?email={{user.email}}&firstName={{user.firstName}}&lastName={{user.lastName}}&phone={{user.phone}}&locationId={{location.id}}&locationName={{location.name}}
```

Iframe version:

```html
<iframe
  src="https://hub.smithapprovesme.com?email={{user.email}}&firstName={{user.firstName}}&lastName={{user.lastName}}&phone={{user.phone}}&locationId={{location.id}}&locationName={{location.name}}"
  width="100%"
  height="1200"
  style="border:0;border-radius:16px;"
  allowfullscreen>
</iframe>
```

The Hub reads GHL query parameters, stores a local user profile by email, and saves checklist and credit planner data under that email in browser storage for V1. Do not ask users for card account numbers, SSNs, passwords, or other sensitive information.


## Resource Library PDFs

The uploaded Buyer Confidence Hub PDFs are stored in `public/resources/` and surfaced on `/resources`.

Current files:

- `/resources/buy-with-confidence-roadmap.pdf`
- `/resources/mortgage-document-guide.pdf`
- `/resources/credit-readiness-guide.pdf`
- `/resources/credit-card-paydown-planner.pdf`
- `/resources/down-payment-assistance-guide.pdf`
- `/resources/understanding-pre-approval-guide.pdf`
- `/resources/buyer-confidence-resource-center.pdf`
- `/resources/inspection-and-appraisal-guide.pdf`

To add future guides, upload the PDF into `public/resources/` and add one entry to `lib/resources.ts`.

## Branding Update
This package has been restyled to match the uploaded Buy With Confidence PDF guides:
- Deep navy + gold + white/cream palette
- Merriweather-style premium serif headings
- PDF-style footer/progress visual language
- Resource library cards designed to match the guide covers
- GHL iframe-friendly structure preserved


## About Us Page
The portal now includes `/about` for Scott Smith / HomeSmart Realty / Citywide Home Mortgage. Scott's image is kept on this page instead of being a dominant dashboard element.


## Webinar Join Link

The dashboard includes a prominent but understated `Join Webinar` button near the top. Set the destination with:

```env
NEXT_PUBLIC_WEBINAR_JOIN_URL=https://your-webinar-join-link
```

If this is not set, the button defaults to `#` until the live webinar URL is available.

## Phase 1 Portal Activity Tracking

This package includes server-side event tracking at `/api/events`.

### Supabase setup

1. In Supabase SQL Editor, run:
   `supabase/portal_events.sql`
2. In AWS Amplify environment variables, add:
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key
   - `GHL_PORTAL_EVENT_WEBHOOK_URL` = your GoHighLevel inbound webhook URL

The public Supabase values still need to remain configured:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Events currently tracked

- `PORTAL_LOGIN`
- `PORTAL_LOGIN_OR_DASHBOARD_VIEWED`
- `RESOURCE_LIBRARY_VIEWED`
- `RESOURCE_VIEW_CLICKED`
- `RESOURCE_VIEWED`
- `RESOURCE_OPENED_FULLSCREEN`
- `RESOURCE_DOWNLOADED`
- `CALCULATORS_PAGE_VIEWED`
- `MORTGAGE_CALCULATOR_USED`
- `COST_OF_WAITING_CALCULATOR_USED`
- `WEBINAR_PAGE_VIEWED`
- `WEBINAR_REGISTRATION_CLICKED`
- `WEBINAR_JOIN_CLICKED`
- `DPA_PAGE_VIEWED`
- `CONTACT_PAGE_VIEWED`
- `STRATEGY_CALL_CLICKED`

Events are designed to never block the buyer experience. If Supabase or GHL is unavailable, the portal still works.
