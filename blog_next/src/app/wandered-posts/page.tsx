'use client';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import s from './wandered-posts.module.scss';
import React, { useEffect, useState } from 'react';
import { articleData } from '@/defaultData/articleData';
import Article from '@/Components/Article/Article';
import { getPostsBySearch } from '@/services/getPosts';
import { postData, postsDataType } from '@/types/postTypes';
import Loading from '../loading';


const Page = () => {
	const searchParams = useSearchParams().get('search');
	const [postsData, setPostsData] = useState<postData[] | []>([]);
	useEffect(() => {
		(async () => {
			const posts = await getPostsBySearch({
				search: searchParams || '',
			});
			setPostsData(posts);
		})();
	}, [searchParams]);

	if (!postsData)
		return (
			<div
				style={{
					height: '600px',
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<p
					style={{
						fontSize: '24px',
						fontWeight: 'bold',
						textTransform: 'uppercase',
					}}
				>
					Not found
				</p>
			</div>
		);

	return (
		<div className={s.mainContainer}>
			{postsData.map((article) => {
				return (
					<Article
						key={article._id}
						slug={article?.articleUrl?.split('/').pop()}
						title={article.title}
						imageSrc={article.imageUrl[0]}
						author={article.author}
						date={article.publicationDate}
						updated={''}
						description={article.description}
						id={article._id}
					/>
				);
			})}
		</div>
	);
};

export default Page;
