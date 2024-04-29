'use client';

import { JournalPostType } from '@/types/historyTypes';
import JournalPost from './JournalPost/JournalPost';
import { useEffect, useState } from 'react';
import { getDailyJournalPosts } from '@/services/getDailyJournalPosts';
import debounce from 'lodash/debounce';
import { daysSinceDate } from '@/services/daysCounter';

interface JournalPostsProps {
	posts: JournalPostType[];
}
const JournalPosts: React.FC<JournalPostsProps> = ({ posts }) => {
	const [initialPosts, setInitialPosts] = useState<JournalPostType[]>(posts);
	const [page, setPage] = useState(daysSinceDate() * 5 - 1);
	const [loading, setLoading] = useState(false);
	const [isFinished, setIsFinished] = useState(false);
	const [lastScrollTop, setLastScrollTop] = useState(0);

	const loadMorePosts = async () => {
		setLoading(true);
		try {
			const newPosts = await getDailyJournalPosts(page);
			setInitialPosts((prevPosts) => [...prevPosts, ...newPosts.result]);
			setPage((prevPage) => prevPage - 1);
		} catch (error) {
			console.error('Error loading more posts:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (page > 0) {
			const handleScroll = debounce(() => {
				const currentScrollTop = document.documentElement.scrollTop;
				if (currentScrollTop > lastScrollTop + 3500 && !loading) {
					setLastScrollTop(currentScrollTop);
					loadMorePosts();
				}
			}, 250);

			window.addEventListener('scroll', handleScroll);

			return () => {
				window.removeEventListener('scroll', handleScroll);
			};
		} else if (page === 0) {
			setIsFinished(true);
		}
	}, [loading, page]);

	return (
		<div>
			{initialPosts.map((post: JournalPostType) => (
				<JournalPost
					key={post._id + post.description + post.url + post.linkOnPhoto}
					post={post}
				/>
			))}
			{loading && <p>Loading...</p>}
		</div>
	);
};

export default JournalPosts;
