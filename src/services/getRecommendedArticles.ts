import { cache } from 'react';
import { getSuggestedArticles } from '@/services/getSuggestedArticles';
import { canonicalArticleUrl, siteUrl } from '@/utils/articleUrl';
import type { postData } from '@/types/postTypes';

const candidates = cache(async (country: string): Promise<postData[]> => {
  try {
    const endpoint = new URL('/blog/api/post/get-all', siteUrl);
    endpoint.search = new URLSearchParams({ typeOfPage: country, page: '1', limit: '7' }).toString();
    const response = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
    if (!response.ok) return [];
    const payload = await response.json();
    if (!Array.isArray(payload?.result)) return [];
    return payload.result.filter((post: postData) => post && typeof post._id === 'string' && typeof post.heading === 'string' && typeof post.title === 'string' && canonicalArticleUrl(post.articleUrl, country)).slice(0, 7).map((post: postData) => ({
      ...post, country, author: typeof post.author === 'string' ? post.author : '',
      description: typeof post.description === 'string' ? post.description : '',
      publicationDate: typeof post.publicationDate === 'string' ? post.publicationDate : '',
      imageUrl: Array.isArray(post.imageUrl) ? post.imageUrl : [],
    }));
  } catch { return []; } // Optional recommendations must not turn a readable article into a 500.
});
export async function getRecommendedArticles(id: string, country: string) {
  return getSuggestedArticles({ _id: id }, await candidates(country));
}
