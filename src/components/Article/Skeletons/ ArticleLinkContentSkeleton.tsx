'use client';
import Skeleton from '@/components/ui/Skeleton';
import s from '../Article.module.scss';

export default function ArticleLinkContentSkeleton() {
  return <div className={s.linkContentSkeleton}>
    <Skeleton width="90px" height="14px" />
    <Skeleton width="85%" height="32px" />
    <Skeleton width="100%" height="42px" />
    <div className={s.imageSkeleton}><Skeleton width="100%" height="100%" borderRadius="0" /></div>
    <Skeleton width="180px" height="16px" />
  </div>;
}
