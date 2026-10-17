import { journalPage } from '@/utils/journalSeo';
export const ARTICLE_PAGE_SIZE = 7;
export const JOURNAL_PAGE_SIZE = 10;
export type PageQuery = Record<string, string | string[] | undefined>;
export function pagePath(path: string, page: number): string {
  return `${path}${page > 1 ? `?page=${page}` : ''}`;
}
export function paginationState(path: string, query: PageQuery, gameZone = false) {
  const page = journalPage(query.page);
  const target = gameZone && query.page === 'game-zone' ? `${path}#game-zone` : pagePath(path, page);
  const keys = Object.keys(query).filter((key) => query[key] !== undefined);
  const normalized = keys.length === 0 || (keys.length === 1 && keys[0] === 'page' && page > 1 && query.page === String(page));
  return { page, redirect: normalized ? undefined : target };
}
export function pageExists(page: number, total: number, size: number): boolean {
  return page === 1 || page <= Math.ceil(total / size);
}
