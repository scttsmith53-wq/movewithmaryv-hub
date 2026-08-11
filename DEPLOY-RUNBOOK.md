# Hub Deploy Runbook — Next.js hub → AWS Amplify (co-branded clones)
*Battle-tested Aug 11, 2026 deploying Mary Vega's co-branded hub. Follow top to bottom for any
buyer-confidence-hub fork. Each numbered step is a gate — don't move on until it's green.*

---

## 0. One-time per clone: get the code on GitHub
1. In the hub folder, make sure `.gitignore` excludes `node_modules/`, `.next/`, `.env.local`.
2. `git init` (if new), commit everything.
3. Create an **empty** GitHub repo (no README / .gitignore / license — an empty repo, or the first
   push conflicts). Private.
4. Point the remote at YOUR real username (not a placeholder) and push:
   ```
   git remote add origin https://github.com/scttsmith53-wq/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```
   Auth is via the browser popup (Google login is fine). "Repository not found" = the repo wasn't
   actually created on GitHub yet, or the URL still has a placeholder username.

## 1. amplify.yml — MUST use pnpm 9 via corepack
npm is broken for these projects ("Exit handler never called!") on Windows AND Amplify's Linux
builder. Use pnpm. And pin pnpm **9** — pnpm 10 (`@latest`) hard-fails in CI on ignored build
scripts. The repo's `amplify.yml`:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - corepack enable
        - corepack prepare pnpm@9.12.0 --activate
        - pnpm install --no-frozen-lockfile
    build:
      commands:
        - env | grep -e SUPABASE_SERVICE_ROLE_KEY -e SUPABASE_URL -e SUPABASE_PUBLISHABLE_KEY -e GHL_PORTAL_EVENT_WEBHOOK_URL >> .env.production || true
        - pnpm exec next build --no-lint
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - .next/cache/**/*
      - node_modules/**/*
```

## 2. Repo fixes that keep the build green (commit these)
- **`pnpm-workspace.yaml`** — if pnpm auto-generated one containing `allowBuilds: ... set this to
  true or false` with NO `packages:` field, pnpm 9 aborts with "packages field missing or empty."
  Replace the whole file with:
  ```yaml
  packages:
    - .
  ```
- **`tsconfig.json`** → add `"types": ["node","react","react-dom"]` (stops TS scanning a broken
  transitive `@types/cookie` under pnpm's layout).
- **`next.config.js`** → add `eslint: { ignoreDuringBuilds: true }` (Amplify won't fail on lint;
  TS type-check stays on).
- **`package.json`** → `"pnpm": { "ignoredBuiltDependencies": ["unrs-resolver"] }` (harmless on
  pnpm 9; belt-and-suspenders).

## 3. Create the Amplify app — Git-connected, NOT manual
A manual-upload Amplify app (drag-and-drop zip / S3 / URL) **cannot** run CI/CD builds and
**cannot** host Next.js SSR (our hubs have API routes/SSR). In the Amplify console:
**Create new app → Host web app → GitHub → authorize → pick repo + `main` branch → deploy.**
Every `git push` then auto-builds.
- Watch the build log: preBuild should show `corepack` / `pnpm install` (not `npm install`), the
  `unrs-resolver` line as a *warning*, then `pnpm exec next build`, then "Compiled successfully."

## 4. Environment variables
App settings → Environment variables → paste the `NEXT_PUBLIC_*` block (safe/public) + server
secrets (`SUPABASE_SERVICE_ROLE_KEY`, `GHL_PORTAL_EVENT_WEBHOOK_URL`). Changing them = one redeploy
to take effect. Without them pages still render from built-in defaults, but forms/data won't post.

## 5. Password-gate the preview
App settings → **Access control** → Manage access → Restrict access = **Password protected** →
add username + password. Covers the whole site.

## 6. Link the real domain (do this AFTER the preview is approved)
The domain (e.g. app.movewithmaryv.com) is registered + DNS at **SiteGround**, and the domain has
**live email** — do NOT move nameservers or you'll break MX/SPF/DKIM. Only touch the one subdomain.
If the subdomain is currently attached to an OLD (manual) Amplify app, you must free it first —
Amplify won't let two apps claim the same hostname.

1. **Old app** (`movewithmaryv`, id `dvrvzdwvbg29r`): Hosting → Custom domains → **remove** the
   app.movewithmaryv.com association.
2. **New Git app** (`movewithmaryv-hub`, id `dbh0ww2kf521j`): Hosting → Custom domains → **Add
   domain** → `movewithmaryv.com` → map the **`app`** subdomain to the `main` branch. (Or add
   `app.movewithmaryv.com` directly.)
3. Amplify gives you a **CNAME target** (a `*.cloudfront.net` value). At **SiteGround DNS**, update
   the `app` CNAME record to that new target. Leave all other records (root, www, MX, mail) alone.
4. Wait for DNS propagation; Amplify auto-provisions the SSL cert. The temporary "not secure"
   warning during provisioning is normal.
5. Verify `https://app.movewithmaryv.com` loads the new hub (still behind the Access-control
   password until you decide to open it up).

## Reference
- Repo: github.com/scttsmith53-wq/movewithmaryv-hub (private)
- New Git app: `movewithmaryv-hub` / `dbh0ww2kf521j` / temp URL https://main.dbh0ww2kf521j.amplifyapp.com
- Old manual app (domain parked here until step 6): `movewithmaryv` / `dvrvzdwvbg29r`
- Supabase (Mary): `nkflnoyltjaexesirdkv`
