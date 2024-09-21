import React from 'react';
import { Metadata } from 'next';
import s from '../mainPage.module.scss';
import TopSection from '@/Components/TopSection/TopSection';
import { postData, postsDataType } from '@/types/postTypes';
import {  getPosts } from '@/services/getPosts';
import Article from '@/Components/Article/Article';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: 'Podróże po Polsce: odkrywanie kultury, historii i natury',
		description:
			'Odkryj najpiękniejsze miejsca w Polsce – od malowniczych miasteczek po tętniące życiem metropolie. Poznaj bogatą kulturę, zabytki historyczne i wspaniałe krajobrazy, które czekają na odkrycie.',
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
	const country = 'poland';

	let paramsPage = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;

	const data: postsDataType = await getPosts({ page: paramsPage, country });

	return (
		<main className={s.main}>
			<TopSection country={country} />
			<div className={s.contentSection}>
				{data.result.length > 0 ? (
					data.result.map((article: postData) => {
						return (
							<Article
								key={article._id}
								slug={country + '/' + article?.articleUrl?.split('/').pop()}
								title={article.title}
								country={article.country}
								imageSrc={article.imageUrl[0]}
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
			</div>
		</main>
	);
}

export default page;
