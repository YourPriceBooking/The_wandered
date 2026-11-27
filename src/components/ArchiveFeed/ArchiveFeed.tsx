'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import type { postsDataType } from '@/types/postTypes';
import { documentLanguage } from '@/utils/documentLanguage';
import { ARTICLE_PAGE_SIZE, pagePath } from '@/utils/pagination';
import ArchiveCard from './ArchiveCard';
import s from './ArchiveFeed.module.scss';

type ArchivePage = postsDataType & { page: number };
const copy = {
  en: { more: 'Show more', loading: 'Loading…', error: 'Could not load more stories. Please try again.', previous: 'Previous stories' },
  uk: { more: 'Показати ще', loading: 'Завантаження…', error: 'Не вдалося завантажити статті. Спробуйте ще раз.', previous: 'Попередні статті' },
  pl: { more: 'Pokaż więcej', loading: 'Wczytywanie…', error: 'Nie udało się wczytać artykułów. Spróbuj ponownie.', previous: 'Poprzednie artykuły' },
};

export default function ArchiveFeed({ section, initial, className }: {
  section: string; initial: ArchivePage; className: string;
}) {
  const path = section === 'home' ? '/' : `/${section}`;
  const entry = pagePath(path, initial.page);
  const labels = copy[documentLanguage(path)];
  const hasFeatured = section === 'home' && initial.page === 1;
  const [feed, setFeed] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const container = useRef<HTMLDivElement>(null);
  const request = useRef<AbortController | null>(null);
  const afterRender = useRef<null | { scrollY: number } | { cardIndex: number }>(null);

  const loadThrough = useCallback(async (current: ArchivePage, through: number, scrollY?: number) => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setStatus('loading');
    const ids = new Set(current.result.map((post) => post._id));
    const result = [...current.result];
    let { page, total } = current;
    try {
      while (page < through && page * ARTICLE_PAGE_SIZE < total) {
        const query = new URLSearchParams({ section, page: String(page + 1) });
        const response = await fetch(`/api/article-feed?${query}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Archive request failed');
        const batch: postsDataType = await response.json();
        if (controller.signal.aborted) return;
        for (const post of batch.result) {
          if (!ids.has(post._id)) {
            ids.add(post._id);
            result.push(post);
          }
        }
        page++;
        total = batch.total;
      }
      afterRender.current = scrollY === undefined
        ? { cardIndex: container.current?.querySelectorAll('article').length ?? 0 }
        : { scrollY };
      setFeed({ result, total, page });
      setStatus('idle');
    } catch {
      if (!controller.signal.aborted) setStatus('error');
    } finally {
      if (request.current === controller) request.current = null;
    }
  }, [section]);

  // Only the depth and position belong in this history entry. A fresh visit starts at 27.
  useEffect(() => {
    const saved = window.history.state?.wanderedArchive;
    if (saved?.entry === entry && Number.isSafeInteger(saved.page) && saved.page > initial.page && Number.isFinite(saved.scrollY)) {
      void loadThrough(initial, Math.min(saved.page, Math.ceil(initial.total / ARTICLE_PAGE_SIZE)), saved.scrollY);
    }
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, [entry, initial, loadThrough]);

  useEffect(() => {
    if (feed.page <= initial.page) return;
    const remember = () => {
      window.history.replaceState({
        ...window.history.state, wanderedArchive: { entry, page: feed.page, scrollY: window.scrollY },
      }, '');
    };
    const rememberLink = (event: Event) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (link instanceof HTMLAnchorElement && link.origin === window.location.origin && link.pathname !== path) remember();
    };
    // Next links may leave this archive without unloading its document.
    document.addEventListener('click', rememberLink, true);
    window.addEventListener('pagehide', remember);
    return () => {
      document.removeEventListener('click', rememberLink, true);
      window.removeEventListener('pagehide', remember);
    };
  }, [entry, feed.page, initial.page, path]);

  useLayoutEffect(() => {
    const target = afterRender.current;
    afterRender.current = null;
    if (!target) return;
    if ('scrollY' in target) window.scrollTo(0, target.scrollY);
    else container.current?.querySelectorAll('article')[target.cardIndex]?.querySelector<HTMLAnchorElement>('h2 a')?.focus({ preventScroll: true });
  }, [feed]);

  function showMore(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    void loadThrough(feed, feed.page + 1);
  }

  const articles = hasFeatured ? feed.result.slice(1) : feed.result;
  const hasMore = feed.page * ARTICLE_PAGE_SIZE < feed.total;
  return (
    <div ref={container} className={className}>
      {initial.page > 1 && <a className={s.previous} rel="prev" href={pagePath(path, initial.page - 1)}>← {labels.previous}</a>}
      {articles.map((post, index) => (
        <ArchiveCard key={post._id} section={section} post={post} priority={!hasFeatured && index === 0} />
      ))}
      {hasMore && (
        <div className={s.controls}>
          <a className={s.more} rel="next" href={pagePath(path, feed.page + 1)} onClick={showMore} aria-disabled={status === 'loading' || undefined}>
            {status === 'loading' ? labels.loading : labels.more}
          </a>
          <span role="status">{status === 'error' ? labels.error : ''}</span>
        </div>
      )}
    </div>
  );
}
