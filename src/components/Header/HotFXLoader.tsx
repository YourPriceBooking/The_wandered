'use client';

import '@/lib/hotfx-shy-header';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function HotFXLoader() {
  const pathname = usePathname();
  useEffect(() => {
    document.querySelector('hotfx-shy-header')?.dispatchEvent(new Event('shy-header-reset'));
  }, [pathname]);
  useEffect(() => {
    const updateSpacerHeight = () => {
      const header = document.querySelector('hotfx-shy-header') as HTMLElement;
      if (!header) return;

      const height = header.offsetHeight;
      document.documentElement.style.setProperty(
        '--shy-header-height',
        `${height}px`
      );
    };

    const header = document.querySelector('hotfx-shy-header');
    const observer = new ResizeObserver(updateSpacerHeight);
    if (header) observer.observe(header);
    updateSpacerHeight();
    window.addEventListener('resize', updateSpacerHeight);

    return () => {
      window.removeEventListener('resize', updateSpacerHeight);
      observer.disconnect();
    };
  }, []);

  return null;
}
