'use client';

import { ArticleLinkContentSkeleton } from './';
import s from '../Article.module.scss';

const ArticleSkeleton = () => {
	return (
		<article className={s.articleBlock}>
			<ArticleLinkContentSkeleton />
		</article>
	);
};

export default ArticleSkeleton;
