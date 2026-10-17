import { sitemapResponse } from '@/services/seo/sitemapResponse';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const GET = (request: Request) => sitemapResponse(request);
