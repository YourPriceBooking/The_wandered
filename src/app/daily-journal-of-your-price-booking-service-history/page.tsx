import { permanentRedirect } from 'next/navigation';
import { paginationState, JOURNAL_PAGE_SIZE, pagePath } from '@/utils/pagination';
import { pageMetadata, socialImage } from '@/utils/seoMetadata';
import '../../../node_modules/modern-normalize/modern-normalize.css';
import type { Metadata } from 'next';

import s from './historyPage.module.scss';
import { JournalPostType } from '@/types/historyTypes';
import { getDailyJournalPosts } from '@/services/getDailyJournalPosts';
import Image from 'next/image';
import GamesOnTheGo from '@/components/GamesOnTheGo/GamesOnTheGo';
import Link from 'next/link';
import JournalPost from '@/components/JournalPosts/JournalPost/JournalPost';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';
import { journalCanonical, journalPath, newEpisodesPath } from '@/utils/journalSeo';

export async function generateMetadata({
	searchParams,
}: {
	searchParams: { page?: string | string[] };
}): Promise<Metadata> {
	return pageMetadata({
    title: 'Your Price Booking Journey: From Hotel Reservations to Games on the Go',
    description: 'Discover the Your Price Booking timeline with travel insights and our new Game Park — fun, interactive, and multilingual.',
    path: journalCanonical(journalPath, searchParams.page),
    image: socialImage('journal', 'Your Price Booking journal'),
  });
}



export default async function HistoryPage({ searchParams }: { searchParams: { page?: string | string[] } }) {
	const state = paginationState(journalPath, searchParams, true);
  if (state.page > 1) permanentRedirect(pagePath(newEpisodesPath, state.page));
  if (state.redirect) permanentRedirect(state.redirect);
  const data = await getDailyJournalPosts(1, JOURNAL_PAGE_SIZE);
  const posts: JournalPostType[] = data.result;
	return (
		<main className={s.main}>
			<div className={s.topSection}>
				<h1 className={s.mainTitle}>
					Daily Journal of <span>Your Price</span> <span>Booking </span>
					Services History & Game Park
				</h1>
				<a href="https://www.yourpricebooking.com" target="_blank" className={s.mainLink}>
					www.yourpricebooking.com
				</a>
				<div className={s.mainDescription}>
					<p>
						Transparent history, fair prices, and a platform connecting travelers and
						hoteliers
					</p>
					<p>
						<span>Your Price</span> <span>Booking</span>
						<span> — A Service That Transforms Travel and the Hotel Business</span>
					</p>
				</div>
				<div className={s.underlink}>
					<div className={s.image}>
						<Image
							objectFit="cover"
							src="/hotels.png"
							alt="Hotels image"
							style={{ objectFit: 'cover' }}
							width={178}
							height={178}
							priority
						/>
					</div>

					<div>
						<p>
							<a href="https://www.yourpricebooking.com/en/team" target="_blank">
								Meet the people behind the project on our Team page
							</a>
						</p>
						<p>
							<a href="https://www.yourpricebooking.com/en/our-mission" target="_blank">
								Learn why we do what we do — and meet the passionate team behind it
							</a>
						</p>
						<p>
							<a href="https://www.yourpricebooking.com/en/for-hotelier" target="_blank">
								Tools and opportunities to grow your business — explore our Hoteliers page
								for full details and get started.
							</a>
						</p>
					</div>
				</div>
			</div>

			<div className={s.contentSection}>
				<GamesOnTheGo />
				<div className={s.postsHeader}>
					<span>#</span>
					<h2>Thousands of Episodes: The Journey Continues</h2>
				</div>
				{posts.slice(0, 3).map((post, i) => (
					<JournalPost
						key={post._id + post.description + post.url}
						post={post}
						isWhiteBg={true}
					/>
				))}
				{/*Make a few Recent posts dependent on the page width*/}
				<div className={s.btnNewEpisode}>
					<Link href={`/daily-journal-of-your-price-booking-service-history/new-episodes`}>
						Continue the story
					</Link>
				</div>
			</div>
			<ScrollToTop />
		</main>
	);
}
