import '../../../node_modules/modern-normalize/modern-normalize.css';
import type { Metadata } from 'next';

import s from './historyPage.module.scss';
import JournalPosts from '@/Components/JournalPosts/JournalPosts';
import { JournalPostType } from '@/types/historyTypes';
import { getDailyJournalPosts } from '@/services/getDailyJournalPosts';

export const metadata: Metadata = {
	title: 'Your Price Booking Journey: A Chronological Odyssey of Hotel Reservations',
	description:
		'Embark on a captivating journey through the evolution of Your Price Booking, unfolding the timeline of every page on our blog. Travel through the past and future, discovering unique opportunities for your upcoming getaway. Multilingual information for your utmost convenience.',
};

export default async function HistoryPage() {
	const data = await getDailyJournalPosts();
	const posts: JournalPostType[] = data.result;

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
					<path
						d="M24.4965 19.0479C-0.507285 43.0203 0.000774806 42.4816 0.000774806 44.2901C0.000774806 45.8678 0.835445 47.0221 2.46849 47.6763C3.01284 47.9072 5.19024 48.0226 7.44023 47.9456L11.4321 47.8302L11.6136 64.0683L11.795 80.3449L12.9926 81.5763L14.1539 82.8461L44.3109 82.9615C60.8954 83.0385 75.0485 83 75.738 82.8461C76.4638 82.7306 77.4073 82.1919 77.8791 81.6917L78.7501 80.7682V64.1453V47.5609L81.9799 47.8302C85.9718 48.1765 87.8589 47.8687 89.0564 46.6758C90.0726 45.6754 90.2903 44.0593 89.6008 42.5586C89.0201 41.2888 46.0528 0.154739 45.1455 0.000823975C44.6375 -0.0761414 38.8311 5.27245 24.4965 19.0479ZM49.1011 28.9755C53.1293 29.8605 55.6333 31.2842 58.0285 34.0162C62.6736 39.2494 64.0889 45.483 62.2018 52.2938C60.7502 57.5269 52.6939 69.1091 47.9036 72.8415C46.5608 73.8805 45.835 74.1883 44.6375 74.1883C43.2585 74.1883 42.9318 73.9574 40.8633 71.7641C37.3069 68.0317 30.9199 59.2585 29.5771 56.2956C27.8352 52.5246 27.0005 47.2915 27.5449 43.5975C29.1054 33.4006 38.9762 26.7052 49.1011 28.9755Z"
						fill="#FF6000"
					/>
					<path
						d="M41.7203 36.4095C36.8998 38.051 33.5401 43.3575 34.0514 48.5112C35.0374 58.246 46.139 62.4835 52.8219 55.65C55.0495 53.3595 56.0355 50.8399 55.999 47.3277C55.999 44.999 55.8164 44.0828 55.013 42.4794C53.8079 40.0744 51.9089 38.0892 49.7543 36.9821C47.7093 35.9514 43.8749 35.6841 41.7203 36.4095Z"
						fill="#FF6000"
					/>
				</svg>
				<div className={s.mainTextBlock}>
					<h2 className={s.mainTitle}>Daily Journal of Your Price Booking Services History</h2>
					<a href="https://www.yourpricebooking.com" target="_blank" className={s.title}>
						www.yourpricebooking.com
					</a>
				</div>
			</div>
			<div className={s.contentSection}>{<JournalPosts posts={posts} />}</div>
		</main>
	);
}
