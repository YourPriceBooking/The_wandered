import React from 'react';
import { Metadata } from 'next';
import s from '../mainPage.module.scss';
import TopSection from '@/components/TopSection/TopSection';
import { postData, postsDataType } from '@/types/postTypes';
import { getPosts } from '@/services/getPosts';
import Article from '@/components/Article/Article';
import Link from 'next/link';
import { normalizeImageUrl, getImageUrl } from '@/utils/normalizeImageUrl';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: 'Travel Singapore | Hidden Gems, Culture & Booking Tips – The Wandered',
		description:
			'Explore Singapore like never before. Find hidden gems, cultural highlights, and practical booking tips with The Wandered – your guide to authentic travel.',
		icons: {
			icon: '../favicon.ico',
			shortcut: '../favicon.ico',
		},
	};
}

async function page({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const country = 'singapore';

	let paramsPage = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;

	const data: postsDataType = await getPosts({ page: paramsPage, country });
	const length = Math.ceil(data.total / 7);

	return (
		<main className={s.main}>
			<TopSection
				country={country}
				countryTitle='Singapore '
				countryDescription='Food, city walks & hidden corners — practical travel notes '
				viewPath={`/${country}${paramsPage > 1 ? `?page=${paramsPage}` : ''}`}
				/>
			<div className={s.contentSection}>
				{data.result.length > 0 ? (
					data.result.map((article: postData) => {
						const normalizedImages = normalizeImageUrl(article.imageUrl as any);
						const imageSrc = getImageUrl(normalizedImages, 0) || '';
						return (
							<Article
								key={article._id}
								slug={country + '/' + article?.articleUrl?.split('/').pop()}
								title={article.title}
								country={article.country}
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
				<div className={s.navSection}>
					<ul className={s.navNumbers}>
						{Array.from({ length }, (_, index) => (
							<li key={index}>
								<Link
									href={`/singapore/?page=${index + 1}`}
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
