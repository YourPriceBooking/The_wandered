'use client';
import React from 'react';
import s from './BackArrow.module.scss';
import BackArrowIcon from './BackArrowIcon/BackArrowIcon';
import { useRouter } from 'next/navigation';

interface BackArrowProps {
  className?: string;
  country?: string;
}
const BackArrow: React.FC<BackArrowProps> = ({ country }) => {
  const router = useRouter();

  const handleGoBack = async () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push(country ? `/${country}` : '/');

      window.scrollTo(0, 0);
    }
  };
  return (
    <div onClick={handleGoBack} className={s.backArrowBox}>
      <BackArrowIcon />
    </div>
  );
};

export default BackArrow;
