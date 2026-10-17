import { pageMetadata, socialImage } from '@/utils/seoMetadata';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';
import s from './new-episodes.module.scss';
import JournalPosts from '@/components/JournalPosts/JournalPosts';
import { getDailyJournalPosts } from '@/services/getDailyJournalPosts';
import { JournalPostType } from '@/types/historyTypes';
import { Metadata } from 'next';
import { journalCanonical, journalPage, newEpisodesPath } from '@/utils/journalSeo';

export async function generateMetadata({
	searchParams,
}: {
	searchParams: { page?: string | string[] };
}): Promise<Metadata> {
	return pageMetadata({
    title: 'The Story Continues with New Episodes: Your Price Booking Journey',
    description: 'Explore fresh episodes and stories from Your Price Booking — uncover how our journey grows with every update, experience and adventure.',
    path: journalCanonical(newEpisodesPath, searchParams.page),
    image: socialImage('new-episodes', 'New episodes and stories'),
  });
}

const NewEpisodes = async ({ searchParams }: { searchParams: { page?: string | string[] } }) => {
	const currentPage = journalPage(searchParams.page);
	const POSTS_LIMIT = 10;
	const data = await getDailyJournalPosts(currentPage, POSTS_LIMIT);
	const posts: JournalPostType[] = data.result.reverse();
	return (
		<main className={s.mainSection}>
			<div className={s.newEpisodesHeader}>
				<span>#</span>
				<h1>New Episodes and Stories Continue</h1>
			</div>
			{<JournalPosts initialPosts={posts} initialPage={currentPage} />}
			<ScrollToTop />
		</main>
	);
};
export default NewEpisodes;
