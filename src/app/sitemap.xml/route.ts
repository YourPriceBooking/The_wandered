import getSitemapEntries from '@/services/getSitemapEntries';
import { serializeSitemap } from '@/utils/sitemapXml';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(serializeSitemap(await getSitemapEntries()), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
