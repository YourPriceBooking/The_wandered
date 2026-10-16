'use client';
import s from './Header.module.scss';

import Logo from './Logo/Logo';
import BackArrow from '../TopSection/BackArrow/BackArrow';
import PlanetIcon from '../../../public/planet-icon';
import OldTopSection from '../OldTopSection/OldTopSection';
import SearchField from './SearchField/SearchField';
import MobileSearchField from './SearchField/MobileSearchField/MobileSearchField';

import { Suspense, useEffect, useState } from 'react';
import type { FocusEvent, PointerEvent, KeyboardEvent } from 'react';
import { useParams, usePathname } from 'next/navigation';

import { PagesEnum } from '@/types/enums/pagesEnums';
import Link from 'next/link';
import { routes } from '@/app/routes';

export default function Header() {
  const pathname = usePathname();
  const params = useParams();
  const [activeLink, setActiveLink] = useState<string | undefined>(
    pathname.includes('-') ? '' : pathname.split('/')[1],
  );
  const [activeSpecialLink, setActiveSpecialLink] = useState<string | null>(null);
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
  console.log(activeLink);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.hasHint')) {
        setHintOpen(false);
        setHintTarget(null);
      }
    };

    if (hintOpen) {
      document.addEventListener('click', handleClick);
    }
    return () => document.removeEventListener('click', handleClick);
  }, [hintOpen]);

  useEffect(() => {
    const currentRoute = routes.find((item) => item.path === pathname.split('/')[1]);
    if (currentRoute) {
      setActiveLink(currentRoute?.path);
    } else setActiveLink(undefined);
    setIsDailyJournal(pathname.startsWith('/daily-journal-of-your-price-booking-service-history'));
    if (pathname === '/travel-resources') {
      setActiveSpecialLink('travel');
    } else if (pathname.startsWith('/daily-journal') && pathname.includes('page=game-zone')) {
      setActiveSpecialLink('games');
    } else if (pathname.startsWith('/uncharted-planet')) {
      setActiveSpecialLink('planet');
    } else {
      setActiveSpecialLink(null);
    }
  }, [pathname]);

  const closeHint = () => {
    setHintOpen(false);
    setHintTarget(null);
  };

  const hintHandlers = (target: string) => ({
    // Touch and pen input must follow the link on the first tap.
    onPointerEnter: (event: PointerEvent<HTMLAnchorElement>) => {
      if (event.pointerType === 'mouse') {
        setHintOpen(true);
        setHintTarget(target);
      }
    },
    onPointerLeave: closeHint,
    onPointerDown: (event: PointerEvent<HTMLAnchorElement>) => {
      if (event.pointerType !== 'mouse') closeHint();
    },
    onFocus: (event: FocusEvent<HTMLAnchorElement>) => {
      if (event.currentTarget.matches(':focus-visible')) {
        setHintOpen(true);
        setHintTarget(target);
      }
    },
    onBlur: closeHint,
    onKeyDown: (event: KeyboardEvent<HTMLAnchorElement>) => {
      if (event.key === 'Escape') closeHint();
    },
    'aria-describedby': hintOpen && hintTarget === target ? `header-hint-${target}` : undefined,
  });

  if (pathname.split('/')[1] === PagesEnum.SEARCH_DATA_PAGE)
    return <OldTopSection isLink={true} isSearchField={true} isWhite={true} showSubtitle={false} />;

  return (
    <>
      <header
        className={`${s.header} ${isPostPage ? s.postPage : ''} ${
          isDailyJournal ? s['historyArrow'] : ''
        }`}
      >
        {isPostPage && <BackArrow country={activeLink ?? ''} />}
        <div className={`${s.headerContent} ${isDailyJournal ? s.hidden : ''}`}>
          <Logo />

          <nav className={s.navMenu}>
            {routes
              .filter((item) => item.path !== 'uncharted-planet')
              .map((item, index: number) => {
                return (
                  <div
                    key={index}
                    className={`${s.linkContainer} ${activeLink === item.path ? s.active : ''} `}
                  >
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
                  if (typeof window !== 'undefined' && window.innerWidth <= 769) {
                    setMobileSearchOpen(true);
                  }
                }}
              />
              {mobileSearchOpen && <MobileSearchField onClose={() => setMobileSearchOpen(false)} />}
              <div className={`${s.searchFieldButtons}`}>
                <div className={`${s.btnWrap} ${s.travel} `}>
                  <a
                    className={`${s.btnMobile} hasHint ${
                      activeSpecialLink === 'travel' ? s.active : ''
                    }`}
                    href="/travel-resources"
                    {...hintHandlers('travel')}
                  >
                    Travel Resources
                  </a>
                </div>

                <div className={`${s.btnWrap} ${s.gamesMobile} `}>
                  <a
                    className={`${s.btnMobile}  hasHint ${
                      activeSpecialLink === 'games' ? s.active : ''
                    }`}
                    href="/daily-journal-of-your-price-booking-service-history?page=game-zone"
                    {...hintHandlers('games')}
                  >
                    Games on the Go
                  </a>
                </div>
                <div className={`${s.btnWrap} ${s.planet} `}>
                  <a
                    className={`${s.btnMobile} hasHint ${
                      activeSpecialLink === 'planet' ? s.active : ''
                    }`}
                    href="/uncharted-planet"
                    {...hintHandlers('planet')}
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
      {hintOpen && hintTarget === 'travel' && (
        <div id="header-hint-travel" role="tooltip" className={s.hintBox}>
          Explore live travel tools — maps, weather, flight tracking, and soon: insurance, car
          rentals, and hotel booking.
        </div>
      )}
      {hintOpen && hintTarget === 'games' && (
        <div id="header-hint-games" role="tooltip" className={s.hintBox2}>
          Discover a fun escape in our Game Zone! Dive into exciting titles like Cube Tower, Retro
          Drift, and Bus Parking Out—perfect for quick breaks between your travel bookings. Play now
          and unwind!
        </div>
      )}
      {hintOpen && hintTarget === 'planet' && (
        <div id="header-hint-planet" role="tooltip" className={s.hintBox3}>
          We explore ancient monuments, competing theories of their construction, and the people —
          or civilizations — behind them.
        </div>
      )}
    </>
  );
}
