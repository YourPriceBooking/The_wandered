import { getListingPage } from '@/services/getListingPage';
import Pagination from '@/components/Pagination/Pagination';
import { listingMetadata } from '@/utils/seoMetadata';
import React from 'react';
import { Metadata } from 'next';
import s from '../mainPage.module.scss';
import TopSection from '@/components/TopSection/TopSection';
import { postData } from '@/types/postTypes';
import Article from '@/components/Article/Article';
import Link from 'next/link';
import { normalizeImageUrl, getImageUrl } from '@/utils/normalizeImageUrl';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';

export function generateMetadata({ searchParams }: { searchParams: { page?: string | string[] } }): Metadata {
  return listingMetadata('poland', searchParams.page);
}

async function page({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const country = 'poland';



	const data = await getListingPage('poland', '/poland', searchParams);
  const paramsPage = data.page;
	const length = Math.ceil(data.total / 7);

	return (
		<main className={s.main}>
			<TopSection
				country={country}
				countryTitle='Polska'
				countryDescription='Podróże po Polsce — miejsca, trasy, porady '
				viewPath={`/${country}${paramsPage > 1 ? `?page=${paramsPage}` : ''}`}
				/>
			<div className={s.contentSection}>
				{data.result.length > 0 ? (
					data.result.map((article: postData) => {
						const normalizedImages = normalizeImageUrl(article.imageUrl as any);
						const imageSrc = getImageUrl(normalizedImages, 0) || '';
						return (
							<Article
                articleUrl={article.articleUrl}
								key={article._id}
								slug={country + '/' + article?.articleUrl?.split('/').pop()}
								title={article.title}
								country={country}
								imageSrc={imageSrc}
								author={article.author}
								date={article.publicationDate}
								updated={''}
								description={article.description}
								id={article._id}
								heading={article.heading}
							></Article>
						);
					})
				) : (
					<div className={s.temporary}></div>
				)}
				<div className={s.paginationText}>
					<img src="/green-home.png" alt="pagination text icon" />
					<p>the waaandered</p>
				</div>
				<Pagination path="/poland" page={paramsPage} totalPages={length} language="pl" />
				<div className={s.navSection}>
					<ul className={s.navNumbers}>
						{Array.from({ length }, (_, index) => (
							<li key={index}>
								<Link
									href={index === 0 ? "/poland" : `/poland?page=${index + 1}`}
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

export default page;
