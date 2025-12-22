'use client';
import s from './Header.module.scss';

import Logo from './Logo/Logo';
import BackArrow from '../TopSection/BackArrow/BackArrow';
import PlanetIcon from '../../../public/planet-icon';
import TopSection from '../TopSection/TopSection';
import SearchField from './SearchField/SearchField';
import MobileSearchField from './SearchField/MobileSearchField/MobileSearchField';

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
	const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (window.innerWidth <= 678) return;
		const navMenu = document.querySelector(`.${s.navMenu}`);
		if (!navMenu) return;
  		const travelLinkContainer = navMenu.querySelector(
  		  `.${s.linkContainer} a[href="/travel-resources"]`
  		)?.closest(`.${s.linkContainer}`) as HTMLElement | null;
		if (!travelLinkContainer) return;
		travelLinkContainer.classList.add("hasHint");
		const handleEnter = () => {
			setHintOpen(true);
			setHintTarget("travel");
		};
		const handleLeave = () => {
			setHintOpen(false);
			setHintTarget(null);
		};
		travelLinkContainer.addEventListener("mouseenter", handleEnter);
		travelLinkContainer.addEventListener("mouseleave", handleLeave);

		return () => {
			travelLinkContainer.removeEventListener("mouseenter", handleEnter);
			travelLinkContainer.removeEventListener("mouseleave", handleLeave);
		};
	}, []);
	

	if (pathname.split('/')[1] === PagesEnum.SEARCH_DATA_PAGE)
		return <TopSection isLink={true} isSearchField={true} isWhite={true} />;

	return (
		<>
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
								<div key={index} className={`${s.linkContainer} ${ activeLink === item.path ? s.active : '' } `}>
									<span className={s.linkDot}>•</span>
									<Link className={s.navLink} href={`/${item.path}`}>
										{item.name}
									</Link>
								</div>
							);
						})}
						<Suspense fallback={null}>
							<SearchField 
								className={`${s.searchBtn}`}
								onClick={() => {
									if (window.innerWidth >= 769 && window.innerWidth <= 1200) {
								      setMobileSearchOpen(true);
								    }
								}}
							/>
						</Suspense>
					</nav>
					<Suspense fallback={null}>
						<div className={`SearchFieldContainer ${s.searchFieldContainer}`}>
							<SearchField 
								className={`${s.searchField}`}
							    onClick={() => {
							      if (typeof window !== "undefined" && window.innerWidth <= 480) {
							        setMobileSearchOpen(true);
							      }
							    }}
							/>
							{mobileSearchOpen &&  <MobileSearchField onClose={() => setMobileSearchOpen(false)} />}
							{/* <a
							  className={`${s.gamesDesktopLink} hasHint`}
							  href="/daily-journal-of-your-price-booking-service-history?page=game-zone"
							  onMouseEnter={() => {
							    if (window.innerWidth > 678) {
							      setHintOpen(true);
							      setHintTarget("games");
							    }
							  }}
							  onMouseLeave={() => {
							    if (window.innerWidth > 678) {
							      setHintOpen(false);
							      setHintTarget(null);
							    }
							  }}
							> */}
								{/* <div className={s.GamesOn}>Games on the Go</div> */}
							{/* </a> */}
							<div className={`${s.searchFieldButtons}`}>
								<div className={`${s.btnWrap} ${s.travel} `} >
									<a 
										className= {`${s.btnMobile} hasHint`}
										href="/travel-resources"
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
									Travel Resources</a>
								</div>

								<div className={`${s.btnWrap} ${s.gamesMobile}`}>
								  <a
								    className={`${s.btnMobile}  hasHint`}
								    href="/daily-journal-of-your-price-booking-service-history?page=game-zone"
								    onMouseEnter={() => {
								      if (window.innerWidth > 480) {
								        setHintOpen(true);
								        setHintTarget("games");
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
								        if (!hintOpen || hintTarget !== "games") {
								          e.preventDefault();
								          setHintOpen(true);
								          setHintTarget("games");
								          return;
								        }
								      }
								    }}
								  >
								    Games on the Go
								  </a>
								</div>
								<div className={`${s.btnWrap} ${s.planet}`}>
								  <a
								    className={`${s.btnMobile} hasHint`}
								    href="/daily-journal-of-your-price-booking-service-history?page=game-zone"
								    onMouseEnter={() => {
								      if (window.innerWidth > 480) {
								        setHintOpen(true);
								        setHintTarget("planet");
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
								        if (!hintOpen || hintTarget !== "planet") {
								          e.preventDefault();
								          setHintOpen(true);
								          setHintTarget("planet");
								          return;
								        }
								      }
								    }}
								  >
								    <PlanetIcon />
								    <span>Uncharted Planet</span>
								  </a>
								</div>

							</div>
						</div>					
					</Suspense>
				</div>
			</header>
			{hintOpen && hintTarget === "travel" && (
				<div className={s.hintBox}>
					Explore live travel tools — maps, weather, flight tracking, and soon: insurance, car rentals, and hotel booking.
				</div>
			)}
			{hintOpen && hintTarget === "games" && (
			  <div className={s.hintBox2}>
			    Discover a fun escape in our Game Zone!  Dive into exciting titles like Cube Tower, Retro Drift, and Bus Parking Out—perfect for quick breaks between your travel bookings. Play now and unwind!
			  </div>
			)}
			{hintOpen && hintTarget === "planet" && (
			  <div className={s.hintBox3}>
					We explore ancient monuments, competing theories of their construction, and the people — or civilizations — behind them.
			  </div>
			)}
		</>
	);
}
//679-768