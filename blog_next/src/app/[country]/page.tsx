import { Metadata } from 'next';
import s from '../mainPage.module.scss';
import TopSection from '@/Components/TopSection/TopSection';

export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateStaticParams() {
	return [
		{ country: 'ukraine' },
		{ country: 'poland' },
		{ country: 'usa' },
		{ country: 'canada' },
	];
}

export async function generateMetadata({
	params,
}: {
	params: { country: string };
}): Promise<Metadata> {
	const metadata = [
		{
			country: 'ukraine',
			title: 'Подорожі Україною: від Києва до Карпат',
			description:
				'Відкрийте для себе красу України – від її давніх міст до величних гір Карпат. Дізнайтеся більше про культуру, історію та природні багатства цієї унікальної країни.',
		},
		{
			country: 'poland',
			title: 'Podróże po Polsce: odkrywanie kultury, historii i natury',
			description:
				'Odkryj najpiękniejsze miejsca w Polsce – od malowniczych miasteczek po tętniące życiem metropolie. Poznaj bogatą kulturę, zabytki historyczne i wspaniałe krajobrazy, które czekają na odkrycie.',
		},
		{
			country: 'usa',
			title: 'The Wandered: Your Journey to Discovery',
			description:
				'Embark on a journey of wanderlust with The Wandered, the official Your Price Booking blog. Explore travel tales, tips, and exclusive insights into breathtaking destinations. Let us be your guide to seamless adventures and unforgettable moments. Your Price Booking - Your Passport to a World of Exploration.',
		},
		{
			country: 'canada',
			title: 'Exploring Canada: from vibrant cities to breathtaking landscapes',
			description:
				'Discover the beauty of Canada, a country with vast wilderness, charming cities, and rich cultural diversity. From the Rockies to the Maritimes, there is always something new to explore.',
		},
	];

	const data = metadata.find((item) => item.country === String(params.country));

	if (data) {
		return {
			title: data.title,
			description: data.description,
			icons: {
				icon: '../../favicon.ico',
				shortcut: '../../favicon.ico',
			},
		};
	} else {
		return {
			title: 'The Wandered: Your Journey to Discovery',
			description:
				'Embark on a journey of wanderlust with The Wandered, the official Your Price Booking blog. Explore travel tales, tips, and exclusive insights into breathtaking destinations. Let us be your guide to seamless adventures and unforgettable moments. Your Price Booking - Your Passport to a World of Exploration.',
			icons: {
				icon: '../../favicon.ico',
				shortcut: '../../favicon.ico',
			},
		};
	}
}

export default function CountryPage({ params }: { params: { country: string } }) {
	return (
		<main className={s.main}>
			<TopSection country={params.country} />
			<div className={s.contentSection}>
				<div className={s.temporary}></div>
			</div>
		</main>
	);
}
