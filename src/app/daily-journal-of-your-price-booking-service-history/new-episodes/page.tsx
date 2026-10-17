import { notFound, permanentRedirect } from 'next/navigation';
import { paginationState, JOURNAL_PAGE_SIZE, pageExists } from '@/utils/pagination';
import { pageMetadata, socialImage } from '@/utils/seoMetadata';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';
import s from './new-episodes.module.scss';
import JournalPosts from '@/components/JournalPosts/JournalPosts';
import { getDailyJournalPosts } from '@/services/getDailyJournalPosts';
import { JournalPostType } from '@/types/historyTypes';
import { Metadata } from 'next';
import { journalCanonical, newEpisodesPath } from '@/utils/journalSeo';

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
	const state = paginationState(newEpisodesPath, searchParams);
  if (state.redirect) permanentRedirect(state.redirect);
  const currentPage = state.page;
  const data = await getDailyJournalPosts(currentPage, JOURNAL_PAGE_SIZE);
  if (!pageExists(currentPage, data.total, JOURNAL_PAGE_SIZE)) notFound();
  const posts: JournalPostType[] = data.result;
	return (
		<main className={s.mainSection}>
			<div className={s.newEpisodesHeader}>
				<span>#</span>
				<h1>New Episodes and Stories Continue</h1>
			</div>
			{<JournalPosts initialPosts={posts} initialPage={currentPage} totalPages={data.totalPages} />}
			<ScrollToTop />
		</main>
	);
};
export default NewEpisodes;
