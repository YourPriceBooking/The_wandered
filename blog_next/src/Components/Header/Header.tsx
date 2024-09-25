'use client';
import s from './Header.module.scss';

import Logo from './Logo/Logo';
import BackArrow from '../TopSection/BackArrow/BackArrow';
import Loading from '@/app/loading';
import TopSection from '../TopSection/TopSection';
import SearchField from './SearchField/SearchField';

import { Suspense, useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';

import { PagesEnum } from '@/types/enums/pagesEnums';
import Link from 'next/link';
import { routes } from '@/app/routes';

export default function Header() {
	const pathname = usePathname();

	const [activeLink, setActiveLink] = useState(
		pathname.includes('-') ? '' : pathname.split('/')[1],
	);

	const isPostPage = Object.keys(useParams())[0] === 'postPageLink';
	if (pathname.split('/')[1] === PagesEnum.SEARCH_DATA_PAGE)
		return <TopSection isLink={true} isSearchField={true} isWhite={true} />;

	useEffect(() => {
		const currentRoute = routes.find((item) => item.path === pathname.split('/')[1]);
		if (currentRoute) {
			setActiveLink(currentRoute?.path);
		}
	}, [pathname]);

	return (
		<header className={`${s.header} ${isPostPage ? s.postPage : ''}`}>
			{isPostPage && <BackArrow country={activeLink} />}
			<div className={s.headerContent}>
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

				<Suspense fallback={<Loading />}>
					<SearchField />
				</Suspense>
			</div>
		</header>
	);
}
