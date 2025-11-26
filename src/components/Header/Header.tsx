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

	const [activeLink, setActiveLink] = useState(
		pathname.includes('-') ? '' : pathname.split('/')[1],
	);
	const [isDailyJournal, setIsDailyJournal] = useState(false);

	const isPostPage =
		Object.keys(params)[0] === 'postPageLink' ||
		pathname.startsWith('/daily-journal-of-your-price-booking-service-history');
	{
		/* Check if path is daily journal */
	}

	const [hintOpen, setHintOpen] = useState(false);
	const [hintTarget, setHintTarget] = useState<string | null>(null);

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (!(e.target as HTMLElement).closest(".hasHint")) {
				setHintOpen(false);
				setHintTarget(null);
			}
		};

		if (hintOpen) {
			document.addEventListener("click", handleClick);
		}
		return () => document.removeEventListener("click", handleClick);
	}, [hintOpen]);

	useEffect(() => {
		const currentRoute = routes.find((item) => item.path === pathname.split('/')[1]);
		if (currentRoute) {
			setActiveLink(currentRoute?.path);
		}
		setIsDailyJournal(
			pathname.startsWith('/daily-journal-of-your-price-booking-service-history'),
		);
	}, [pathname]);

	if (pathname.split('/')[1] === PagesEnum.SEARCH_DATA_PAGE)
		return <TopSection isLink={true} isSearchField={true} isWhite={true} />;

	return (
		<header
			className={`${s.header} ${isPostPage ? s.postPage : ''} ${
				isDailyJournal ? s['historyArrow'] : ''
			}`}
		>
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
					<div className={`SearchFieldContainer ${s.searchFieldContainer}`}>
						<SearchField className={s.searchField} />
						<a className= {s.gamesDesktopLink} href="/daily-journal-of-your-price-booking-service-history?page=game-zone">
							<div  className= {s.GamesOn}>Games on the Go</div>
						</a>
						<div
							className={`${s.btnWrap} hasHint`}
							onMouseEnter={() => {
								if (window.innerWidth > 480) {
									setHintOpen(true);
									setHintTarget("travel");
								}
							}}
							onMouseLeave={() => {
								if (window.innerWidth > 480) {
									setHintOpen(false);
									setHintTarget(null);
								}
							}}
							onClick={(e) => {
								if (window.innerWidth <= 480) {
									if (!hintOpen || hintTarget !== "travel") {
										e.preventDefault();
										setHintOpen(true);
										setHintTarget("travel");
										return;
									}
								}
							}}
						>
							<a className= {`${s.btnMobile} ${s.travel}`} href="/travel-resources">Travel Resources</a>
						</div>
						{hintOpen && hintTarget === "travel" && (
							<div className={s.hintBox}>
								Explore live travel tools — maps, weather, flight tracking, and soon: insurance, car rentals, and hotel booking.
							</div>
						)}
						<div className= {s.btnWrap}>
							<a className= {`${s.btnMobile} ${s.gamesMobile}`} href="/daily-journal-of-your-price-booking-service-history?page=game-zone">Games on the Go</a>
						</div>
					</div>					
				</Suspense>
			</div>
		</header>
	);
}
