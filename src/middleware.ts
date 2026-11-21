import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isRetiredNycTransportPath } from './utils/nycTransportArticle';
import { documentLanguage } from './utils/documentLanguage';

export function middleware(request: NextRequest) {
  if (isRetiredNycTransportPath(request.nextUrl.pathname)) {
    return new NextResponse('Gone', { status: 410, headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' } });
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-wandered-language', documentLanguage(request.nextUrl.pathname));
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|webp|svg|gif|ico|woff|woff2|ttf)$).*)'],
};
