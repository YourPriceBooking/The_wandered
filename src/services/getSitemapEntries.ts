import type { MetadataRoute } from 'next';
import { authorsPaths, authorsAlternates } from '@/defaultData/authorsSeo';
import { listingCopy, siteUrl } from '@/utils/seoMetadata';
import { journalPath, newEpisodesPath } from '@/utils/journalSeo';
import { collectArticleInventory, canonicalArticleUrl, articleCountries, type ArticleInventory } from '@/services/seo/articleArchive';
import { readSnapshot, writeSnapshot, type Snapshot } from '@/services/seo/persistentCache';
import seed from '@/defaultData/sitemapSnapshot.json';

const TTL = 60 * 60 * 1000;
let current: Snapshot<ArticleInventory> | undefined;
let pending: Promise<Snapshot<ArticleInventory>> | undefined;
let retryAfter = 0;
function validInventory(value: unknown): value is ArticleInventory {
  const item = value as ArticleInventory;
  if (!item || !Array.isArray(item.entries) || !item.totals || !Number.isSafeInteger(item.excluded) || item.excluded < 0) return false;
  if (Object.keys(item.totals).length !== articleCountries.length || articleCountries.some((country) => !Number.isSafeInteger(item.totals[country]) || item.totals[country] < 0)) return false;
  if (Object.values(item.totals).reduce((sum, total) => sum + total, 0) !== item.entries.length + item.excluded || new Set(item.entries.map((entry) => entry.url)).size !== item.entries.length) return false;
  return item.entries.every((entry) => {
    if (typeof entry.url !== 'string' || !entry.url.startsWith(siteUrl + '/') || entry.url.includes('?') || entry.url.includes('#')) return false;
    const prefix = new URL(entry.url).pathname.split('/')[1];
    const country = articleCountries.includes(prefix as typeof articleCountries[number]) ? prefix : 'home';
    return canonicalArticleUrl(entry.url, country) === entry.url && (!entry.lastModified || Number.isFinite(Date.parse(String(entry.lastModified))));
  });
}
export function staticSitemapEntries(): MetadataRoute.Sitemap {
  return [
    ...Object.values(listingCopy).map((copy) => ({ url: `${siteUrl}${copy.path}` })),
    ...['/private-policy', journalPath, newEpisodesPath, '/travel-resources'].map((path) => ({ url: `${siteUrl}${path}` })),
    ...Object.values(authorsPaths).map((path) => ({ url: `${siteUrl}${path}`, alternates: { languages: authorsAlternates } })),
  ];
}
export async function getSitemapSnapshot() {
  if (!current) {
    current = await readSnapshot('sitemap', validInventory);
    // Checked-in, fully enumerated seed also survives replacing the checkout.
    if (!current && seed.version === 1 && validInventory(seed.data)) current = seed as Snapshot<ArticleInventory>;
  }
  if (current && (Date.now() - Date.parse(current.generatedAt) < TTL || Date.now() < retryAfter)) return current;
  if (pending) return pending;
  pending = (async () => {
    try {
      const data = await collectArticleInventory();
      const snapshot: Snapshot<ArticleInventory> = { version: 1, generatedAt: new Date().toISOString(), data };
      await writeSnapshot('sitemap', snapshot).catch((error) => console.error('[seo-sitemap] disk cache write failed', error));
      current = snapshot;
      console.info('[seo-sitemap] complete refresh', { totals: data.totals, included: data.entries.length, excluded: data.excluded });
    } catch (error) {
      retryAfter = Date.now() + 60_000;
      console.error('[seo-sitemap] refresh failed; retaining last complete snapshot', error);
      if (!current) throw error;
    }
    return current!;
  })().finally(() => { pending = undefined; });
  return pending;
}
export default async function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await getSitemapSnapshot();
  return [...staticSitemapEntries(), ...snapshot.data.entries];
}
