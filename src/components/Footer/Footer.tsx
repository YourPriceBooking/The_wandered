import Link from 'next/link';
import s from './Footer.module.scss';

import { footerLinkData } from './footerLinksData';

export default function Footer() {
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
										const target =
											link.src[0] !== '/'
												? { target: 'blank', rel: 'nofollow noreferrer noopener' }
												: {};
										return (
											<li key={i}>
												<Link href={link.src} {...target}>
													{link.name}
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
