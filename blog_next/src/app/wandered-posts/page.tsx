'use client';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import s from './wandered-posts.module.scss';
import React, { useEffect, useState } from 'react';
import { articleData } from '@/defaultData/articleData';
import Article from '@/Components/Article/Article';

const Page = () => {
	const searchParams = useSearchParams().get('search');
	const [postsData, setPostsData] = useState<any[]>(articleData);
	useEffect(() => {
		setPostsData(articleData);
		console.log('upd');
	}, [searchParams]);

	return (
		<div className={s.mainContainer}>
			<p
				style={{
					width: '75%',
					textAlign: 'center',
				}}
			>
				Posts: {searchParams}
			</p>
			{postsData.map((article) => {
				return (
					<Article
						key={article.id}
						slug={article.slug}
						title={article.title}
						imageSrc={article.imageSrc}
						author={article.author}
						date={article.date}
						updated={article.updated}
					></Article>
				);
			})}
		</div>
	);
};

export default Page;
