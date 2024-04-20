'use client';

import { JournalPostType } from '@/types/historyTypes';
import JournalPost from './JournalPost/JournalPost';
import { useEffect, useState } from 'react';
import { getDailyJournalPosts } from '@/services/getDailyJournalPosts';
import debounce from 'lodash/debounce';

interface JournalPostsProps {
	posts: JournalPostType[];
}
const NUMBER_OF_USERS_TO_FETCH = 5;
const JournalPosts: React.FC<JournalPostsProps> = ({ posts }) => {
	const [initialPosts, setInitialPosts] = useState<JournalPostType[]>(posts);
	const [page, setPage] = useState(2);
	const [loading, setLoading] = useState(false);

	const loadMorePosts = async () => {
		setLoading(true);
		try {
			const newPosts = await getDailyJournalPosts(page, NUMBER_OF_USERS_TO_FETCH);
			setInitialPosts((prevPosts) => [...prevPosts, ...newPosts.result]);
			setPage((prevPage) => prevPage + 1);
		} catch (error) {
			console.error('Error loading more posts:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const handleScroll = debounce(() => {
			if (
				document.documentElement.scrollTop <=
					document.documentElement.offsetHeight - window.innerHeight * 7 ||
				loading
			) {
				return;
			}

			loadMorePosts();
		}, 50);

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
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
