"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { registrationUrl } from "@/lib/content";
import { ArrowRight, CheckCircle2, ShieldCheck, MailCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "code" | "verifying">("idle");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setStatus("sending");
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true },
      });
      if (otpError) {
        setError(otpError.message || "Couldn't send your code. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("code");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    const token = code.replace(/\D/g, "");
    if (token.length < 6 || token.length > 8) {
      setError("Enter the verification code from your email.");
      return;
    }
    setStatus("verifying");
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: vErr } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token,
        type: "email",
      });
      if (vErr) {
        setError(vErr.message || "That code didn't work — check it and try again.");
        setStatus("code");
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirectTo");
      window.location.href = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard";
    } catch {
      setError("Something went wrong verifying the code.");
      setStatus("code");
    }
  }

  async function signInGoogle() {
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      // Redirect back to the bare /auth/callback (no query string) so it EXACTLY
      // matches the Supabase redirect allow-list entry. A `?next=` query breaks
      // that exact match, causing Supabase to fall back to the Site URL (which
      // sends users to localhost). The callback defaults to /dashboard.
      const { error: oErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (oErr) setError(oErr.message || "Google sign-in didn't start. Try the email link below.");
    } catch {
      setError("Google sign-in didn't start. Try the email link below.");
    }
  }

  // Google sign-in is hidden for now: Supabase's Site URL config (blocked by their
  // incident) keeps redirecting OAuth to localhost. Email verification code works.
  // Flip this to true to bring the Google button back once the Site URL is fixed.
  const SHOW_GOOGLE = false;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-grid bg-brand-grid p-5">
      <section className="relative w-full max-w-6xl overflow-hidden rounded-[2rem] bg-[#061426] text-white shadow-card lg:grid lg:grid-cols-[1.05fr_.95fr]">
        <div className="p-7 sm:p-12">
          <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-black text-gold">
            <ShieldCheck size={18} /> Private Homebuyer Portal
          </div>
          <p className="kicker mb-5 text-white after:bg-gold">
            Move With Mary V
          </p>
          <h1 className="brand-serif text-5xl font-black leading-tight sm:text-7xl">
            Member Portal
          </h1>
          <p className="mt-5 max-w-xl text-xl font-black leading-8 text-gold">
            Know your home. Plan your next move.
          </p>
          <p className="mt-3 max-w-xl leading-7 text-white/66">
            Enter the email you registered with and we&apos;ll email you a
            verification code &mdash; no password to remember.
          </p>

          {SHOW_GOOGLE && (
            <>
              <button
                type="button"
                onClick={signInGoogle}
                className="mt-8 flex w-full max-w-lg items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-[#1f2328] shadow-sm transition hover:-translate-y-0.5"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
                  <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
                  <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
                  <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1C6.2 6.9 8.9 4.8 12 4.8z" />
                </svg>
                Continue with Google
              </button>
              <div className="mt-5 flex max-w-lg items-center gap-3 text-[11px] font-bold uppercase tracking-wide text-white/40">
                <span className="h-px flex-1 bg-white/15" /> or use a verification code <span className="h-px flex-1 bg-white/15" />
              </div>
            </>
          )}

          {status === "code" || status === "verifying" ? (
            <form onSubmit={verifyCode} className="mt-9 max-w-lg space-y-4">
              <div className="rounded-2xl border border-gold/25 bg-gold/[.07] p-4 text-sm text-white/80">
                <span className="inline-flex items-center gap-2 font-black text-gold">
                  <MailCheck size={18} /> Code sent
                </span>
                <p className="mt-1">
                  Enter the verification code we emailed to <strong>{email}</strong>.
                  Check spam if you don&apos;t see it in a minute.
                </p>
              </div>
              <label className="block">
                <span className="text-sm font-bold text-white/70">verification code</span>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  className="field mt-2 tracking-[.4em]"
                />
              </label>
              {error && (
                <p className="rounded-2xl bg-red-500/10 p-3 text-sm text-red-100">
                  {error}
                </p>
              )}
              <button className="btn-primary w-full" type="submit" disabled={status === "verifying"}>
                {status === "verifying" ? "Verifying…" : "Verify & enter"}
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setCode("");
                  setError("");
                }}
                className="text-sm font-bold text-gold underline underline-offset-4"
              >
                Use a different email
              </button>
            </form>
          ) : (
            <form onSubmit={sendCode} className="mt-9 max-w-lg space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-white/70">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  className="field mt-2"
                  placeholder="you@example.com"
                />
              </label>
              {error && (
                <p className="rounded-2xl bg-red-500/10 p-3 text-sm text-red-100">
                  {error}
                </p>
              )}
              <button className="btn-primary w-full" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending code…" : "Email me a verification code"}
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          <div className="mt-8 max-w-lg border-t border-white/10 pt-6">
            <p className="text-sm text-white/70">
              New here? Create your free account and get instant access to the guides, tools, and the free homebuyer webinar.
            </p>
            <a
              href={registrationUrl}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/45 px-6 py-3 text-sm font-bold uppercase tracking-[.08em] text-gold transition hover:bg-gold hover:text-[#101415]"
            >
              Register Free <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <div className="relative border-t border-gold/20 bg-[#fbf8f1] p-7 text-[#061426] sm:p-12 lg:border-l lg:border-t-0">
          <div className="card-paper p-6">
            <p className="text-sm font-black uppercase tracking-widest text-[#8a6218]">
              Member Dashboard
            </p>
            <h2 className="mt-3 font-serif text-4xl font-black leading-tight">
              Your buyer tools in one place.
            </h2>
            <div className="mt-6 grid gap-3">
              {[
                "Premium PDF guides",
                "Mortgage and cost-of-waiting calculators",
                "Credit-building education",
                "Down payment assistance resources",
                "Buyer readiness roadmap",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-[#c9962b]/20 bg-white p-3 text-sm font-bold text-ink"
                >
                  <CheckCircle2 className="text-gold" size={18} />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-[#5c6b7a]">
            Educational tools only. Not a loan approval, rate quote, commitment
            to lend, or guarantee of program eligibility.
          </p>
        </div>
      </section>
    </main>
  );
}
