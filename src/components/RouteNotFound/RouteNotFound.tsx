import Link from 'next/link';
import { routeStateCopy } from '@/defaultData/routeStateCopy';
import type { DocumentLanguage } from '@/utils/documentLanguage';
import s from '@/app/route-state.module.scss';

export default function RouteNotFound({ language = 'en' }: { language?: DocumentLanguage }) {
  const copy = routeStateCopy[language];
  return <main className={s.state} lang={language}>
    <p className={s.code}>404</p>
    <h1>{copy.missing}</h1>
    <p>{copy.missingText}</p>
    <Link href={copy.homePath}>{copy.home}</Link>
  </main>;
}
