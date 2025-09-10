'use client';
import s from './Header.module.scss';

import Logo from './Logo/Logo';
import BackArrow from '../TopSection/BackArrow/BackArrow';

import TopSection from '../TopSection/TopSection';
import SearchField from './SearchField/SearchField';

import { Suspense, useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';

import { PagesEnum } from '@/types/enums/pagesEnums';
import Link from 'next/link';
import { routes } from '@/app/routes';

export default function Header() {
	const pathname = usePathname();
	const params = useParams();
console.log('pathname', pathname);
	console.log('params', params);
	const [activeLink, setActiveLink] = useState(
		pathname.includes('-') ? '' : pathname.split('/')[1],
	);
	const [isDailyJournal, setIsDailyJournal] = useState(false);
console.log('activeLink', activeLink);
console.log('isDailyJournal :', isDailyJournal);
	const isPostPage = Object.keys(params)[0] === 'postPageLink' || pathname === '/daily-journal-of-your-price-booking-service-history';
	console.log('isPostPage', isPostPage);
	

	useEffect(() => {
		const currentRoute = routes.find((item) => item.path === pathname.split('/')[1]);
		if (currentRoute) {
			setActiveLink(currentRoute?.path);
		}
		setIsDailyJournal(pathname === '/daily-journal-of-your-price-booking-service-history');
		console.log('isDailyJournal', isDailyJournal);
	}, [pathname]);

	if (pathname.split('/')[1] === PagesEnum.SEARCH_DATA_PAGE)
		return <TopSection isLink={true} isSearchField={true} isWhite={true} />;

	return (
		<header className={`${s.header} ${isPostPage ? s.postPage : ''} ${isDailyJournal ? s['historyArrow'] : ''}`}>
			{isPostPage && <BackArrow country={activeLink} />}
			<div className={`${s.headerContent} ${isDailyJournal ? s.hidden : ''}`}>
				<Logo />

				<nav className={s.navMenu}>
					{routes.map((item, index: number) => {
						return (
							<div
								key={index}
								className={`${s.linkContainer} ${
									activeLink === item.path ? s.active : ''
								} `}
							>
								<span className={s.linkDot}>•</span>
								<Link className={s.navLink} href={`/${item.path}`}>
									{item.name}
								</Link>
							</div>
						);
					})}
				</nav>
				<Suspense fallback={null}>
					<SearchField />
				</Suspense>
			</div>
		</header>
	);
}
