import '../../../node_modules/modern-normalize/modern-normalize.css';
import type { Metadata } from 'next';

import s from './travelResources.module.scss';
// import Image from 'next/image';

export async function generateMetadata({
	searchParams,
}: {
	searchParams: { page?: string };
}): Promise<Metadata> {
	const currentPage = Number(searchParams.page || '1');
	const baseUrl =
		'https://www.yourpricebooking.com/travel-resources';

	return {
		title: 'Best Travel Resources | Hotels, Flights, Insurance & Gear – The Wandered',
		description:
			'Discover the best travel resources: hotel booking, flights, transport, insurance, tours, and travel gear. Handpicked tools and partners for smarter journeys.',
		alternates: {
			canonical: currentPage === 1 ? baseUrl : `${baseUrl}?page=${currentPage}`,
		},
	};
}


export default async function TravelResources({ searchParams }: { searchParams: { page?: string } }) {
	const currentPage = Number(searchParams.page || '1');


	return (
		<main className={s.main}>
			<div className={s.gradient}></div>
			<div className={s.topSection}>
			Essential Travel Resources for Every Journey
			</div>

		</main>
	);
}
