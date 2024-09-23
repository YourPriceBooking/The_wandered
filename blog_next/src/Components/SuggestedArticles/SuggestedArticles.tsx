'use client';
import s from './SuggestedArticles.module.scss';
import Article from '../Article/Article';
import React, { useEffect, useState } from 'react';
import { postData } from '@/types/postTypes';

function SuggestedArticles({ suggestedArticles }: any) {
	const isMobile = window.innerWidth <= 462 ? true : false;

	function truncateString(str: string) {
		const maxLength = isMobile ? 35 : 55;

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

		return truncatedStr.length > 20 && truncatedStr.length < maxLength
			? truncatedStr + '...'
			: str;
	}

	return (
		<div className={s.suggestedArticlesWrapper}>
			{suggestedArticles.map((article: postData) => {
				return (
					<Article
						key={article._id}
						slug={article.country + '/' + article?.articleUrl?.split('/').pop()}
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
