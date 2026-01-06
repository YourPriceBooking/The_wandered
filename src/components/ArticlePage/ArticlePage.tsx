'use client';

import s from './ArticlePage.module.scss';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import Banner from '../banner/Banner';
import { PostPageProps } from '@/types/postTypes';
//import { GetServerSideProps } from 'next';
import UiSuspense from '@/components/ui/UiSuspense';
import { ArticleSkeleton } from '../Article/Skeletons';
import dynamic from 'next/dynamic';
import GptItiBanner from '../GptItiBanner/GptItiBanner';

const PostBlock = dynamic(() => import('../Post/PostBlock'), {
	ssr: false,
});

export default function ArticlePage({ postPageLink, country = 'home' }: PostPageProps) {
	return (
		<article className={s.postBlock}>
					<UiSuspense fallback={<ArticleSkeleton />}>
						<PostBlock country={country} postPageLink={postPageLink} />
					</UiSuspense>
			<Banner />
			<GptItiBanner />
			<ScrollToTop />
		</article>
	);
}
