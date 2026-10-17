import type { Breadcrumb } from '@/utils/structuredData';
import s from './Breadcrumbs.module.scss';
export default function Breadcrumbs({ items, language }: { items: Breadcrumb[]; language: 'en' | 'uk' | 'pl' }) {
  return <nav className={s.breadcrumbs} aria-label={language === 'uk' ? 'Навігаційний шлях' : language === 'pl' ? 'Ścieżka nawigacji' : 'Breadcrumbs'}>
    <ol>{items.map((item, index) => <li key={item.url}>
      {index < items.length - 1 ? <a href={item.url}>{item.name}</a> : <span aria-current="page">{item.name}</span>}
    </li>)}</ol>
  </nav>;
}
