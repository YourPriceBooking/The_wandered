'use client';

import { useAppSelector } from '@/lib/hooks';
import s from './ViewCounter.module.scss';
type Props = { country?: string; viewPath?: string; prefix?: string; className?: string };

const hints = {
  ukraine: { lang: 'uk', text: 'Перегляди розділу та його статей' },
  poland: { lang: 'pl', text: 'Wyświetlenia sekcji i jej artykułów' },
  home: { lang: 'en', text: 'Views of the homepage and its articles' },
  other: { lang: 'en', text: 'Views of this section and its articles' },
};
export default function ViewCounter({ country }: Props) {
  const section = (country || 'home').replace(/^\/+|\/+$/g, '') || 'home';
  const views = useAppSelector(state => state.gaData.sectionTotals[section] ?? 0);
  const hint = hints[section as keyof typeof hints] || hints.other;
  return (
    <div className={s.countWrapper} title={hint.text} lang={hint.lang} aria-label={`${hint.text}: ${views}`}>
      <p>{views}</p>
      <img className={s.eye} src="/colorEye.svg" alt="" />
      <div className={s.lightVeil} />
    </div>
  );
}
