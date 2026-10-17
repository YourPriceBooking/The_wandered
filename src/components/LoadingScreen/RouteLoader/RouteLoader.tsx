'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';

export default function RouteLoader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setIsFading(false);
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
      hideTimer = setTimeout(() => setIsVisible(false), 500);
    }, 800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname]);

  return <>{isVisible && <LoadingScreen fadeOut={isFading} />}{children}</>;
}
