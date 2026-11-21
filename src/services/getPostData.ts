import { articleDate } from '@/utils/articleDate';
import { apiUrl } from '@/utils/url';
import type { postData } from '@/types/postTypes';

// These edits were verified against the editor save and corresponding public API
// record. Do not use updatedAt for other posts: it also changes on bulk DB writes.
const verifiedEditorialEdits = new Map([
  ['https://www.thewandered.com/ukraine/etias-oboviazkovyi-dlia-hromadian-yaki-khochut-vidvidaty-krainy-yes-bez-vizy', '2026-11-21T12:36:47.996Z'],
  ['https://www.thewandered.com/poland/jak-wystawić-wizę-do-wietnamu-dla-obywateli-rp', '2026-11-21T12:39:02.206Z'],
]);

export class ArticleDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArticleDataError';
  }
}

export async function getPostData({ pageLink, country }: { pageLink: string; country: string }): Promise<postData | null> {
  // Next can pass an encoded segment. The API stores the decoded public URL.
  let slug = pageLink;
  try { slug = decodeURIComponent(pageLink); } catch { /* Keep literal percent signs. */ }
  const path = !country || country === 'home' ? slug : `${country}/${slug}`;
  const articleUrl = `https://www.thewandered.com/${path}`;
  const endpoint = new URL('api/post/get-by-url', apiUrl);
  endpoint.searchParams.set('articleUrl', articleUrl);

  // Request-local deduplication lives in getArticle; errors/missing records are not persisted.
  let response: Response;
  try {
    response = await fetch(endpoint, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new ArticleDataError('Article service is temporarily unavailable');
  }
  if (response.status === 404 || response.status === 410) return null;
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ArticleDataError('Article service returned invalid JSON');
  }
  // This API uses 409 for a missing article. Other conflicts are not a 404.
  if (response.status === 409 && payload?.code === 409 &&
      payload?.message === `posts with url ${articleUrl} don't found in DB`) return null;
  if (!response.ok) throw new ArticleDataError(`Article service returned HTTP ${response.status}`);
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'result') && payload.result === null) return null;
  const post = payload?.result;
  if (!post || typeof post !== 'object' || Array.isArray(post) ||
      typeof post._id !== 'string' || typeof post.heading !== 'string' || !post.heading.trim() ||
      typeof post.markup !== 'string') {
    throw new ArticleDataError('Article service returned an invalid record');
  }
  const recordedChange = typeof post.changeDate === 'string' ? articleDate(post.changeDate) : undefined;
  const verifiedEdit = verifiedEditorialEdits.get(articleUrl);
  const changeDate = verifiedEdit && (!recordedChange || verifiedEdit > recordedChange) ? verifiedEdit : recordedChange;

  return {
    ...post,
    title: typeof post.title === 'string' ? post.title : post.heading,
    author: typeof post.author === 'string' ? post.author : '',
    description: typeof post.description === 'string' ? post.description : '',
    imageUrl: Array.isArray(post.imageUrl) ? post.imageUrl : [],
    publicationDate: typeof post.publicationDate === 'string' ? post.publicationDate : '',
    changeDate: changeDate ?? '',
  };
}
