"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen";

export default function RouteLoader({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => setIsVisible(false), 500);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsVisible(true);
    setIsFading(false);
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => setIsVisible(false), 500);
    }, 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {isVisible && <LoadingScreen fadeOut={isFading} />}
      <div style={{ visibility: isVisible ? "hidden" : "visible" }}>{children}</div>
    </>
  );
}
