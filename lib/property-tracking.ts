'use client';

// -----------------------------------------------------------------------------
// Property-search behavior tracking.
//
// Thin, typed wrappers over trackPortalEvent so the Home Search page (IDX embed)
// can log every meaningful action a buyer takes. Everything flows through the
// existing pipeline: /api/events -> portal_events table + GHL webhook. No new
// backend needed. The AI brain reads these back via /api/property-activity.
//
// Hook these to your IDX provider's JS events (or DOM listeners) once the embed
// is live. Each provider differs, so the *capture* wiring is finalized then;
// this vocabulary + sender is stable and provider-agnostic.
// -----------------------------------------------------------------------------

import { trackPortalEvent } from '@/lib/portal-events';

export type PropertyDetails = {
  mlsId?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  propertyType?: string;
  status?: string;
  url?: string;
};

export type SearchDetails = {
  query?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  propertyType?: string;
  resultsCount?: number;
  url?: string;
};

// Canonical event vocabulary. Keep in sync with PROPERTY_EVENT_TYPES below and
// with any GHL scoring workflows Scott builds on these.
export const PropertyEvents = {
  SEARCH_RUN: 'PROPERTY_SEARCH_RUN',
  SEARCH_SAVED: 'PROPERTY_SEARCH_SAVED',
  LISTING_VIEWED: 'PROPERTY_VIEWED',
  LISTING_SAVED: 'PROPERTY_SAVED',
  LISTING_UNSAVED: 'PROPERTY_UNSAVED',
  LISTING_SHARED: 'PROPERTY_SHARED',
  TOUR_REQUESTED: 'PROPERTY_TOUR_REQUESTED',
  AREA_VIEWED: 'PROPERTY_MAP_AREA_VIEWED',
} as const;

export const PROPERTY_EVENT_TYPES: string[] = Object.values(PropertyEvents);

const CATEGORY = { category: 'property_search' } as const;

/** A buyer opened a listing detail page. The strongest single intent signal. */
export function trackPropertyView(p: PropertyDetails) {
  return trackPortalEvent({
    eventType: PropertyEvents.LISTING_VIEWED,
    eventValue: p.address || p.mlsId,
    metadata: { ...p, ...CATEGORY },
  });
}

/** A buyer favorited / saved a listing. */
export function trackPropertySaved(p: PropertyDetails) {
  return trackPortalEvent({
    eventType: PropertyEvents.LISTING_SAVED,
    eventValue: p.address || p.mlsId,
    metadata: { ...p, ...CATEGORY },
  });
}

/** A buyer removed a saved listing. */
export function trackPropertyUnsaved(p: PropertyDetails) {
  return trackPortalEvent({
    eventType: PropertyEvents.LISTING_UNSAVED,
    eventValue: p.address || p.mlsId,
    metadata: { ...p, ...CATEGORY },
  });
}

/** A buyer ran a search (with filters). */
export function trackPropertySearch(s: SearchDetails) {
  return trackPortalEvent({
    eventType: PropertyEvents.SEARCH_RUN,
    eventValue: s.query || s.city,
    metadata: { ...s, ...CATEGORY },
  });
}

/** A buyer saved a search for alerts — high intent. */
export function trackSearchSaved(s: SearchDetails) {
  return trackPortalEvent({
    eventType: PropertyEvents.SEARCH_SAVED,
    eventValue: s.query || s.city,
    metadata: { ...s, ...CATEGORY },
  });
}

/** A buyer requested a tour / showing — hottest signal. */
export function trackTourRequested(p: PropertyDetails) {
  return trackPortalEvent({
    eventType: PropertyEvents.TOUR_REQUESTED,
    eventValue: p.address || p.mlsId,
    metadata: { ...p, ...CATEGORY },
  });
}

/** A buyer shared a listing. */
export function trackPropertyShared(p: PropertyDetails) {
  return trackPortalEvent({
    eventType: PropertyEvents.LISTING_SHARED,
    eventValue: p.address || p.mlsId,
    metadata: { ...p, ...CATEGORY },
  });
}
