'use client';

import Skeleton from '@/components/ui/Skeleton';
import s from '../Article.module.scss';

const ArticleLinkContentSkeleton = () => {
	return (
		<div className={s.linkContentSkeleton}>
			<div className={s.imageBlock}>
				<div className={s.hoverBlock}>
					<Skeleton width="70%" height="24px" />
					<Skeleton width="90%" height="16px" />
				</div>
				<div className={s.line}></div>
				<div className={s.imageSkeleton}>
					<Skeleton width="100%" height="200px" borderRadius="12px" />
				</div>
			</div>

			<div className={s.titleBlock}>
				<Skeleton width="60%" height="28px" />
			</div>

			<div className={s.readMore}>
				<Skeleton width="100px" height="16px" />
			</div>
		</div>
	);
};

export default ArticleLinkContentSkeleton;
