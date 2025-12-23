'use client';
import Link from 'next/link';
import s from './Footer.module.scss';
import { useParams, usePathname } from 'next/navigation';

import { footerLinkData } from './footerLinksData';

export default function Footer() {
	const pathname = usePathname();

	return (
		<footer className={s.footer}>
			<div className={s.footerContent}>
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
