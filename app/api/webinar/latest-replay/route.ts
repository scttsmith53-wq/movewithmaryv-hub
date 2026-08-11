import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Returns the newest ready recording for the webinar Live Input, so the portal
// can always play the latest replay without anyone updating a URL.
const ACCOUNT_ID = process.env.CF_STREAM_ACCOUNT_ID || "d63c9d03305269c1d788d6da02271f8c";
const LIVE_INPUT_ID = process.env.CF_STREAM_LIVE_INPUT_ID || "6592431afeb7c6e69f3d491469ef7c7c";
const SUBDOMAIN = process.env.NEXT_PUBLIC_CF_STREAM_SUBDOMAIN || "customer-i2tbf7x75o30trwy.cloudflarestream.com";
const TOKEN = process.env.CF_STREAM_API_TOKEN || "";

export async function GET() {
  if (!TOKEN) return NextResponse.json({ ok: false, reason: "no token", uid: null });
  try {
    const r = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/live_inputs/${LIVE_INPUT_ID}/videos`,
      { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" },
    );
    if (!r.ok) { const detail = await r.text().catch(() => ""); return NextResponse.json({ ok: false, reason: `cf ${r.status}`, detail: detail.slice(0, 400), account: ACCOUNT_ID, liveInput: LIVE_INPUT_ID, uid: null }); }
    const d = await r.json();
    const vids = (d.result || [])
      .filter((v: { readyToStream?: boolean }) => v?.readyToStream)
      .sort(
        (a: { created?: string }, b: { created?: string }) =>
          new Date(b.created || 0).getTime() - new Date(a.created || 0).getTime(),
      );
    const latest = vids[0];
    if (!latest) return NextResponse.json({ ok: true, uid: null });
    return NextResponse.json({
      ok: true,
      uid: latest.uid,
      iframe: `https://${SUBDOMAIN}/${latest.uid}/iframe`,
      created: latest.created,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, reason: e instanceof Error ? e.message : "error", uid: null });
  }
}
