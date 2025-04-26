'use client';

import UiSuspense from '@/components/ui/UiSuspense';
import { ArticleSkeleton } from './Skeletons';
import dynamic from 'next/dynamic';

const ActualArticle = dynamic(() => import('./ActualArticle'), { ssr: false });

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

export default function ArticleWrapper(props: ArticleProps) {
	return (
		<UiSuspense fallback={<ArticleSkeleton />}>
			<ActualArticle {...props} />
		</UiSuspense>
	);
}
