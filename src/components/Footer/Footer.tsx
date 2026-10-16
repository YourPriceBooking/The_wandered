'use client';
import Link from 'next/link';
import s from './Footer.module.scss';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import SearchField from '../Header/SearchField/SearchField';
import { getSearchCopy } from '@/defaultData/searchCopy';

import { footerLinkData } from './footerLinksData';

export default function Footer() {
	const pathname = usePathname();
	const copy = getSearchCopy(pathname.split('/')[1]);

	return (
		<footer className={s.footer}>
			<div className={s.footerContent}>
				<section className={s.searchRow} lang={copy.lang} aria-labelledby="footer-search-title">
					<div>
						<p className={s.searchBrand}>the wandered</p>
						<h2 id="footer-search-title" className={s.searchTitle}>{copy.footerTitle}</h2>
						<p className={s.searchDescription}>{copy.footerDescription}</p>
					</div>
					<div className={s.searchForm}>
						<Suspense fallback={<div className={s.searchFallback} />}><SearchField /></Suspense>
					</div>
				</section>
				<div className={s.navContainer}>
					{footerLinkData.map((block, i) => {
						return (
							<div key={i} className={s.navBlock}>
								<h2 className={s.linkTitle}>{block.title}</h2>
								<ul className={s.linkBlock}>
									{block.links.map((link, i) => {
										const isActive = pathname === link.src;
										const target =
											link.src[0] !== '/'
												? { target: 'blank', rel: 'nofollow noreferrer noopener' }
												: {};
										return (
											<li key={i} className={isActive ? s.active : ''}>
    											<Link href={link.src} {...target}>
    											  {typeof link.name === 'string' ? (
    											    <span dangerouslySetInnerHTML={{ __html: link.name }} />
    											  ) : (
    											    link.name
    											  )}
    											</Link>
											</li>
										);
									})}
								</ul>
							</div>
						);
					})}
				</div>
				<p className={s.copyright}>
					&copy; {new Date().getFullYear()} Your Price Booking ОÜ. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
