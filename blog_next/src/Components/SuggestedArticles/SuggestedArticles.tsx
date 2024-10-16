'use client';
import s from './SuggestedArticles.module.scss';
import Article from '../Article/Article';
import React from 'react';
import { postData } from '@/types/postTypes';

function SuggestedArticles({ suggestedArticles }: any) {
	const isMobile = window.innerWidth <= 462 ? true : false;

	function truncateString(str: string) {
		const maxLength = isMobile ? 30 : 45;

		if (str.length <= maxLength) {
			return str;
		}

		const words = str.split(' ');
		let truncatedStr = '';

		for (let i = 0; i < words.length; i++) {
			if ((truncatedStr + words[i]).length + 3 > maxLength) {
				break;
			}

			truncatedStr += (truncatedStr ? ' ' : '') + words[i];
		}

		return truncatedStr.length > 15 && truncatedStr.length < maxLength
			? truncatedStr + '...'
			: str;
	}

	return (
		<div className={s.suggestedArticlesWrapper}>
			{suggestedArticles.map((article: postData) => {
				const fullSlug =
					article.country === 'home'
						? article.articleUrl.split('/').pop()
						: `${article.country}/${article.articleUrl.split('/').pop()}`;

				return (
					<Article
						key={article._id}
						slug={fullSlug}
						title={article.title}
						imageSrc={article.imageUrl[0]}
						country={article.country}
						author={article.author}
						date={article.publicationDate}
						updated={''}
						description={article.description}
						id={article._id}
						heading={truncateString(article.heading)}
						isSuggested={true}
					></Article>
				);
			})}
		</div>
	);
}

export default SuggestedArticles;
