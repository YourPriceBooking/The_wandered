'use client';
import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import type { AuthorType } from '@/types/authorTypes';
import Link from 'next/link';
import style from './PostBlock.module.scss';

export default function PostAuthor({ name }: { name: string }) {
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
  const authorRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const allAuthors = useAppSelector((state) => state.allAuthors.allAuthorsData || []);
  const currentAuthor = name
    ? allAuthors.find((author: AuthorType) => author.name === name)
    : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        authorRef.current &&
        tooltipRef.current &&
        !authorRef.current.contains(event.target as Node) &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setTooltipVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setTooltipVisible]);

  const rawLinks = currentAuthor?.links;

  let links: any[] = [];

  try {
    if (rawLinks) {
      const parsed = JSON.parse(rawLinks);
      if (Array.isArray(parsed)) {
        links = parsed;
      }
    }
  } catch (e) {
    console.error('Invalid JSON in author.links:', rawLinks);
  }

  return (
        <div ref={authorRef} style={{ position: 'relative' }}>
          <p
            className={`${style.post__author} ${tooltipVisible ? style.visible : ''}`}
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
          >
            {name}
          </p>

          {currentAuthor && (
            <div
              ref={tooltipRef}
              className={`${style.authorTooltipWrapper} ${tooltipVisible ? style.visible : ''}`}
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
            >
              <div className={style.authorTooltip}>
                <div className={style.tooltipMainInfo}>
                  <img
                    className={style.tooltipMainImg}
                    src={currentAuthor.image}
                    alt="Author Photo"
                    onError={(e) => (e.currentTarget.src = '/no-photo.webp')}
                  />
                  <div>
                    <p className={style.tooltipName}>{currentAuthor.name}</p>
                    <div className={style.tooltipLinks}>
                      {links.map((link: any, index: number): React.ReactNode => {
                        const platform = Object.keys(link)[0] as string;
                        const url = Object.values(link)[0] as string | undefined;

                        if (!url) return null;

                        return (
                          <Link key={index} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={`/social_media_icons/${platform}-logo.svg`} alt={platform} />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <p className={style.tooltipBio}>{currentAuthor.description}</p>
              </div>
            </div>
          )}
        </div>
  );
}
