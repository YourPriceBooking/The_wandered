'use client';

import { useEffect, useState } from 'react';
import JournalPost from './JournalPost/JournalPost';
import { JournalPostType } from '@/types/historyTypes';
import { getDailyJournalPosts } from '@/services/getDailyJournalPosts';

interface JournalPostsProps {
	initialPosts: JournalPostType[];
	initialPage: number;
}

const BATCH_SIZE = 10;
const POSTS_LIMIT = 100;

const JournalPosts: React.FC<JournalPostsProps> = ({ initialPosts, initialPage }) => {
	const [allPosts, setAllPosts] = useState<JournalPostType[]>(initialPosts);
	const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
	const [page, setPage] = useState(initialPage);
	const [loading, setLoading] = useState(false);
	const [isFinished, setIsFinished] = useState(false);

	const updateURL = (count: number) => {
		const current = Math.ceil(count / BATCH_SIZE);
		window.history.replaceState(
			{},
			'',
			`/daily-journal-of-your-price-booking-service-history?page=${current}`,
		);
	};

	const loadMorePostsFromServer = async () => {
		setLoading(true);
		try {
			const nextPage = page + 1;
			const res = await getDailyJournalPosts(nextPage, POSTS_LIMIT);
			if (res.result.length > 0) {
				setAllPosts((prev) => [...prev, ...res.result.reverse()]);
				setPage(nextPage);
			} else {
				setIsFinished(true);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const onScroll = () => {
			if (loading) return;

			const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

			if (scrollTop + clientHeight >= scrollHeight - 800) {
				setVisibleCount((prev) => {
					const newCount = prev + BATCH_SIZE;
					updateURL(newCount);
					return newCount;
				});
			}
		};
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, [loading]);

	useEffect(() => {
		if (visibleCount > allPosts.length && !loading && !isFinished) {
			loadMorePostsFromServer();
		}
	}, [visibleCount, allPosts.length, loading, isFinished]);

	return (
		<div>
			{allPosts.slice(0, visibleCount).map((post) => (
				<JournalPost key={post._id + post.description + post.url} post={post} />
			))}
			{loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
		</div>
	);
};

export default JournalPosts;
