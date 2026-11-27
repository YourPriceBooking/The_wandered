import { cache } from 'react';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { getListingPosts } from '@/services/getListingPosts';
import { ARTICLE_PAGE_SIZE, pageExists, pagePath, paginationState, type PageQuery } from '@/utils/pagination';

const listing = cache((country: string, page: number) => getListingPosts({ country, page }));
// Last published page in each multi-page archive before the switch from seven cards.
// A temporary redirect lets these numbers become real 27-card pages as an archive grows.
const legacyLastPage: Record<string, number> = { home: 9, ukraine: 6, poland: 4, usa: 3, canada: 2 };

function checkArchivePage(country: string, path: string, page: number, total: number) {
  if (pageExists(page, total, ARTICLE_PAGE_SIZE)) return;
  const oldOffset = (page - 1) * 7;
  if (page <= (legacyLastPage[country] ?? 1) && oldOffset < total) {
    redirect(pagePath(path, Math.floor(oldOffset / ARTICLE_PAGE_SIZE) + 1));
  }
  notFound();
}

export async function getListingPage(country: string, path: string, query: PageQuery) {
  const state = paginationState(path, query);
  if (state.redirect) permanentRedirect(state.redirect);
  const first = await listing(country, 1);
  checkArchivePage(country, path, state.page, first.total);
  const data = state.page === 1 ? first : await listing(country, state.page);
  checkArchivePage(country, path, state.page, data.total);
  if (data.result.length !== Math.min(ARTICLE_PAGE_SIZE, Math.max(0, data.total - (state.page - 1) * ARTICLE_PAGE_SIZE))) throw new Error('Article archive changed or returned an incomplete page');
  return { ...data, page: state.page };
}
