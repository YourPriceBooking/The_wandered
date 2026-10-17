import { Suspense } from 'react';
import Image from 'next/image';
import DateBlock from './dateblock/DateBlock';
import ViewCounter from '../ViewCounter/ViewCounter';
import SearchField from '../Header/SearchField/SearchField';
import s from './TopSection.module.scss';
import { getSearchCopy } from '@/defaultData/searchCopy';

interface TopSectionProps {
  isLink?: boolean;
  isSearchField?: boolean;
  isWhite?: boolean;
  country?: string;
  isNarrow?: boolean;
  viewPath?: string;
  countryTitle?: string;
  countryDescription?: string;
}

export default function TopSection({ isWhite = false, country, viewPath, countryTitle = 'some country', countryDescription = 'country description' }: TopSectionProps) {
  const copy = getSearchCopy(country);
  return (
    <section className={s.topSection} lang={copy.lang}>
      <div className={s.date}><DateBlock isWhite={isWhite} country={country} /></div>
      <div className={s.nameBlock}>
        <div className={s.logoBlock}>
          <Image src="/brandMarkTop.svg" alt="" width={18} height={18} />
          <p className={s.topTitle}>the wandered</p>
        </div>
        {country && <ViewCounter country={country} viewPath={viewPath} prefix={copy.viewsPrefix} />}
      </div>
      <div className={s.heroContent}>
        <div className={s.copy}>
          <span className={s.sectionLabel}>{copy.section}</span>
          <h1 className={s.mainTitle}>{countryTitle}</h1>
          <p className={s.mainText}>{countryDescription}</p>
        </div>
        <div className={s.search}>
          <p className={s.searchLabel}>{copy.prompt}</p>
          <Suspense fallback={<div className={s.searchFallback} />}><SearchField variant="hero" /></Suspense>
        </div>
      </div>
      <div className={s.countryLine} aria-hidden="true">
        <svg viewBox="0 0 1000 22" preserveAspectRatio="none" fill="none">
          <path d="M1 11C171 -1 323 25 493 11C663 -3 815 -1 989 11" stroke="white" strokeOpacity="0.35" strokeWidth="2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className={s.lineEnd} />
      </div>
      <div className={s.bottom} aria-hidden="true" />
    </section>
  );
}
