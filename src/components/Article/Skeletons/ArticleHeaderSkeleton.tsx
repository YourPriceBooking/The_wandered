'use client';

import Skeleton from '@/components/ui/Skeleton';
import s from '../ArticleHeader/ArticleHeader.module.scss';

const ArticleHeaderSkeleton = () => {
	return (
		<div className={s.authorBlock}>
			<Skeleton width="48px" height="48px" borderRadius="50%" />
			<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
				<Skeleton width="100px" height="16px" />
				<Skeleton width="60px" height="12px" />
			</div>
		</div>
	);
};

export default ArticleHeaderSkeleton;
