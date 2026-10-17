'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { usePathname } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';

export default function RouteLoader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [splash, setSplash] = useState({ visible: true, fading: false, generation: 0 });
  const fadeTimer = useRef<ReturnType<typeof setTimeout>>();
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const committedPath = useRef(pathname);

  const clearTimers = useCallback(() => {
    clearTimeout(fadeTimer.current);
    clearTimeout(hideTimer.current);
  }, []);

  const start = useCallback(() => {
    clearTimers();
    // Remount at full opacity, including when another navigation interrupts a fade.
    setSplash((previous) => ({ visible: true, fading: false, generation: previous.generation + 1 }));
  }, [clearTimers]);

  useLayoutEffect(() => {
    committedPath.current = pathname;
    start();
    fadeTimer.current = setTimeout(() => {
      setSplash((previous) => ({ ...previous, fading: true }));
      hideTimer.current = setTimeout(() => setSplash((previous) => ({ ...previous, visible: false })), 500);
    }, 800);
    return clearTimers;
  }, [pathname, start, clearTimers]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;
      // Cover the current page before either Next Link or a native link can navigate.
      flushSync(start);
    };
    const onPopState = () => {
      if (window.location.pathname !== committedPath.current) flushSync(start);
    };
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState);
    };
  }, [start]);

  return <>{splash.visible && <LoadingScreen key={splash.generation} fadeOut={splash.fading} />}{children}</>;
}
