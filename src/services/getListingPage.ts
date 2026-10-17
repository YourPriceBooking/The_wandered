import { cache } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { getPosts } from '@/services/getPosts';
import { ARTICLE_PAGE_SIZE, pageExists, paginationState, type PageQuery } from '@/utils/pagination';

const listing = cache((country: string, page: number) => getPosts({ country, page }));
export async function getListingPage(country: string, path: string, query: PageQuery) {
  const state = paginationState(path, query);
  if (state.redirect) permanentRedirect(state.redirect);
  const first = await listing(country, 1);
  if (!pageExists(state.page, first.total, ARTICLE_PAGE_SIZE)) notFound();
  const data = state.page === 1 ? first : await listing(country, state.page);
  if (!pageExists(state.page, data.total, ARTICLE_PAGE_SIZE)) notFound();
  if (data.result.length !== Math.min(ARTICLE_PAGE_SIZE, Math.max(0, data.total - (state.page - 1) * ARTICLE_PAGE_SIZE))) throw new Error('Article archive changed or returned an incomplete page');
  return { ...data, page: state.page };
}
