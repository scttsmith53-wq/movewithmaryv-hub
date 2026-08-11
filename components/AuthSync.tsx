"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { savePortalUser, getPortalUser } from "@/lib/auth";

const TRACK_URL =
  process.env.NEXT_PUBLIC_TRACK_EVENT_URL ??
  "https://qfhfuesnjfuwfujhvgpa.supabase.co/functions/v1/track-event";

function firstNameFrom(email: string, meta: Record<string, unknown>): string | undefined {
  return (
    (meta.first_name as string) ||
    (meta.firstName as string) ||
    (email ? email.split("@")[0].split(/[._-]/)[0] : undefined)
  );
}

// Bridges a real Supabase session into the existing PortalUser model so every
// component that reads getPortalUser() keeps working, and fires a portal_login
// event (once per sign-in) into the backend events table.
export default function AuthSync() {
  useEffect(() => {
    const supabase = (() => {
      try {
        return getSupabaseBrowserClient();
      } catch {
        return null;
      }
    })();
    if (!supabase) return;
    let firedFor = "";

    function hydrate(session: { user?: { email?: string; user_metadata?: Record<string, unknown> } } | null, isNewLogin: boolean) {
      const user = session?.user;
      if (!user?.email) return;
      const meta = user.user_metadata || {};
      savePortalUser({
        email: user.email,
        firstName: firstNameFrom(user.email, meta),
        lastName: (meta.last_name as string) || (meta.lastName as string),
        phone: meta.phone as string,
        source: "ghl",
        initializedAt: new Date().toISOString(),
      });
      document.cookie = `bch_portal_auth=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

      if (isNewLogin && firedFor !== user.email) {
        firedFor = user.email;
        try {
          fetch(TRACK_URL, {
            method: "POST",
            keepalive: true,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventType: "portal_login", email: user.email }),
          }).catch(() => {});
        } catch {
          /* tracking must never break the portal */
        }
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) hydrate(data.session, !getPortalUser());
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) hydrate(session, event === "SIGNED_IN");
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}
