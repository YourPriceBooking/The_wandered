import React from 'react';
import { Metadata } from 'next';
import s from '../mainPage.module.scss';
import TopSection from '@/Components/TopSection/TopSection';
import Article from '@/Components/Article/Article';
import { postData, postsDataType } from '@/types/postTypes';
import { getAllPosts } from '@/services/getPosts';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: 'The Wandered: Your Journey to Discovery',
		description:
			'Embark on a journey of wanderlust with The Wandered, the official Your Price Booking blog. Explore travel tales, tips, and exclusive insights into breathtaking destinations. Let us be your guide to seamless adventures and unforgettable moments. Your Price Booking - Your Passport to a World of Exploration.',
		icons: {
			icon: '../favicon.ico',
			shortcut: '../favicon.ico',
		},
	};
}

async function page() {
	const country = 'usa';
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
