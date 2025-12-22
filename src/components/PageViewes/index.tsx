'use client'
import { useAppSelector } from '@/lib/hooks';
import { PostPageProps } from '@/types/postTypes';
import React from 'react'

const PageViewes = ({country, postPageLink}:PostPageProps) => {
    const pageviews = useAppSelector((state: any) => state.gaData.pageviews || {});
        const pageViewsByUrl = `/${country !== 'home' ? country + '/' : ''}${decodeURI(
            String(postPageLink),
        )}`;
        console.log('PageViewes rendered for path:', pageViewsByUrl);
  return (
    <p>{pageviews[pageViewsByUrl] || 0}</p>
  )
}

export default PageViewes