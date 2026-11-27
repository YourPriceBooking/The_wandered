import type { Metadata } from 'next';
import AlterTopSection from '@/components/AlterTopSection/AlterTopSection';
import ArchiveFeed from '@/components/ArchiveFeed/ArchiveFeed';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';
import { getListingPage } from '@/services/getListingPage';
import { pagePath, type PageQuery } from '@/utils/pagination';
import { listingMetadata } from '@/utils/seoMetadata';
import s from '../mainPage.module.scss';

const section = 'uncharted-planet';
const path = `/${section}`;

export function generateMetadata({ searchParams }: { searchParams: PageQuery }): Metadata {
  return listingMetadata(section, searchParams.page);
}

export default async function Page({ searchParams }: { searchParams: PageQuery }) {
  const data = await getListingPage(section, path, searchParams);
  const archivePath = pagePath(path, data.page);
  return (
    <main className={s.main}>
      <AlterTopSection
        country={section}
        viewPath={archivePath}
      />
      <ArchiveFeed key={archivePath} section={section} initial={data} className={s.contentSection} />
      <ScrollToTop />
    </main>
  );
}
