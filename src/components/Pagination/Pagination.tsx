import { pagePath } from '@/utils/pagination';
import s from './Pagination.module.scss';

export default function Pagination({ path, page, totalPages, language = 'en' }: {
  path: string; page: number; totalPages: number; language?: 'en' | 'uk' | 'pl';
}) {
  if (totalPages <= 1) return null;
  const copy = {
    en: { label: 'Pagination', first: 'First page', previous: 'Previous page', next: 'Next page', page: 'Page', of: 'of' },
    uk: { label: 'Сторінки', first: 'Перша сторінка', previous: 'Попередня сторінка', next: 'Наступна сторінка', page: 'Сторінка', of: 'з' },
    pl: { label: 'Paginacja', first: 'Pierwsza strona', previous: 'Poprzednia strona', next: 'Następna strona', page: 'Strona', of: 'z' },
  }[language];
  return <nav className={s.pagination} aria-label={copy.label}>
    {page > 1 && <a href={path}>{copy.first}</a>}
    {page > 1 && <a href={pagePath(path, page - 1)} rel="prev">← {copy.previous}</a>}
    <span aria-current="page">{copy.page} {page} {copy.of} {totalPages}</span>
    {page < totalPages && <a href={pagePath(path, page + 1)} rel="next">{copy.next} →</a>}
  </nav>;
}
