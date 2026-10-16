'use client';

import '@/lib/hotfx-shy-header';
import { useEffect } from 'react';

export default function HotFXLoader() {
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
