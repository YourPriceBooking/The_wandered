import '../../node_modules/modern-normalize/modern-normalize.css';
import '../styles/index.scss';

import Footer from '@/Components/Footer/Footer';
import Header from '@/Components/Header/Header';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Loading from './loading';

import Script from 'next/script';
const GTM_ID = 'GTM-MQLS6WWJ';

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
		<html lang="en">
			<Script id="google-tag-manager" strategy="afterInteractive">
				{`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
        `}
			</Script>
			<body>
				<Header />
				<Suspense fallback={<Loading />}>{children}</Suspense>
				<Footer />
			</body>
		</html>
	);
}
