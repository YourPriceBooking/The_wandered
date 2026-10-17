import type { postsDataType } from '@/types/postTypes';
import { ARTICLE_PAGE_SIZE } from '@/utils/pagination';
import { apiUrl } from '@/utils/url';

const countries = new Set(['home', 'ukraine', 'poland', 'usa', 'canada', 'australia', 'singapore', 'uncharted-planet']);

// A small, process-local cache of validated public card data. Never stores article bodies,
// missing lookups, errors or stale entries; each Node worker has its own bounded cache.
export function createArticleListService({
  fetcher = fetch, now = Date.now, ttlMs = 30_000, maxEntries = 64, maxBytes = 4 * 1024 * 1024,
}: { fetcher?: typeof fetch; now?: () => number; ttlMs?: number; maxEntries?: number; maxBytes?: number } = {}) {
  const entries = new Map<string, { data: postsDataType; expires: number; bytes: number }>();
  const inFlight = new Map<string, Promise<postsDataType>>();
  let bytes = 0;
  function remove(key: string) {
    bytes -= entries.get(key)?.bytes || 0;
    entries.delete(key);
  }
  return async function getListingPosts({ page, country }: { page: number; country: string }): Promise<postsDataType> {
    if (!countries.has(country) || !Number.isSafeInteger(page) || page < 1) throw new Error('Invalid article list query');
    const key = `${country}:${page}`;
    for (const [oldKey, entry] of Array.from(entries)) if (entry.expires <= now()) remove(oldKey);
    const hit = entries.get(key);
    if (hit) { entries.delete(key); entries.set(key, hit); return hit.data; }
    const pending = inFlight.get(key);
    if (pending) return pending;
    const request = (async () => {
      try {
        const endpoint = new URL('api/post/get-all', apiUrl);
        endpoint.search = new URLSearchParams({ page: String(page), limit: String(ARTICLE_PAGE_SIZE), typeOfPage: country }).toString();
        const response = await fetcher(endpoint, { cache: 'no-store', headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10_000) });
        if (!response.ok) throw new Error('Upstream failure');
        const payload = await response.json();
        if (!Array.isArray(payload?.result) || !Number.isSafeInteger(payload.total) || payload.total < 0 ||
            payload.result.length !== Math.min(ARTICLE_PAGE_SIZE, Math.max(0, payload.total - (page - 1) * ARTICLE_PAGE_SIZE))) throw new Error('Incomplete article list');
        const data: postsDataType = { total: payload.total, result: payload.result.map((post: Record<string, unknown>) => {
          if (!post || typeof post._id !== 'string' || typeof post.heading !== 'string' || !post.heading.trim() || typeof post.articleUrl !== 'string') throw new Error('Invalid article card');
          return {
            _id: post._id, heading: post.heading, articleUrl: post.articleUrl,
            title: typeof post.title === 'string' ? post.title : post.heading,
            country: typeof post.country === 'string' ? post.country : country, author: typeof post.author === 'string' ? post.author : '',
            description: typeof post.description === 'string' ? post.description : '',
            publicationDate: typeof post.publicationDate === 'string' ? post.publicationDate : '',
            changeDate: typeof post.changeDate === 'string' ? post.changeDate : '',
            imageUrl: Array.isArray(post.imageUrl) ? post.imageUrl : [],
            slug: typeof post.slug === 'string' ? post.slug : '', markup: '',
          };
        }) };
        const size = Buffer.byteLength(JSON.stringify(data));
        if (size <= maxBytes && maxEntries > 0 && ttlMs > 0) {
          while (entries.size >= maxEntries || bytes + size > maxBytes) remove(entries.keys().next().value!);
          entries.set(key, { data, bytes: size, expires: now() + ttlMs }); bytes += size;
        }
        return data;
      } catch {
        throw new Error('Article list is temporarily unavailable');
      } finally { inFlight.delete(key); }
    })();
    inFlight.set(key, request);
    return request;
  };
}
