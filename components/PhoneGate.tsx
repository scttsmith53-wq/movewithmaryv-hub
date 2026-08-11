"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const SAVE_PHONE_URL =
  process.env.NEXT_PUBLIC_SAVE_PHONE_URL ??
  "https://qfhfuesnjfuwfujhvgpa.supabase.co/functions/v1/save-phone";

// Scott / admins are never asked for a phone.
const ADMIN_EMAILS = ["scottsmith53@yahoo.com", "scttsmith53@gmail.com"];

// After a Google/passwordless sign-in we have the email but maybe not the phone.
// If GHL has no phone for this member, ask once and save it to GHL.
export default function PhoneGate() {
  const [needsPhone, setNeedsPhone] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const supabase = (() => {
      try {
        return getSupabaseBrowserClient();
      } catch {
        return null;
      }
    })();
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;
      if (!u?.email) return;
      if (ADMIN_EMAILS.includes(u.email.toLowerCase())) return; // never gate admins
      const meta = (u.user_metadata || {}) as Record<string, unknown>;
      const full = (meta.full_name as string) || (meta.name as string) || "";
      if (!cancelled) {
        setEmail(u.email);
        setFirstName(full.split(" ")[0] || "");
      }
      try {
        const r = await fetch(`${SAVE_PHONE_URL}?email=${encodeURIComponent(u.email)}`);
        const j = await r.json();
        if (!cancelled && j?.ok && j.hasPhone === false) setNeedsPhone(true);
      } catch {
        /* never block the portal on this */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setErr("Please enter a valid mobile number.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const r = await fetch(SAVE_PHONE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, firstName }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j?.ok !== false) {
        setNeedsPhone(false);
        return;
      }
      setErr("Couldn't save that — please try again.");
    } catch {
      setErr("Connection issue — please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!needsPhone) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-[#0b1626] p-6 text-white shadow-2xl">
        <h2 className="text-xl font-black">One quick thing{firstName ? `, ${firstName}` : ""}</h2>
        <p className="mt-2 text-sm leading-6 text-white/70">
          Add your mobile number so Mary can send your homebuying info, reminders, and answer questions by text.
        </p>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          autoComplete="tel"
          placeholder="(555) 555-5555"
          className="field mt-4 w-full"
        />
        {err ? <p className="mt-3 text-sm text-red-300">{err}</p> : null}
        <button type="submit" disabled={saving} className="btn-primary mt-4 w-full">
          {saving ? "Saving…" : "Save & continue"}
        </button>
        <p className="mt-3 text-center text-[11px] text-white/40">
          We only use this to reach you about your homebuying — no spam.
        </p>
      </form>
    </div>
  );
}
