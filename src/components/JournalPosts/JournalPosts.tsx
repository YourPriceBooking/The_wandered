'use client';

import { useEffect, useState } from 'react';
import JournalPost from './JournalPost/JournalPost';
import { JournalPostType } from '@/types/historyTypes';
import { getDailyJournalPosts } from '@/services/getDailyJournalPosts';
import { daysSinceDate } from '@/services/daysCounter';

interface JournalPostsProps {
	posts: JournalPostType[];
}

const BATCH_SIZE = 10;
const INITIAL_LOAD = 200;

const JournalPosts: React.FC<JournalPostsProps> = ({ posts }) => {
	const [allPosts, setAllPosts] = useState<JournalPostType[]>(posts);
	const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
	const [page, setPage] = useState(daysSinceDate() * 5 - 1);
	const [loading, setLoading] = useState(false);
	const [isFinished, setIsFinished] = useState(false);

	const loadMorePostsFromServer = async () => {
		setLoading(true);
		try {
			const res = await getDailyJournalPosts(page, INITIAL_LOAD);
			if (res.result.length > 0) {
				setAllPosts((prev) => [...prev, ...res.result]);
				setPage((prev) => prev - 1);
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
				setVisibleCount((prev) => prev + BATCH_SIZE);
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
