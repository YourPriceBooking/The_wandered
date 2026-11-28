'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import HouseIcon from '../../../public/HouseIcon';
import BackArrow from '../TopSection/BackArrow/BackArrow';
import SearchField from './SearchField/SearchField';
import { authorsPath } from '@/defaultData/authorsCopy';
import { getHeaderCopy, travelTools } from '@/defaultData/headerNavigation';
import { journalPath } from '@/utils/journalSeo';
import s from './Header.module.scss';

const bookingUrl = 'https://www.yourpricebooking.com/';

const iconPaths = {
  'live-flights-map': 'm22 2-7 20-4-9-9-4L22 2ZM22 2 11 13',
  'global-weather': 'M12 2v2m7 1-1.5 1.5M22 12h-2M5 5l1.5 1.5M2 12h2m5 1a5 5 0 1 1 9 3M6 20a4 4 0 1 1 1-8 5 5 0 0 1 9 3h1a2.5 2.5 0 0 1 0 5H6Z',
  'travel-news-trends': 'M4 3h16v18H4V3Zm4 4h8M8 11h8m-8 4h3m3 0h2m-8 3h8',
  'explore-world-map': 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18ZM5 7h14M5 17h14',
  booking: 'M3 4v16m18-8v8M3 16h18M6 12V8h4v4H6Zm7 0V8h5a3 3 0 0 1 3 3v1H3',
  external: 'M5 19 19 5M6 5h13v13',
  games: 'M8 7h8c3 0 4 2 5 6l1 4c.5 3-2 4-4 2l-3-3H9l-3 3c-2 2-4.5 1-4-2l1-4c1-4 2-6 5-6Zm0 3v4m-2-2h4m6-1h.01m2 2h.01',
  authors: 'm4 15-1 6 6-1L21 8l-5-5L4 15Zm9-9 5 5',
};

