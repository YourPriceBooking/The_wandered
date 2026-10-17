'use client';
import { usePathname } from 'next/navigation';
import { routeStateCopy } from '@/defaultData/routeStateCopy';
import { documentLanguage } from '@/utils/documentLanguage';
import s from './route-state.module.scss';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const language = documentLanguage(usePathname() || '/');
  const copy = routeStateCopy[language];
  return <main className={s.state} lang={language}>
    <h1>{copy.error}</h1>
    <p>{copy.errorText}</p>
    <button onClick={reset}>{copy.retry}</button>
    <a href={copy.homePath}>{copy.home}</a>
  </main>;
}
