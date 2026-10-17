import type { MetadataRoute } from 'next';
import { serializeSitemap } from '@/utils/sitemapXml';

export function sitemapDocuments(entries: MetadataRoute.Sitemap, maxUrls = 50_000, maxBytes = 48 * 1024 * 1024): string[] {
  const empty = serializeSitemap([]);
  const chunks: string[] = [];
  let group: MetadataRoute.Sitemap = []; let bytes = Buffer.byteLength(empty);
  for (const entry of entries) {
    const size = Buffer.byteLength(serializeSitemap([entry])) - Buffer.byteLength(empty) + 1;
    if (size + Buffer.byteLength(empty) > maxBytes) throw new Error('One sitemap URL exceeds the byte limit');
    if (group.length && (group.length >= maxUrls || bytes + size > maxBytes)) {
      chunks.push(serializeSitemap(group)); group = []; bytes = Buffer.byteLength(empty);
    }
    group.push(entry); bytes += size;
  }
  if (group.length || !chunks.length) chunks.push(serializeSitemap(group));
  return chunks;
}
export function sitemapIndex(baseUrl: string, count: number): string {
  return '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    Array.from({ length: count }, (_, index) => `<sitemap><loc>${baseUrl}/sitemaps/${index + 1}.xml</loc></sitemap>`).join('\n') + '\n</sitemapindex>\n';
}
