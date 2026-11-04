'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import HouseIcon from '../../../public/HouseIcon';
import BackArrow from '../TopSection/BackArrow/BackArrow';
import SearchField from './SearchField/SearchField';
import { getHeaderCopy, travelTools } from '@/defaultData/headerNavigation';
import s from './Header.module.scss';

const countries = ['ukraine', 'poland', 'usa', 'canada', 'australia', 'singapore'];
const journalPath = '/daily-journal-of-your-price-booking-service-history';

function ToolIcon({ index }: { index: number }) {
  const paths = [
    'm22 2-7 20-4-9-9-4L22 2ZM22 2 11 13',
    'M12 2v2m7 1-1.5 1.5M22 12h-2M5 5l1.5 1.5M2 12h2m5 1a5 5 0 1 1 9 3M6 20a4 4 0 1 1 1-8 5 5 0 0 1 9 3h1a2.5 2.5 0 0 1 0 5H6Z',
    'M4 3h16v18H4V3Zm4 4h8M8 11h8m-8 4h3m3 0h2m-8 3h8',
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18ZM5 7h14M5 17h14',
  ];
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
      <path d={paths[index]} />
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
  const countryActive = countries.includes(section);
  const authorsPath =
    section === 'ukraine' || section === 'poland' ? `/${section}/authors` : '/authors';
  const onArticle = Boolean(params.postPageLink);
  const showBack = onArticle || pathname.startsWith(journalPath);
  const backCountry = countryActive || section === 'uncharted-planet' ? section : '';
  const links = [
    { href: '/', text: copy.home, active: pathname === '/' },
    { href: '/uncharted-planet', text: copy.planet, active: section === 'uncharted-planet' },
    { href: journalPath, text: copy.journal, active: pathname.startsWith(journalPath) },
    { href: authorsPath, text: copy.authors, active: pathname.endsWith('/authors') },
    { href: `${journalPath}#game-zone`, text: copy.games, active: false },
  ];

  const closeMenus = () => {
    root.current
      ?.querySelectorAll('details[open]')
      .forEach((details) => details.removeAttribute('open'));
    setSearchOpen(false);
  };
  useEffect(() => {
    closeMenus();
  }, [pathname]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      root.current?.querySelectorAll('details[open]').forEach((details) => {
        if (!details.contains(event.target as Node)) details.removeAttribute('open');
      });
      if (!root.current?.contains(event.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  useEffect(() => {
    if (searchOpen) searchPanel.current?.querySelector('input')?.focus();
  }, [searchOpen]);

  const renderLink = (link: (typeof links)[number]) => (
    <Link
      href={link.href}
      className={`${s.navLink} ${link.active ? s.active : ''}`}
      aria-current={link.active ? 'page' : undefined}
      onClick={closeMenus}
    >
      {link.text}
    </Link>
  );
  const countryLinks = countries.map((country, index) => (
    <Link
      key={country}
      href={`/${country}`}
      aria-current={
        section === country && !onArticle && !pathname.endsWith('/authors') ? 'page' : undefined
      }
      className={section === country ? s.currentCountry : ''}
      onClick={closeMenus}
    >
      {copy.countryNames[index]}
    </Link>
  ));

  return (
    <div
      className={s.headerShell}
      ref={root}
      lang={copy.lang}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        const openDetails = (event.target as Element).closest('details[open]');
        closeMenus();
        if (openDetails) openDetails.querySelector('summary')?.focus();
        else if (searchOpen) searchButton.current?.focus();
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
            href="https://www.yourpricebooking.com/"
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
                if (event.currentTarget.open) setSearchOpen(false);
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node))
                  event.currentTarget.open = false;
              }}
            >
              <summary className={s.iconButton} aria-label={copy.menu}>
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </summary>
              <nav className={s.mobilePanel} aria-label={copy.navigation}>
                {renderLink(links[0])}
                <p>{copy.destinations}</p>
                <div className={s.mobileCountries}>{countryLinks}</div>
                {links.slice(1).map((link) => (
                  <div key={link.href}>{renderLink(link)}</div>
                ))}
                <a href="/travel-resources" onClick={closeMenus}>
                  {copy.tools}
                </a>
                <a
                  href="https://www.yourpricebooking.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.booking} ↗
                </a>
                {showBack && <BackArrow country={backCountry} />}
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
          {renderLink(links[0])}
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
          {links.slice(1).map((link) => (
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
          <div className={s.toolLinks}>
            {travelTools.map((id, index) => (
              <Link
                href={`/travel-resources#${id}`}
                key={id}
                className={s.toolLink}
                onClick={closeMenus}
              >
                <ToolIcon index={index} />
                <span>{copy.toolNames[index]}</span>
                <span className={s.toolArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
