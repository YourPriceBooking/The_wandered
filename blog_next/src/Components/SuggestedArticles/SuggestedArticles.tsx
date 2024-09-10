import Article from '../Article/Article';
import s from './SuggestedArticles.module.scss';
import React from 'react';

function SuggestedArticles({ suggestedArticles }: any) {
	const [article1, article2] = suggestedArticles;

	function truncateString(str: string) {
		if (str.length <= 55) {
			return str;
		}

		const words = str.split(' ');
		let truncatedStr = '';

		for (let i = 0; i < words.length; i++) {
			if ((truncatedStr + words[i]).length + 3 > 55) {
				break;
			}

			truncatedStr += (truncatedStr ? ' ' : '') + words[i];
		}

		if (truncatedStr.length > 35 && truncatedStr.length < 55) {
			return truncatedStr + '...';
		} else {
			return str;
		}
	}

	return (
		<div className={s.suggestedArticlesWrapper}>
			<Article
				key={article1._id}
				slug={article1?.articleUrl?.split('/').pop()}
				title={article1.title}
				imageSrc={article1.imageUrl[0]}
				author={article1.author}
				date={article1.publicationDate}
				updated={''}
				description={article1.description}
				id={article1._id}
				heading={truncateString(article1.heading)}
				isSuggested={true}
			/>
			<Article
				key={article2._id}
				slug={article2?.articleUrl?.split('/').pop()}
				title={article2.title}
				imageSrc={article2.imageUrl[0]}
				author={article2.author}
				date={article2.publicationDate}
				updated={''}
				description={article2.description}
				id={article2._id}
				heading={truncateString(article2.heading)}
				isSuggested={true}
			/>
		</div>
	);
}

export default SuggestedArticles;
