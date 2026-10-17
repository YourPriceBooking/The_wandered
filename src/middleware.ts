import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { documentLanguage } from './utils/documentLanguage';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-wandered-language', documentLanguage(request.nextUrl.pathname));
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|webp|svg|gif|ico|woff|woff2|ttf)$).*)'],
};
