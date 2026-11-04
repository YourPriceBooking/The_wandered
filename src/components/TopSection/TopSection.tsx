import DateBlock from './dateblock/DateBlock';
import ViewCounter from '../ViewCounter/ViewCounter';
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

export default function TopSection({
  country,
  viewPath,
  countryTitle = 'Travel stories',
  countryDescription = '',
}: TopSectionProps) {
  const copy = getSearchCopy(country);
  const home = country === 'home';
  return (
    <section className={s.topSection} lang={copy.lang}>
      <div className={s.sectionLabel}>{home ? 'Explore · Discover · Wander' : copy.section}</div>
      <h1 className={s.mainTitle}>{home ? 'Stories for the curious' : countryTitle.trim()}</h1>
      <p className={s.mainText}>
        {home ? 'Places, people and journeys worth discovering.' : countryDescription.trim()}
      </p>
      <div className={s.meta}>
        <div className={s.date}>
          <DateBlock country={country} />
        </div>
        {country && <ViewCounter country={country} viewPath={viewPath} prefix={copy.viewsPrefix} />}
      </div>
    </section>
  );
}
