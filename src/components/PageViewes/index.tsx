'use client'
import { useAppSelector } from '@/lib/hooks';
import { PostPageProps } from '@/types/postTypes';
import React from 'react'

const PageViewes = ({country, postPageLink}:PostPageProps) => {
    const pageviews = useAppSelector((state: any) => state.gaData.pageviews || {});
        let slug = String(postPageLink);
        try { slug = decodeURIComponent(slug); } catch { /* Literal percent signs are valid in a stored slug. */ }
        const pageViewsByUrl = `/${country !== 'home' ? country + '/' : ''}${slug}`;
  return (
    <p>{pageviews[pageViewsByUrl] || 0}</p>
  )
}

export default PageViewes
