'use client';

import { ArticleHeaderSkeleton, ArticleLinkContentSkeleton } from './';
import s from '../Article.module.scss';

const ArticleSkeleton = () => {
	return (
		<article className={s.articleBlock}>
			<ArticleHeaderSkeleton />
			<ArticleLinkContentSkeleton />
		</article>
	);
};

export default ArticleSkeleton;
