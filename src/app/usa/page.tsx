import React from 'react';
import { Metadata } from 'next';
import s from '../mainPage.module.scss';
import TopSection from '@/components/TopSection/TopSection';
import Article from '@/components/Article/Article';
import { postData, postsDataType } from '@/types/postTypes';
import { getPosts } from '@/services/getPosts';
import Link from 'next/link';
import { normalizeImageUrl, getImageUrl } from '@/utils/normalizeImageUrl';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: 'The Wandered: Explore the USA – Travel Tips, Destinations & Hacks for U.S. Travelers',
		description:
			"Discover the best travel destinations, tips, and hacks for exploring the USA and beyond with 'The Wandered.' Whether you're planning a road trip across the states or looking for budget-friendly travel options, we have got you covered. Explore must-see spots, hidden gems, and expert advice tailored for U.S. residents and travelers from around the world.",
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
	const country = 'usa';

	let paramsPage = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;

	const data: postsDataType = await getPosts({ page: paramsPage, country });
	const length = Math.ceil(data.total / 7);

	return (
		<main className={s.main}>
			<TopSection country={country}  
				countryTitle='USA'
				countryDescription='Road trips — national parks, cities, and practical travel notes '
				viewPath={`/${country}${paramsPage > 1 ? `?page=${paramsPage}` : ''}`}/>
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
									href={`/usa/?page=${index + 1}`}
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
