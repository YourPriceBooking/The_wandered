import 'server-only';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { ArticleDataError, getPostData } from './getPostData';

// Primitive keys let metadata and the page share one lookup in this request.
const lookupArticle = cache(async (country: string, pageLink: string) => {
  try {
    return { post: await getPostData({ country, pageLink }), error: null };
  } catch (error) {
    if (error instanceof ArticleDataError) return { post: null, error };
    throw error;
  }
});

export async function getArticle(country: string, pageLink: string) {
  const result = await lookupArticle(country, pageLink);
  if (result.error) throw result.error;
  return result.post;
}

// The page decides HTTP status. A metadata failure must not bypass the route's error UI.
export async function getArticleForMetadata(country: string, pageLink: string) {
  try {
    return await getArticle(country, pageLink);
  } catch (error) {
    if (error instanceof ArticleDataError) return undefined;
    throw error;
  }
}

export async function requireArticle(country: string, pageLink: string) {
  const post = await getArticle(country, pageLink);
  if (post === null) notFound();
  return post;
}
