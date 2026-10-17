import '../../node_modules/modern-normalize/modern-normalize.css';
import '../styles/index.scss';
import '../../node_modules/react-quill/dist/quill.snow.css';

import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import StoreProvider from './StoreProvider';
import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import DocumentLanguage from '@/components/DocumentLanguage/DocumentLanguage';
import GetDataClient from '@/components/GetDataClient/GetDataClient';
import LenisWrapper from '@/components/LenisWrapper/LenisWrapper';
import PageTransition from '@/components/PageTransition/PageTransition';
import HotFXLoader from '@/components/Header/HotFXLoader';

export const metadata: Metadata = {
	metadataBase: new URL('https://www.thewandered.com'),
	icons: { icon: '/favicon.ico', shortcut: '/favicon.ico' },
	title: 'The Wandered: your journey to discovery',
	description:
		'Embark on a journey of wanderlust with The Wandered, the official Your Price Booking blog. Explore travel tales, tips, and exclusive insights into breathtaking destinations. Let us be your guide to seamless adventures and unforgettable moments. Your Price Booking - Your Passport to a World of Exploration.',
};


export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const requestedLanguage = headers().get('x-wandered-language');
	const language = requestedLanguage === 'uk' || requestedLanguage === 'pl' ? requestedLanguage : 'en';
	return (
		<html lang={language}>
			<body>
				<DocumentLanguage />
				<HotFXLoader />
				<hotfx-shy-header>
					<Header />
  				</hotfx-shy-header>
				<div className="shy-header-spacer" />
				<StoreProvider>
					<GetDataClient />
					<PageTransition>{children}</PageTransition>
					<Footer />
					<GoogleAnalytics gaId="G-3SDMVMQQVR" />
				</StoreProvider>

				<LenisWrapper />
			</body>
		</html>
	);
}

