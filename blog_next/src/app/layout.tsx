import '../../node_modules/modern-normalize/modern-normalize.css';
import '../styles/index.scss';

import Header from '@/Components/Header/Header';
import Footer from '@/Components/Footer/Footer';
import StoreProvider from './StoreProvider';
import { GoogleAnalytics } from '@next/third-parties/google';

import type { Metadata } from 'next';
import GetDataClient from '@/Components/GetDataClient/GetDataClient';

export const metadata: Metadata = {
	title: 'The Wandered: your journey to discovery',
	description:
		'Embark on a journey of wanderlust with The Wandered, the official Your Price Booking blog. Explore travel tales, tips, and exclusive insights into breathtaking destinations. Let us be your guide to seamless adventures and unforgettable moments. Your Price Booking - Your Passport to a World of Exploration.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<StoreProvider>
					<Header />
					<GetDataClient />
					{children}
					<Footer />
					<GoogleAnalytics gaId="G-3SDMVMQQVR" />
				</StoreProvider>
			</body>
		</html>
	);
}
