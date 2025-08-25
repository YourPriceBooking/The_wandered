import '../../../node_modules/modern-normalize/modern-normalize.css';
import type { Metadata } from 'next';

import s from './historyPage.module.scss';
import JournalPosts from '@/components/JournalPosts/JournalPosts';
import { JournalPostType } from '@/types/historyTypes';
import { getDailyJournalPosts } from '@/services/getDailyJournalPosts';

// export const metadata: Metadata = {
// 	title: 'Your Price Booking Journey: A Chronological Odyssey of Hotel Reservations',
// 	description:
// 		'Embark on a captivating journey through the evolution of Your Price Booking, unfolding the timeline of every page on our blog. Travel through the past and future, discovering unique opportunities for your upcoming getaway. Multilingual information for your utmost convenience.',
// };

export async function generateMetadata({
	searchParams,
}: {
	searchParams: { page?: string };
}): Promise<Metadata> {
	const currentPage = Number(searchParams.page || '1');
	const baseUrl =
		'https://www.yourpricebooking.com/daily-journal-of-your-price-booking-service-history';

	return {
		title: 'Your Price Booking Journey: A Chronological Odyssey of Hotel Reservations',
		description:
			'Embark on a captivating journey through the evolution of Your Price Booking, unfolding the timeline of every page on our blog. Travel through the past and future, discovering unique opportunities for your upcoming getaway. Multilingual information for your utmost convenience.',
		alternates: {
			canonical: currentPage === 1 ? baseUrl : `${baseUrl}?page=${currentPage}`,
		},
		other: {
			// rel="prev" / rel="next" для SEO
			...(currentPage > 1 && { prev: `${baseUrl}?page=${currentPage - 1}` }),
			// Тут лучше знать общее кол-во страниц, но если не знаем — просто генерим next
			next: `${baseUrl}?page=${currentPage + 1}`,
		},
	};
}

const POSTS_LIMIT = 100;

export default async function HistoryPage({ searchParams }: { searchParams: { page?: string } }) {
	const currentPage = Number(searchParams.page || '1');
	const data = await getDailyJournalPosts(currentPage, POSTS_LIMIT);

	const posts: JournalPostType[] = data.result.reverse();

	return (
		<main className={s.main}>
			<div className={s.gradient}></div>
			<div className={s.topSection}>
				<svg
					className={s.logo}
					width="90"
					height="83"
					viewBox="0 0 90 83"
					fill="#FF6000"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M24.4965 19.0479C-0.507285 43.0203 ..." fill="#FF6000" />
					<path d="M41.7203 36.4095C36.8998 ..." fill="#FF6000" />
				</svg>
				<div className={s.mainTextBlock}>
					<h2 className={s.mainTitle}>Daily journal of Your Price Booking services history</h2>
					<a href="https://www.yourpricebooking.com" target="_blank" className={s.title}>
						www.yourpricebooking.com
					</a>
				</div>
			</div>
			<div className={s.contentSection}>
				<JournalPosts initialPosts={posts} initialPage={currentPage} />
			</div>
		</main>
	);
}
