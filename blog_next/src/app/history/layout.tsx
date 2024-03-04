import type { Metadata } from 'next';

import '../../styles/index.scss';

export const metadata: Metadata = {
  title: 'Your Price Booking Journey: A Chronological Odyssey of Hotel Reservations',
  description:
    'Embark on a captivating journey through the evolution of Your Price Booking, unfolding the timeline of every page on our blog. Travel through the past and future, discovering unique opportunities for your upcoming getaway. Multilingual information for your utmost convenience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