function NavigationIcon({ name }: { name: keyof typeof iconPaths }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const params = useParams();
  const section = pathname.split('/')[1] || 'home';
  const copy = getHeaderCopy(section);
  const root = useRef<HTMLDivElement>(null);
  const searchPanel = useRef<HTMLDivElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const countryActive = Object.keys(copy.countryNames).includes(section);
  const authorsHref = authorsPath(section);
  const onArticle = Boolean(params.postPageLink);
  const showBack = onArticle || pathname.startsWith(journalPath);
  const backCountry = countryActive || section === 'uncharted-planet' ? section : '';
  const stories = { href: '/', text: copy.home, active: pathname === '/' };
  const homeArticle = onArticle && !countryActive && section !== 'uncharted-planet';
  const planet = { href: '/uncharted-planet', text: copy.planet, active: section === 'uncharted-planet' };
  const authors = { href: authorsHref, text: copy.authors, active: pathname === authorsHref };
  const games = { href: `${journalPath}#game-zone`, text: copy.games, active: false };

  const closeMenus = useCallback(() => {
    root.current
      ?.querySelectorAll('details[open]')
      .forEach((details) => details.removeAttribute('open'));
    setSearchOpen(false);
  }, []);
  useEffect(() => {
    closeMenus();
  }, [pathname, closeMenus]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      root.current?.querySelectorAll('details[open]').forEach((details) => {
        if (!details.contains(event.target as Node)) details.removeAttribute('open');
      });
      if (!root.current?.contains(event.target as Node)) setSearchOpen(false);
    };
    const mobile = window.matchMedia('(max-width: 760px)');
    mobile.addEventListener('change', closeMenus);
    window.addEventListener('popstate', closeMenus);
    document.addEventListener('pointerdown', outside);
    return () => {
      mobile.removeEventListener('change', closeMenus);
      window.removeEventListener('popstate', closeMenus);
      document.removeEventListener('pointerdown', outside);
    };
  }, [closeMenus]);
  useEffect(() => {
    if (searchOpen) searchPanel.current?.querySelector('input')?.focus();
  }, [searchOpen]);

  const renderLink = (link: typeof stories, icon?: 'games' | 'authors') => (
    <Link
      href={link.href}
      className={`${s.navLink} ${link.active ? s.active : ''}`}
      aria-current={link.active ? (pathname === link.href ? 'page' : 'location') : undefined}
      onClick={closeMenus}
    >
      {icon && <NavigationIcon name={icon} />}
      {link.text}
      {icon && <span className={s.chevron} aria-hidden="true">›</span>}
    </Link>
  );
  const countryLinks = Object.entries(copy.countryNames).map(([country, name]) => (
    <Link
      key={country}
      href={`/${country}`}
      aria-current={
        pathname === `/${country}` ? 'page' : section === country && onArticle ? 'location' : undefined
      }
      className={section === country ? s.currentCountry : ''}
      onClick={closeMenus}
    >
      {name}
    </Link>
  ));
  const toolLinks = travelTools.map((id, index) => (
    <Link href={`/travel-resources#${id}`} key={id} className={s.toolLink} onClick={closeMenus}>
      <NavigationIcon name={id} />
      <span>{copy.toolNames[index]}</span>
      <span className={s.toolArrow} aria-hidden="true">→</span>
    </Link>
  ));

  return (
    <div
      className={s.headerShell}
      data-fragment-links={pathname === '/travel-resources' || pathname === journalPath || undefined}
      ref={root}
      lang={copy.lang}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        const openDetails = (event.target as Element).closest('details[open]');
        closeMenus();
        if (openDetails) openDetails.querySelector('summary')?.focus({ preventScroll: true });
        else if (searchOpen) searchButton.current?.focus({ preventScroll: true });
      }}
    >
      <hotfx-shy-header data-pinned="true">
        <header className={s.masthead}>
          <Link href="/" className={s.brand} aria-label="The Wandered — Home" onClick={closeMenus}>
            <HouseIcon width={36} color="#b74719" />
            <span>the wandered</span>
          </Link>
          <div className={s.desktopSearch}>
            <Suspense fallback={<div className={s.searchFallback} />}>
              <SearchField variant="header" placeholder={copy.placeholder} onSearch={closeMenus} />
            </Suspense>
          </div>
          <a
            href={bookingUrl}
            className={s.publisher}
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.booking}
            <span aria-hidden="true"> ↗</span>
          </a>
          <div className={s.mobileActions}>
            <button
              type="button"
              className={s.iconButton}
              ref={searchButton}
              aria-label={copy.search}
              aria-expanded={searchOpen}
              aria-controls="header-search-panel"
              onClick={() => {
                root.current
                  ?.querySelectorAll('details[open]')
                  .forEach((d) => d.removeAttribute('open'));
                setSearchOpen((open) => !open);
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <circle cx="10.5" cy="10.5" r="7" />
                <path d="m16 16 5 5" />
              </svg>
            </button>
            <details
              className={s.mobileMenu}
              onToggle={(event) => {
                if (event.currentTarget.open) {
                  setSearchOpen(false);
                  const panel = event.currentTarget.querySelector('nav');
                  if (panel) panel.scrollTop = 0;
                }
              }}
              onBlur={(event) => {
                if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node))
                  event.currentTarget.open = false;
              }}
            >
              <summary className={s.iconButton} aria-controls="mobile-navigation">
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path className={s.whenClosed} d="M3 6h18M3 12h18M3 18h18" />
                  <path className={s.whenOpen} d="m5 5 14 14M19 5 5 19" />
                </svg>
                <span className={`${s.srOnly} ${s.whenClosed}`}>{copy.menu}</span>
                <span className={`${s.srOnly} ${s.whenOpen}`}>{copy.closeMenu}</span>
              </summary>
              <nav className={s.mobilePanel} id="mobile-navigation" aria-label={copy.navigation}>
                <a href={bookingUrl} className={s.booking} target="_blank" rel="noopener noreferrer" onClick={closeMenus}>
                  <NavigationIcon name="booking" />
                  <span><strong>{copy.booking}</strong><small>{copy.bookingDescription}</small></span>
                  <NavigationIcon name="external" />
                </a>
                <h2 className={s.menuHeading}>{copy.sections}</h2>
                <div className={s.mobileSections}>
                  {renderLink({ ...stories, active: stories.active || homeArticle })}
                  {renderLink(planet)}
                  <div className={s.mobileCountries}>{countryLinks}</div>
                </div>
                <div className={s.gameRow}>{renderLink(games, 'games')}</div>
                <div className={s.toolsHeading}>
                  <h2 className={s.menuHeading}>{copy.mobileTools}</h2>
                  <Link href="/travel-resources" aria-label={copy.allTools} onClick={closeMenus}>
                    {copy.all} <span aria-hidden="true">→</span>
                  </Link>
                </div>
                <div className={s.mobileToolGrid}>{toolLinks}</div>
                <div className={s.menuFooter}>
                  {renderLink(authors, 'authors')}
                  {showBack && <BackArrow country={backCountry} />}
                </div>
              </nav>
            </details>
          </div>
          <div
            id="header-search-panel"
            ref={searchPanel}
            className={s.searchPanel}
            hidden={!searchOpen}
          >
            <Suspense fallback={<div className={s.searchFallback} />}>
              <SearchField variant="header" placeholder={copy.placeholder} onSearch={closeMenus} />
            </Suspense>
          </div>
        </header>
      </hotfx-shy-header>
      <div className="shy-header-spacer" />
      <div className={s.navigation}>
        <nav className={s.desktopNav} aria-label={copy.navigation}>
          {renderLink(stories)}
          <details
            className={s.destinations}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node))
                event.currentTarget.open = false;
            }}
          >
            <summary className={`${s.navLink} ${countryActive ? s.active : ''}`}>
              {copy.destinations}
              <span aria-hidden="true">⌄</span>
            </summary>
            <div className={s.countryPanel}>{countryLinks}</div>
          </details>
          {[planet, authors, games].map((link) => (
            <div key={link.href}>{renderLink(link)}</div>
          ))}
          {showBack && <BackArrow country={backCountry} />}
        </nav>
        <div className={s.mobileSearch}>
          <Suspense fallback={<div className={s.searchFallback} />}>
            <SearchField variant="header" placeholder={copy.placeholder} onSearch={closeMenus} />
          </Suspense>
        </div>
        <nav className={s.tools} aria-label={copy.tools}>
          <a
            href="/travel-resources"
            className={`${s.toolsLabel} ${section === 'travel-resources' ? s.active : ''}`}
            aria-current={section === 'travel-resources' ? 'page' : undefined}
          >
            {copy.tools}
          </a>
          <div className={s.toolLinks}>{toolLinks}</div>
        </nav>
      </div>
    </div>
  );
}
