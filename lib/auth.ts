export type PortalUser = {
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  locationId?: string;
  locationName?: string;
  source?: 'ghl' | 'demo' | 'manual';
  initializedAt?: string;
};

const USER_KEY = 'bch_user';
const AUTH_COOKIE = 'bch_portal_auth';

function setAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

function clean(value: string | null): string | undefined {
  if (!value) return undefined;
  const decoded = decodeURIComponent(value).trim();
  return decoded.length ? decoded : undefined;
}

export function getPortalUser(): PortalUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

// Backward compatible alias for existing components.
export const getDemoUser = getPortalUser;

export function savePortalUser(user: PortalUser) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  setAuthCookie();
}

export function setDemoUser(email: string) {
  const firstName = email.split('@')[0].split(/[._-]/)[0] || 'Buyer';
  savePortalUser({ email, firstName, source: 'demo', initializedAt: new Date().toISOString() });
}

export function clearDemoUser() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(USER_KEY);
  clearAuthCookie();
}

/**
 * Reads GoHighLevel iframe/embed parameters from the current URL and stores a local portal user.
 * Expected URL example:
 * /?email={{user.email}}&firstName={{user.firstName}}&lastName={{user.lastName}}&phone={{user.phone}}&locationId={{location.id}}
 */
export function initializeUserFromUrl(search = typeof window !== 'undefined' ? window.location.search : ''): PortalUser | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(search);
  const email = clean(params.get('email') || params.get('userEmail'));

  // Do not create a profile without an email. GHL login remains the access gate; email is the local storage key.
  if (!email || !email.includes('@')) return getPortalUser();

  const firstName = clean(params.get('firstName') || params.get('firstname'));
  const lastName = clean(params.get('lastName') || params.get('lastname'));
  const fullName = clean(params.get('fullName') || params.get('name')) || [firstName, lastName].filter(Boolean).join(' ') || undefined;
  const phone = clean(params.get('phone'));
  const locationId = clean(params.get('locationId') || params.get('location_id'));
  const locationName = clean(params.get('locationName') || params.get('location_name'));

  const user: PortalUser = {
    email,
    firstName,
    lastName,
    fullName,
    phone,
    locationId,
    locationName,
    source: 'ghl',
    initializedAt: new Date().toISOString()
  };

  savePortalUser(user);
  return user;
}

export function getUserDisplayName(user: PortalUser | null): string {
  if (!user) return 'Buyer';
  return user.firstName || user.fullName?.split(' ')[0] || user.email.split('@')[0] || 'Buyer';
}
