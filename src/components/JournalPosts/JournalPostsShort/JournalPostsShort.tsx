'use client';
import { JournalPostType } from '@/types/historyTypes';
import s from './JournalPostsShort.module.scss';
import JournalPost from '../JournalPost/JournalPost';
import { useEffect, useState } from 'react';

const JournalPostsShort = ({ posts }: { posts: JournalPostType[] }) => {
	const [width, setWidth] = useState<number | null>(null);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		let resizeTimeout: ReturnType<typeof setTimeout>;

		const handleResize = () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				setWidth(window.innerWidth);
			}, 200); // затримка 200мс
		};

		window.addEventListener('resize', handleResize);
		handleResize(); // ініціалізація

		return () => {
			clearTimeout(resizeTimeout);
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	let postsCount: number;
	if (width !== null) {
		if (width >= 750) {
			postsCount = 3;
		} else {
			postsCount = 1;
		}
	}
	return (
		<div className={s.container}>
			{posts.map((post, i) =>
				postsCount > i ? (
					<JournalPost key={post._id + post.description + post.url} post={post} />
				) : null,
			)}
		</div>
	);
};

export default JournalPostsShort;
