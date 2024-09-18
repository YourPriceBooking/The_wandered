import React from 'react';
import { Metadata } from 'next';
import s from '../mainPage.module.scss';
import TopSection from '@/Components/TopSection/TopSection';
import { getAllPosts } from '@/services/getPosts';
import { postData, postsDataType } from '@/types/postTypes';
import Article from '@/Components/Article/Article';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: 'Подорожі Україною: від Києва до Карпат',
		description:
			'Відкрийте для себе красу України – від її давніх міст до величних гір Карпат. Дізнайтеся більше про культуру, історію та природні багатства цієї унікальної країни.',
		icons: {
			icon: '../favicon.ico',
			shortcut: '../favicon.ico',
		},
	};
}

async function page() {
	const country = 'ukraine';
	const allData: postsDataType = await getAllPosts();
	const filteredData = allData.result
		.filter((item: postData) => item.country === country)
		.reverse();

	return (
		<main className={s.main}>
			<TopSection country={country} />
			<div className={s.contentSection}>
				{filteredData.length > 0 ? (
					filteredData.map((article: postData) => {
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
