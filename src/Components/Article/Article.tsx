'use client';

import s from './Article.module.scss';
import UiSuspense from '@/Components/ui/UiSuspense';
import ArticleSkeleton from './Skeletons/ArticleSkeleton';
import ArticleHeader from './ArticleHeader/ArticleHeader';
import ArticleLinkContent from './ArticleLinkContent/ArticleLinkContent';

interface ArticleProps {
	slug: string | undefined;
	title: string;
	imageSrc: string;
	author: string;
	date: string;
	updated: string;
	description: string;
	id: string;
	heading: string;
	isSuggested?: boolean;
	country?: string;
}

function Article({
	slug,
	title,
	imageSrc,
	author,
	date,
	updated,
	description,
	id,
	heading,
	isSuggested,
	country,
}: ArticleProps) {
	return (
		<UiSuspense fallback={<ArticleSkeleton />}>
			<article className={`${s.articleBlock} ${isSuggested ? s.suggested : ''}`}>
				<ArticleHeader
					author={author}
					date={date}
					updated={updated}
					slug={slug || ''}
					country={country}
				/>
				<ArticleLinkContent
					slug={slug || ''}
					title={title}
					heading={heading}
					imageSrc={imageSrc}
					description={description}
					id={id}
					country={country}
				/>
			</article>
		</UiSuspense>
	);
}

export default Article;
