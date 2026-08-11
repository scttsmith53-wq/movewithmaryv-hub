import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'bch_portal_auth';

const protectedPrefixes = [
  '/dashboard',
  '/readiness',
  '/resources',
  '/calculators',
  '/credit',
  '/dpa',
  '/webinar',
  '/about',
  '/contact',
  '/loan-path',
  '/supabase-test'
];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function hasSupabaseSession(request: NextRequest) {
  // Supabase auth cookies vary by project/ref and auth flow. This keeps the portal compatible
  // with Supabase-authenticated users without hard-coding one exact cookie name.
  return request.cookies.getAll().some((cookie) => {
    const name = cookie.name.toLowerCase();
    return name.startsWith('sb-') && name.includes('auth-token') && Boolean(cookie.value);
  });
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // GHL/member embed support: if the portal opens with an email parameter from GHL,
  // allow the request and set the lightweight portal cookie so refreshes and navigation work.
  const embeddedEmail = searchParams.get('email') || searchParams.get('userEmail');
  if (embeddedEmail && embeddedEmail.includes('@')) {
    const response = NextResponse.next();
    response.cookies.set(AUTH_COOKIE, '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    return response;
  }

  const hasPortalCookie = request.cookies.get(AUTH_COOKIE)?.value === '1';
  const hasSupabaseCookie = hasSupabaseSession(request);

  if (hasPortalCookie || hasSupabaseCookie) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.searchParams.set('redirectTo', pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/readiness/:path*',
    '/resources/:path*',
    '/calculators/:path*',
    '/credit/:path*',
    '/dpa/:path*',
    '/webinar/:path*',
    '/about/:path*',
    '/contact/:path*',
    '/loan-path/:path*',
    '/supabase-test/:path*'
  ]
};
