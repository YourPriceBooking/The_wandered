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
const normalizePathForViews = (url: string) => {
  const cleaned = String(url || '')
    .replace(/^https?:\/\/[^/]+/, '') // срезаем домен
    .replace(/\/{2,}/g, '/');        // убираем двойные слэши

  const [pathOnly] = cleaned.split(/[?#]/); // срезаем query/hash
  let path = pathOnly || '/';

  if (!path.startsWith('/')) path = '/' + path;
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path;
};

const ViewCounter: React.FC<Props> = ({ country, viewPath, prefix = '', className }) => {
  const pageviews = useAppSelector((state: any) => state.gaData.pageviews || {});
  const safeCountry = (country || '').replace(/^\/+|\/+$/g, '');
  const normalized = normalizePathForViews(viewPath || '/');
  const lookupPath = normalized === '/' ? '/' : normalized.replace(/\/$/, '');
  const views = Number(pageviews[lookupPath] ?? pageviews[normalized] ?? 0);
  let pageViewsCountryArg = safeCountry || 'home';
  let pageViewsLinkArg = normalized.replace(new RegExp(`^\\/${safeCountry}\\/?`), '').replace(/^\/+/, '');
  if (lookupPath === `/${safeCountry}`) {
    pageViewsCountryArg = 'home';
    pageViewsLinkArg = safeCountry;
  }
  if (lookupPath === '/') {
    pageViewsCountryArg = 'home';
    pageViewsLinkArg = '';
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