"use client";

import { createBrowserClient } from "@supabase/ssr";

// Cookie-based browser client so the session is written to `sb-*-auth-token`
// cookies — which is exactly what middleware.ts already checks for. One shared
// instance per tab.
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;
  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  return browserClient;
}
