import '../../node_modules/modern-normalize/modern-normalize.css';
import '../styles/index.scss';

import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import StoreProvider from './StoreProvider';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import GetDataClient from '@/components/GetDataClient/GetDataClient';
import LenisWrapper from '@/components/LenisWrapper/LenisWrapper';
import PageTransition from "../components/PageTransition/PageTransition";
import RouteLoader from '@/components/LoadingScreen/RouteLoader/RouteLoader';

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
				<HotFXLoader />
				<hotfx-shy-header>
				  <Suspense fallback={null}>
					<Header />
				  </Suspense>
  				</hotfx-shy-header>
				<div className="shy-header-spacer" />
				<StoreProvider>
					<Header />
					<GetDataClient />
					<RouteLoader>
						<PageTransition>{children}</PageTransition>
					</RouteLoader>
					<Footer />
					<GoogleAnalytics gaId="G-3SDMVMQQVR" />
				</StoreProvider>

				<LenisWrapper />
			</body>
		</html>
	);
}
