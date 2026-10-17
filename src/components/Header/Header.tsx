'use client';

import { useEffect, useRef, useState } from 'react';
import type { FocusEvent, PointerEvent } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { routes } from '@/app/routes';
import { getShortcutHints } from '@/defaultData/shortcutHints';
import { PagesEnum } from '@/types/enums/pagesEnums';
import Logo from './Logo/Logo';
import BackArrow from '../TopSection/BackArrow/BackArrow';
import PlanetIcon from '../../../public/planet-icon';
import OldTopSection from '../OldTopSection/OldTopSection';
import s from './Header.module.scss';

const shortcuts = [
  { id: 'travel', name: 'Travel Resources', href: '/travel-resources' },
  { id: 'planet', name: 'Uncharted Planet', href: '/uncharted-planet' },
  { id: 'games', name: 'Games on the Go', href: '/daily-journal-of-your-price-booking-service-history#game-zone' },
  { id: 'booking', name: 'Your Price Booking', href: 'https://www.yourpricebooking.com/' },
] as const;

export default function Header() {
  const pathname = usePathname();
  const params = useParams();
  const [hintTarget, setHintTarget] = useState<string | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const activeLink = pathname.split('/')[1];
  const hints = getShortcutHints(activeLink);
  const backCountry = routes.some((route) => route.path === activeLink) ? activeLink : '';
  const isDailyJournal = pathname.startsWith('/daily-journal-of-your-price-booking-service-history');
  const isPostPage = Boolean(params.postPageLink) || isDailyJournal;

  const clearTimers = () => {
    if (showTimer.current !== null) clearTimeout(showTimer.current);
    if (hideTimer.current !== null) clearTimeout(hideTimer.current);
    showTimer.current = null;
    hideTimer.current = null;
  };
  const closeHint = () => {
    clearTimers();
    setHintTarget(null);
  };
  const scheduleShow = (id: string) => {
    clearTimers();
    showTimer.current = setTimeout(() => { setHintTarget(id); showTimer.current = null; }, 1000);
  };
  const scheduleHide = () => {
    clearTimers();
    hideTimer.current = setTimeout(() => { setHintTarget(null); hideTimer.current = null; }, 1000);
  };

  useEffect(() => {
    closeHint();
    return clearTimers;
  }, [pathname]);

  useEffect(() => {
    const dismiss = (event: globalThis.PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) closeHint();
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);

  if (activeLink === PagesEnum.SEARCH_DATA_PAGE) {
    return <OldTopSection isLink isSearchField isWhite showSubtitle={false} />;
  }

  return (
    <header ref={headerRef} className={`${s.header} ${isDailyJournal ? s.historyArrow : ''}`}>
      {isDailyJournal && <div className={s.back}><BackArrow country={backCountry} /></div>}
      {!isDailyJournal && (
        <div className={s.headerContent}>
          <div className={s.logo}><Logo /></div>
          <nav className={s.navMenu} aria-label="Sections">
            {routes.filter((route) => route.path !== 'uncharted-planet').map((route) => (
              <Link
                key={route.path}
                href={`/${route.path}`}
                style={{ gridArea: route.path || 'home' }}
                className={`${s.navLink} ${activeLink === route.path ? s.active : ''}`}
                aria-current={activeLink === route.path ? 'page' : undefined}
              >{route.name}</Link>
            ))}
            {isPostPage && <div className={s.back}><BackArrow country={backCountry} /></div>}
          </nav>
          <div className={s.shortcuts}>
            {shortcuts.map((item) => (
              <div
                key={item.id}
                className={s.shortcut}
                onPointerEnter={(event: PointerEvent<HTMLDivElement>) => {
                  if (event.pointerType === 'mouse') scheduleShow(item.id);
                }}
                onPointerLeave={(event: PointerEvent<HTMLDivElement>) => {
                  if (event.pointerType === 'mouse') scheduleHide();
                }}
              >
                <a
                  href={item.href}
                  target={item.id === 'booking' ? '_blank' : undefined}
                  rel={item.id === 'booking' ? 'noopener noreferrer' : undefined}
                  className={`${s.pill} ${item.id === 'booking' ? s.booking : ''} ${pathname === item.href ? s.selected : ''}`}
                  onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
                    if (event.currentTarget.matches(':focus-visible')) scheduleShow(item.id);
                  }}
                  onBlur={scheduleHide}
                  onPointerDown={(event) => { if (event.pointerType !== 'mouse') closeHint(); }}
                  onKeyDown={(event) => { if (event.key === 'Escape') closeHint(); }}
                  aria-describedby={hintTarget === item.id ? `header-hint-${item.id}` : undefined}
                >
                  {item.id === 'planet' && <PlanetIcon />}
                  {item.name}
                </a>
                {hintTarget === item.id && (
                  <div id={`header-hint-${item.id}`} role="tooltip" lang={hints.lang} className={s.hint}>{hints[item.id]}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
