import StructuredData from '@/components/StructuredData/StructuredData';
import { websiteStructuredData } from '@/utils/structuredData';
import { getListingPage } from '@/services/getListingPage';
import ArchiveFeed from '@/components/ArchiveFeed/ArchiveFeed';
import { listingMetadata } from '@/utils/seoMetadata';
import { pagePath } from '@/utils/pagination';
import s from './mainPage.module.scss';
import ArchiveCard from '@/components/ArchiveFeed/ArchiveCard';
import Link from 'next/link';
import TopSection from '@/components/TopSection/TopSection';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';

export const dynamic = 'force-dynamic';
export function generateMetadata({ searchParams }: { searchParams: { page?: string | string[] } }) {
  return listingMetadata('home', searchParams.page);
}

export default async function MainPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const data = await getListingPage('home', '/', searchParams);
  const archivePath = pagePath('/', data.page);
  const featured = data.page === 1 ? data.result[0] : undefined;

  return (
    <main className={s.main}>
      <StructuredData value={websiteStructuredData()} />
      <TopSection
        country="home"
        countryTitle="the wandered "
        countryDescription="Stories inspiration for modern travelers "
        viewPath={archivePath}
      />
      <div className={s.homeLayout}>
        {featured && <ArchiveCard post={featured} section="home" featured priority />}
        <div className={s.homeColumns}>
          <section className={s.homeFeed} aria-labelledby="latest-stories">
            <h2 id="latest-stories" className={s.feedHeading}>
              More travel stories
            </h2>
            <ArchiveFeed key={archivePath} section="home" initial={data} className={s.contentSection} />
          </section>
          <aside className={s.sidebar} aria-label="Explore The Wandered">
            <h2 className={s.sidebarTitle}>Where to next?</h2>
            <nav aria-label="Destinations">
              <ul className={s.destinations}>
                {[
                  ['Ukraine', '/ukraine'],
                  ['Poland', '/poland'],
                  ['USA', '/usa'],
                  ['Canada', '/canada'],
                  ['Australia', '/australia'],
                  ['Singapore', '/singapore'],
                  ['Uncharted planet', '/uncharted-planet'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className={s.resourceBlock}>
              <h2 className={s.sidebarTitle}>A little help for your next adventure</h2>
              <p>Explore maps, weather and travel resources as you plan your next journey.</p>
              <Link href="/travel-resources">Explore travel resources →</Link>
            </div>
          </aside>
        </div>
      </div>
      <ScrollToTop />
    </main>
  );
}
