import '../../node_modules/modern-normalize/modern-normalize.css';
import '../styles/index.scss';

import Footer from '@/Components/Footer/Footer';
import Header from '@/Components/Header/Header';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Loading from './loading';
import StoreProvider from './StoreProvider';

export const metadata: Metadata = {
	title: 'The Wandered: Your Journey to Discovery',
	description:
		'Embark on a journey of wanderlust with The Wandered, the official Your Price Booking blog. Explore travel tales, tips, and exclusive insights into breathtaking destinations. Let us be your guide to seamless adventures and unforgettable moments. Your Price Booking - Your Passport to a World of Exploration.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<StoreProvider>
			<html lang="en">
				<body>
					<Header />
					<Suspense fallback={<Loading />}>{children}</Suspense>
					<Footer />
				</body>
			</html>
		</StoreProvider>
	);
}
