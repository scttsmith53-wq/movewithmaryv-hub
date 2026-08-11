# Move With Mary V — Hub deploy (private preview behind a password)

Goal: get this hub live tonight at a temporary Amplify URL, behind a username/password,
so it can be reviewed before wiring the real domain.

## 0) Verify it builds (do this first)
    cd movewithmaryv-hub
    rm -rf node_modules .next
    npm install
    npm run build      # must succeed before deploying. Fix any TS/ESLint errors it reports.

## 1) Put the code in a Git repo Amplify can build
- Create a new GitHub repo (e.g. movewithmaryv-hub) and push this folder.
  (.gitignore already excludes node_modules/.next/.env.local)

## 2) Amplify app
- Use Mary's Amplify app (id dvrvzdwvbg29r) or create a new one.
- Connect the GitHub repo + branch (main). amplify.yml is already in the repo.
- Build image: Amplify default (Node 18/20). SSR (Next 14) — Amplify auto-detects.

## 3) Environment variables (Amplify > App settings > Environment variables)
Client (safe, public):
  NEXT_PUBLIC_SUPABASE_URL=https://nkflnoyltjaexesirdkv.supabase.co
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_JeJ9BDR_YP3SC0_9H46npA_HwUa5sap
  NEXT_PUBLIC_HUB_NAME=Homeowner Hub
  NEXT_PUBLIC_HUB_TAGLINE=Your home & next-move plan
  NEXT_PUBLIC_BRAND_NAME=Mary Vega
  NEXT_PUBLIC_SITE_NAME=Move With Mary V
  NEXT_PUBLIC_AGENT_NAME=Mary Vega
  NEXT_PUBLIC_AGENT_TITLE=REALTOR®
  NEXT_PUBLIC_AGENT_INITIALS=MV
  NEXT_PUBLIC_AGENT_BROKERAGE=Keller Williams
  NEXT_PUBLIC_AGENT_LICENSE=AZ Lic. SA648249000
  NEXT_PUBLIC_AGENT_AREA=West Valley, Arizona
  NEXT_PUBLIC_LENDER_NAME=Scott Smith
  NEXT_PUBLIC_LENDER_TITLE=Mortgage Loan Originator
  NEXT_PUBLIC_LENDER_INITIALS=SS
  NEXT_PUBLIC_LENDER_NMLS=2244351
  NEXT_PUBLIC_LENDER_COMPANY=Citywide Home Mortgage
  NEXT_PUBLIC_LENDER_COMPANY_NMLS=2611

Server (secret — paste real values, do NOT commit):
  SUPABASE_SERVICE_ROLE_KEY=<Mary project service role key>
  GHL_PORTAL_EVENT_WEBHOOK_URL=<Mary GHL inbound webhook>
  # Optional (only if you want the AI assistant/webinar features working now):
  # ANTHROPIC_API_KEY=...   ANTHROPIC_MODEL=...
  # WEBINAR_ADMIN_EMAILS=...  WEBINAR_EMBED_URL=...  WEBINAR_REPLAY_URL=...  CF_STREAM=...

## 4) Password-protect the preview
- Amplify > App settings > Access control > Manage access.
- Set "Restrict access" = Password protected, add a username + password.
  (This covers the whole site regardless of the app's own login.)

## 5) Review
- Open the branch URL:  https://main.dvrvzdwvbg29r.amplifyapp.com  (login with the pw from step 4)
- Key pages to check: /sale-proceeds (new co-branded calculator), /dashboard, /about, /testimonials.

## 6) Real domain (later)
- Amplify > Domain management > add app.movewithmaryv.com.
- Add the CNAME Amplify gives you at SiteGround DNS (app -> *.cloudfront...). SSL auto.

## ⚠️ Toolchain gotcha — npm is broken, use pnpm (Windows AND Amplify)

`npm install` fails with **"Exit handler never called!"** for this project — on Scott's
Windows machine *and* on Amplify's Linux CodeBuild builder (it hangs ~8 min then dies in
preBuild). It is not OneDrive and not the OS; it's npm choking on this dependency tree.

**Fix everywhere = pnpm via corepack.** The repo's `amplify.yml` preBuild is already set to:

    corepack enable
    corepack prepare pnpm@latest --activate
    pnpm config set verify-deps-before-run false   # pnpm's pre-run check aborts on unrs-resolver ignored-build
    pnpm install --no-frozen-lockfile

and the build step runs `pnpm exec next build --no-lint`. If a future Amplify app is created
and defaults its build spec back to `npm install`, replace it with the block above or the
build will fail. Locally: `corepack pnpm install` then `corepack pnpm exec next build --no-lint`.

Two repo fixes that keep the build green under pnpm (already committed):
- `tsconfig.json` → `"types": ["node","react","react-dom"]` (stops TS scanning a broken
  transitive `@types/cookie` under pnpm's node_modules layout).
- `next.config.js` → `eslint: { ignoreDuringBuilds: true }` (Amplify won't fail on lint; TS check stays on).

## ⚠️ Amplify: Git-connected app vs manual-deploy app

The original `movewithmaryv` app (id `dvrvzdwvbg29r`, holds domain app.movewithmaryv.com) was a
**manual-upload** app (drag-and-drop zip / S3 / URL). A manual app **cannot** run CI/CD builds and
**cannot** host Next.js SSR (our hub has API routes + SSR). You must use a **Git-connected** app.
The hub now builds from a new Git-connected app **`movewithmaryv-hub`** (id `dbh0ww2kf521j`), temp URL
`https://main.dbh0ww2kf521j.amplifyapp.com`. Move the custom domain onto this app once the preview is approved.

## Known still-Scott / TODO (not blockers for preview)
- Webinar feature still reads as Scott (host).
- /search is a placeholder (Mary needs AZ/ARMLS IDX).
- About page needs Mary's bio + /public/images/mary-headshot.png.
- Resource PDFs are Scott's for now (intentional).
