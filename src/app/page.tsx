import StructuredData from '@/components/StructuredData/StructuredData';
import { websiteStructuredData } from '@/utils/structuredData';
import { getListingPage } from '@/services/getListingPage';
import Pagination from '@/components/Pagination/Pagination';
import { listingMetadata } from '@/utils/seoMetadata';
import s from './mainPage.module.scss';
import Article from '@/components/Article/Article';
import Link from 'next/link';
import TopSection from '@/components/TopSection/TopSection';
import { postData } from '@/types/postTypes';
import { normalizeImageUrl, getImageUrl } from '@/utils/normalizeImageUrl';
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
  const paramsPage = data.page;

  const featured = paramsPage === 1 ? data.result[0] : undefined;
  const feed = featured ? data.result.slice(1) : data.result;
  const length = Math.ceil(data.total / 7);

  return (
    <main className={s.main}>
      <StructuredData value={websiteStructuredData()} />
      <TopSection
        country="home"
        countryTitle="the wandered "
        countryDescription="Stories inspiration for modern travelers "
        viewPath={paramsPage > 1 ? `/?page=${paramsPage}` : `/`}
      />
      <div className={s.homeLayout}>
        {featured && (
          <Article
            featured
            priority
            articleUrl={featured.articleUrl}
            slug={featured.articleUrl?.split('/').pop()}
            title={featured.title}
            imageSrc={getImageUrl(normalizeImageUrl(featured.imageUrl), 0) || ''}
            country={featured.country}
            author={featured.author}
            date={featured.publicationDate}
            updated=""
            description={featured.description}
            id={featured._id}
            heading={featured.heading}
          />
        )}
        <div className={s.homeColumns}>
          <section className={s.homeFeed} aria-labelledby="latest-stories">
            <h2 id="latest-stories" className={s.feedHeading}>
              More travel stories
            </h2>
            <div className={s.contentSection}>
              {feed.map((article: postData, index: number) => {
                const normalizedImages = normalizeImageUrl(article.imageUrl as any);
                const imageSrc = getImageUrl(normalizedImages, 0) || '';
                return (
                  <Article
                    priority={!featured && index === 0}
                    articleUrl={article.articleUrl}
                    key={article._id}
                    slug={article?.articleUrl?.split('/').pop()}
                    title={article.title}
                    imageSrc={imageSrc}
                    country={article.country}
                    author={article.author}
                    date={article.publicationDate}
                    updated={''}
                    description={article.description}
                    id={article._id}
                    heading={article.heading}
                  ></Article>
                );
              })}
              <div className={s.paginationText}>
                <img src="/green-home.png" alt="pagination text icon" />
                <p>the waaandered</p>
              </div>

              <Pagination path="/" page={paramsPage} totalPages={length} language="en" />
              <div className={s.navSection}>
                <ul className={s.navNumbers}>
                  {Array.from({ length }, (_, index) => (
                    <li key={index}>
                      <Link
                        href={index === 0 ? '/' : `/?page=${index + 1}`}
                        className={`${paramsPage === index + 1 ? s.activePage : s.pageNumber}`}
                      >
                        {index + 1}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
