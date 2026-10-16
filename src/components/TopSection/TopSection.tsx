import { Suspense } from 'react';
import Image from 'next/image';
import DateBlock from './dateblock/DateBlock';
import ViewCounter from '../ViewCounter/ViewCounter';
import SearchField from '../Header/SearchField/SearchField';
import s from './TopSection.module.scss';

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
  return (
    <section className={s.topSection}>
      <div className={s.date}><DateBlock isWhite={isWhite} country={country} /></div>
      <div className={s.nameBlock}>
        <div className={s.logoBlock}>
          <Image src="/brandMarkTop.svg" alt="" width={18} height={18} />
          <h2 className={s.topTitle}>the wandered</h2>
        </div>
        {country && <ViewCounter country={country} viewPath={viewPath} prefix="we have " />}
      </div>
      <div className={s.heroContent}>
        <div className={s.copy}>
          <span className={s.sectionLabel}>section</span>
          <h1 className={s.mainTitle}>{countryTitle}</h1>
          <p className={s.mainText}>{countryDescription}</p>
        </div>
        <div className={s.search}>
          <p className={s.searchLabel}>Where will your curiosity take you?</p>
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
