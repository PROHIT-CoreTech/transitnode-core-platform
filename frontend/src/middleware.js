import { NextResponse } from 'next/server';

/**
 * Middleware handler for dynamic multi-tenant routing based on subdomains.
 *
 * @param {import('next/server').NextRequest} request
 * @returns {NextResponse}
 */
export function middleware(request) {
  try {
    const url = request.nextUrl.clone();
    const host = request.headers.get('host');

    // Strict safety check for host existence and formatting
    if (!host || typeof host !== 'string') {
      return NextResponse.next();
    }

    const hostNormalized = host.toLowerCase().trim();

    // Define base domains that should skip rewrite interception
    const isBaseDomain =
      hostNormalized.startsWith('localhost') ||
      hostNormalized.startsWith('127.0.0.1') ||
      hostNormalized === 'transitnode.prohitcoretech.com' ||
      hostNormalized === 'www.transitnode.prohitcoretech.com' ||
      hostNormalized.endsWith('.vercel.app');

    if (isBaseDomain) {
      return NextResponse.next();
    }

    // Define target host suffix for subdomains
    const targetSuffix = '.transitnode.prohitcoretech.com';

    if (hostNormalized.endsWith(targetSuffix)) {
      // Extract the leading companyName subdomain
      const companyName = hostNormalized.substring(0, hostNormalized.length - targetSuffix.length);

      // Validate companyName format to avoid path traversal or empty slugs
      if (
        companyName &&
        companyName !== 'www' &&
        companyName !== 'masteradmin' &&
        /^[a-z0-9-]+$/.test(companyName)
      ) {
        // Rewrite the request destination to the tenant folder path structure
        url.pathname = `/_tenants/${companyName}${url.pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  } catch (error) {
    // Prevent application crash on parsing errors and fallback gracefully
    console.error('Middleware dynamic routing failed:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo/images assets (if any static folders exist)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
