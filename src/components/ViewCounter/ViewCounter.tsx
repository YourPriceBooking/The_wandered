'use client';

import React from 'react';
import { useAppSelector } from '@/lib/hooks';
import s from './ViewCounter.module.scss';

type Props = {
  viewPath?: string;
  prefix?: string;
  className?: string;
};

const ViewCounter: React.FC<Props> = ({ viewPath, prefix = '', className }) => {
  const pageviews = useAppSelector((state: any) => state.gaData.pageviews || {});
  const views = viewPath ? Number(pageviews[viewPath] ?? 0) : 0;

  return (
    <div className={s.countWrapper} title="views">
     {views}
      <img className={s.eye} src="/colorEye.svg" alt="views icon" />
      <div className={s.lightVeil} />
    </div>
  );
};

export default ViewCounter;