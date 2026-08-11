# Supabase Edge Functions — deployed vs. repo map

⚠️ **Several live functions are NOT in this repo.** Editing a repo file and
redeploying can silently drop behavior that only exists in the deployed version.
That is exactly what broke lead follow-up in July 2026: `hyper-handler` was
edited from `register/index.ts` (which had no `claude-router` call), and
redeploying it dropped the registration→welcome trigger.

## The follow-up architecture (how a lead becomes a welcome + nurture)

1. A landing form / open-house page POSTs the lead to the **`hyper-handler`**
   function.
2. `hyper-handler` creates the Supabase auth user + profile + magic link,
   upserts the **named** GHL contact (`upsertLeadContact`), texts Scott
   (`notifyScott`), syncs Google Contacts (`syncGoogleContact`), and now fires a
   `registration` event to **`claude-router`** (`fireRegistration`).
3. **`claude-router`** is the brain: on a `registration` event it sends the
   dual-channel welcome (email + SMS) and owns scoring, pipeline, and nurture.
4. **`nurture`** (pg_cron, hourly) fires `nurture_check` events at day
   milestones → `claude-router` decides each touch.
5. **`webinar-reminder`** (pg_cron, every 5 min) fires `webinar_reminder`
   events → `claude-router` writes each reminder. **`webinar-presence`** logs
   attendance so the post-webinar thank-you/no-show split works.

## Deployed function  →  repo source

| Deployed name       | Repo folder                     | In repo? |
|---------------------|---------------------------------|----------|
| `hyper-handler`     | `supabase/functions/register/`  | ✅ (folder name differs from deployed name!) |
| `register` (bridge) | `supabase/functions/register-bridge/` | ⬜ needs backup |
| `claude-router`     | `supabase/functions/claude-router/`   | ⬜ needs backup |
| `nurture`           | `supabase/functions/nurture/`         | ⬜ needs backup |
| `assistant-chat`    | `supabase/functions/assistant-chat/`  | ⬜ needs backup |
| `webinar-presence`  | `supabase/functions/webinar-presence/`| ⬜ needs backup |
| `webinar-reminder`  | `supabase/functions/webinar-reminder/`| ⬜ needs backup |
| `ask`               | `supabase/functions/ask/`       | ✅ |
| `sms-alert`         | `supabase/functions/sms-alert/` | ✅ |

**Note the trap:** the repo folder `register/` deploys as **`hyper-handler`**,
while the deployed **`register`** function (a lighter contact+welcome bridge)
has no repo folder yet. When deploying, match by intent, not by name.

## Deploy rules
- All externally-called functions must be deployed with **Verify JWT OFF**
  (otherwise the gateway returns 401 before your code runs).
- After editing a repo function, redeploy that specific function.
- Before editing a function you haven't touched recently, pull the **deployed**
  code first — it may be ahead of the repo.
