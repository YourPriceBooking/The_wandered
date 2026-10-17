import { listingMetadata, listingPage } from '@/utils/seoMetadata';
import s from './mainPage.module.scss';
import Article from '@/components/Article/Article';
import Link from 'next/link';
import TopSection from '@/components/TopSection/TopSection';
import { getPosts } from '@/services/getPosts';
import { postData, postsDataType } from '@/types/postTypes';
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
  let paramsPage = listingPage(searchParams.page);

  const data: postsDataType = await getPosts({ page: paramsPage, country: 'home' });
  console.log({ data });

  const length = Math.ceil(data.total / 7);

  return (
    <main className={s.main}>
      <TopSection
        country="home"
        countryTitle="the wandered "
        countryDescription="Stories inspiration for modern travelers "
        viewPath={paramsPage > 1 ? `/?page=${paramsPage}` : `/`}
      />
      <div className={s.contentSection}>
        {data.result.map((article: postData) => {
          const normalizedImages = normalizeImageUrl(article.imageUrl as any);
          const imageSrc = getImageUrl(normalizedImages, 0) || '';
          return (
            <Article
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

        <div className={s.navSection}>
          <ul className={s.navNumbers}>
            {Array.from({ length }, (_, index) => (
              <li key={index}>
                <Link
                  href={`/?page=${index + 1}`}
                  className={`${paramsPage === index + 1 ? s.activePage : s.pageNumber}`}
                >
                  {index + 1}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ScrollToTop />
    </main>
  );
}
