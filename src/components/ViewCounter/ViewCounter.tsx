'use client';

import React from 'react';
import { useAppSelector } from '@/lib/hooks';
import s from './ViewCounter.module.scss';
import PageViewes from '../PageViewes';
type Props = {
  country?: string;
  viewPath?: string;
  prefix?: string;
  className?: string;
};

const ViewCounter: React.FC<Props> = ({ country, viewPath, prefix = '', className }) => {
  const pageviews = useAppSelector((state: any) => state.gaData.pageviews || {});
  const safeCountry = (country || '').replace(/^\/+|\/+$/g, '');
  const normalized = String(viewPath || '').replace(/^https?:\/\/[^/]+/, '').replace(/\/{2,}/g, '/');
  const lookupPath = normalized.replace(/\/$/, '');
  const views = Number(pageviews[lookupPath] ?? pageviews[normalized] ?? 0);
  console.log('ViewCounter rendered with views:', views, 'for path:', lookupPath);
  let pageViewsCountryArg = safeCountry || 'home';
  let pageViewsLinkArg = normalized.replace(new RegExp(`^\\/${safeCountry}\\/?`), '').replace(/^\/+/, '');
  if (lookupPath === `/${safeCountry}`) {
    pageViewsCountryArg = 'home';
    pageViewsLinkArg = safeCountry;
  }
  console.log(`pageViewsLinkArg is "${pageViewsLinkArg}"`);
  return (
    <div className={s.countWrapper} title="views">
     <PageViewes country={pageViewsCountryArg} postPageLink={pageViewsLinkArg} />
      <img className={s.eye} src="/colorEye.svg" alt="views icon" />
      <div className={s.lightVeil} />
    </div>
  );
};

export default ViewCounter;