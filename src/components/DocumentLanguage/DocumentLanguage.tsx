'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { documentLanguage } from '@/utils/documentLanguage';

// The root layout persists across client navigation; keep its language in sync.
export default function DocumentLanguage() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = documentLanguage(pathname);
  }, [pathname]);
  return null;
}
