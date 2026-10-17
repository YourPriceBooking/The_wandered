import getSitemapEntries, { getSitemapSnapshot } from '@/services/getSitemapEntries';
import { sitemapDocuments, sitemapIndex } from '@/utils/sitemapDocuments';
import { siteUrl } from '@/utils/seoMetadata';
import { createHash } from 'node:crypto';

export async function sitemapResponse(request: Request, part?: string): Promise<Response> {
  try {
    const entries = await getSitemapEntries();
    const snapshot = await getSitemapSnapshot();
    const documents = sitemapDocuments(entries);
    if (part !== undefined && (!/^[1-9]\d*\.xml$/.test(part) || Number.parseInt(part) > documents.length || documents.length === 1)) return new Response('Not found', { status: 404 });
    const xml = part ? documents[Number.parseInt(part) - 1] : documents.length === 1 ? documents[0] : sitemapIndex(siteUrl, documents.length);
    const stale = Date.now() - Date.parse(snapshot.generatedAt) >= 60 * 60 * 1000;
    const etag = `"${createHash('sha256').update(xml).digest('hex')}"`;
    const headers = {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': stale ? 'public, max-age=60' : 'public, max-age=300',
      'X-Sitemap-Status': stale ? 'stale-complete' : 'fresh-complete',
      'X-Sitemap-URLs': String(entries.length),
      'X-Sitemap-Generated-At': snapshot.generatedAt,
      ETag: etag,
    };
    return request.headers.get('if-none-match') === etag ? new Response(null, { status: 304, headers }) : new Response(xml, { headers });
  } catch (error) {
    console.error('[seo-sitemap] no complete snapshot available', error);
    return new Response('Sitemap temporarily unavailable', { status: 503, headers: { 'Retry-After': '300', 'Cache-Control': 'no-store' } });
  }
}
