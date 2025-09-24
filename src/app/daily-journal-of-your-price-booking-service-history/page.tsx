import '../../../node_modules/modern-normalize/modern-normalize.css';
import type { Metadata } from 'next';

import s from './historyPage.module.scss';
import JournalPosts from '@/components/JournalPosts/JournalPosts';
import { JournalPostType } from '@/types/historyTypes';
import { getDailyJournalPosts } from '@/services/getDailyJournalPosts';
import Image from 'next/image';

export async function generateMetadata({
	searchParams,
}: {
	searchParams: { page?: string };
}): Promise<Metadata> {
	const currentPage = Number(searchParams.page || '1');
	const baseUrl =
		'https://www.yourpricebooking.com/daily-journal-of-your-price-booking-service-history';

	return {
		title: 'Your Price Booking Journey: From Hotel Reservations to Games on the Go',
		description:
			'Discover the Your Price Booking timeline with travel insights and our new Game Park — fun, interactive, and multilingual.',
		alternates: {
			canonical: currentPage === 1 ? baseUrl : `${baseUrl}?page=${currentPage}`,
		},
		other: {
			...(currentPage > 1 && { prev: `${baseUrl}?page=${currentPage - 1}` }),
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
					<h2 className={s.mainTitle}><span>Daily Journal of</span> Your Price <span>Booking </span><span>Services History</span></h2>
					<a href="https://www.yourpricebooking.com" target="_blank" className={s.title}>
						www.yourpricebooking.com
					</a>
					<h3 className={s.mainDescription}>
						Transparent history, fair prices, and a platform connecting travelers and hoteliers
					</h3>
					<h3 className={s.mainDescription}><span>Your Price</span> <span>Booking</span> — A Service That Transforms Travel and the Hotel Business</h3>
					<div className={s.underlink}>
						<Image
						objectFit="cover"
						src="/hotels.png"
						alt="Hotels image"
						style={{ objectFit: 'cover' }}
						width={178} 
    					height={178} 
						priority
					/>
					<div><h4><a href="https://www.yourpricebooking.com/en/team" target="_blank">Meet the people behind the project on our Team page</a></h4>
					<h4><a href="https://www.yourpricebooking.com/en/our-mission" target="_blank">Learn why we do what we do — and meet the passionate team behind it</a></h4>
					<span><a href="https://www.yourpricebooking.com/en/for-hotelier" target="_blank">Tools and opportunities to grow your business — explore our Hoteliers page for full details and get started.</a></span>
					</div>
					</div>
				</div>
			</div>
			<div className={s.contentSection}>
				<JournalPosts initialPosts={posts} initialPage={currentPage} />
			</div>
		</main>
	);
}
