import { canonicalArticleUrl, articleCountries, siteUrl } from '@/utils/articleUrl';
export { canonicalArticleUrl, articleCountries } from '@/utils/articleUrl';
import { getPostData } from '@/services/getPostData';
import type { MetadataRoute } from 'next';

const LIMIT = 100;
export type ArticleInventory = { entries: MetadataRoute.Sitemap; totals: Record<string, number>; excluded: number };
async function batch(country: string, page: number) {
  const url = new URL('/blog/api/post/get-all', siteUrl);
  url.search = new URLSearchParams({ typeOfPage: country, page: String(page), limit: String(LIMIT) }).toString();
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Article inventory ${country}: HTTP ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload?.result) || !Number.isSafeInteger(payload.total) || payload.total < 0 || payload.result.length > LIMIT) throw new Error(`Invalid inventory: ${country}`);
  return payload as { result: { _id: string; articleUrl: string }[]; total: number };
}
export async function mapConcurrent<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const output: R[] = new Array(items.length); let index = 0; let failed = false;
  const results = await Promise.allSettled(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (!failed && index < items.length) {
      const current = index++;
      try { output[current] = await worker(items[current]); } catch (error) { failed = true; throw error; }
    }
  }));
  const failure = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
  if (failure) throw failure.reason;
  return output;
}
export async function collectArticleInventory(): Promise<ArticleInventory> {
  const deadline = Date.now() + 60_000;
  const withinBudget = () => { if (Date.now() > deadline) throw new Error('Archive refresh exceeded time budget'); };
  const totals: Record<string, number> = {};
  const collections = await mapConcurrent([...articleCountries], 3, async (country) => {
    withinBudget();
    const first = await batch(country, 1);
    totals[country] = first.total;
    const pages = Math.ceil(first.total / LIMIT);
    if (pages > 1000) throw new Error('Inventory exceeds bounded crawler limit');
    const records = [...first.result];
    for (let page = 2; page <= pages; page++) {
      withinBudget();
      const next = await batch(country, page);
      if (next.total !== first.total) throw new Error('Archive changed during enumeration');
      records.push(...next.result);
    }
    if (records.length !== first.total || records.some((record) => typeof record?._id !== 'string') || new Set(records.map((record) => record._id)).size !== first.total) throw new Error(`Incomplete/duplicate inventory: ${country}`);
    // Catch offset drift while enumerating a changing multi-page collection.
    if (pages > 1) {
      const check = await batch(country, 1);
      if (check.total !== first.total || check.result.map((item) => item._id).join(',') !== first.result.map((item) => item._id).join(',')) throw new Error('Archive changed during enumeration');
    }
    return records.map((record) => ({ ...record, country }));
  });
  let excluded = 0;
  const checked = await mapConcurrent(collections.flat(), 4, async (record) => {
    withinBudget();
    const url = canonicalArticleUrl(record.articleUrl, record.country);
    if (!url) { excluded++; return undefined; }
    const slug = new URL(url).pathname.split('/').pop()!;
    // Use the same existence contract as the actual article routes. A service
    // failure aborts the whole refresh; it is never interpreted as a deletion.
    const post = await getPostData({ country: record.country, pageLink: slug });
    if (!post) { excluded++; return undefined; }
    if (post._id !== record._id) throw new Error('Article lookup/inventory identity mismatch');
    if (canonicalArticleUrl(post.articleUrl, record.country) !== url) { excluded++; return undefined; }
    const changed = post.changeDate || post.publicationDate;
    const date = changed && Number.isFinite(Date.parse(changed)) ? new Date(changed).toISOString() : undefined;
    return { url, ...(date ? { lastModified: date } : {}) };
  });
  const entries = Array.from(new Map(checked.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)).map((entry) => [entry.url, entry])).values());
  excluded += checked.filter(Boolean).length - entries.length;
  entries.sort((a, b) => a.url.localeCompare(b.url));
  return { entries, totals, excluded };
}
