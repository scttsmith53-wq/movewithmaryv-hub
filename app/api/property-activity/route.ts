import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { PROPERTY_EVENT_TYPES } from '@/lib/property-tracking';

// -----------------------------------------------------------------------------
// Property-search activity read API.
//
// GET /api/property-activity?email=buyer@example.com
//   -> { ok, count, events, summary }
//
// `summary` is a compact, plain-English rollup of what the buyer has been
// shopping for. Feed it into the AI assistant's context so replies are
// personalized ("I see you've been looking at 3-bed homes in Aurora around
// $450–525k…"), and use it to power a "Recently viewed" strip in the portal.
//
// Reads the existing portal_events table with the service role key (server only).
// -----------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type EventRow = {
  event_type: string;
  event_value: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

function num(v: unknown): number | undefined {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : undefined;
}

function money(n?: number): string | undefined {
  if (n === undefined) return undefined;
  return '$' + Math.round(n).toLocaleString('en-US');
}

function buildSummary(rows: EventRow[]): string {
  if (!rows.length) return 'No property-search activity yet.';

  const views = rows.filter((r) => r.event_type === 'PROPERTY_VIEWED');
  const saves = rows.filter((r) => r.event_type === 'PROPERTY_SAVED');
  const searches = rows.filter((r) => r.event_type === 'PROPERTY_SEARCH_RUN');
  const savedSearches = rows.filter((r) => r.event_type === 'PROPERTY_SEARCH_SAVED');
  const tours = rows.filter((r) => r.event_type === 'PROPERTY_TOUR_REQUESTED');

  const cities = new Set<string>();
  const prices: number[] = [];
  const bedsSet = new Set<number>();
  for (const r of rows) {
    const m = r.metadata || {};
    const city = typeof m.city === 'string' ? m.city.trim() : '';
    if (city) cities.add(city);
    const p = num(m.price) ?? num(m.maxPrice);
    if (p) prices.push(p);
    const b = num(m.beds);
    if (b) bedsSet.add(b);
  }

  const parts: string[] = [];
  if (views.length) parts.push(`viewed ${views.length} listing${views.length > 1 ? 's' : ''}`);
  if (saves.length) parts.push(`saved ${saves.length}`);
  if (searches.length) parts.push(`ran ${searches.length} search${searches.length > 1 ? 'es' : ''}`);
  if (savedSearches.length) parts.push(`saved ${savedSearches.length} search alert${savedSearches.length > 1 ? 's' : ''}`);
  if (tours.length) parts.push(`requested ${tours.length} tour${tours.length > 1 ? 's' : ''}`);

  const bits: string[] = [];
  if (parts.length) bits.push('Recently ' + parts.join(', ') + '.');
  if (cities.size) bits.push(`Areas: ${Array.from(cities).slice(0, 5).join(', ')}.`);
  if (prices.length) {
    const lo = money(Math.min(...prices));
    const hi = money(Math.max(...prices));
    bits.push(lo === hi ? `Around ${lo}.` : `Price range ${lo}–${hi}.`);
  }
  if (bedsSet.size) bits.push(`Beds: ${Array.from(bedsSet).sort((a, b) => a - b).join(', ')}.`);

  const recent = views.slice(0, 3).map((r) => r.event_value).filter(Boolean);
  if (recent.length) bits.push(`Last viewed: ${recent.join('; ')}.`);

  return bits.join(' ');
}

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ ok: false, error: 'Missing email' }, { status: 400 });
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('portal_events')
      .select('event_type, event_value, created_at, metadata')
      .eq('email', email)
      .in('event_type', PROPERTY_EVENT_TYPES)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(80);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const events = (data || []) as EventRow[];
    return NextResponse.json({
      ok: true,
      count: events.length,
      summary: buildSummary(events),
      events,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
