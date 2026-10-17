'use client';
import { authorsCopy } from '@/defaultData/authorsCopy';
import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { authorProfile } from '@/utils/authorIdentity';
import { fallbackAuthors, authorSocialLinks } from '@/defaultData/authorProfiles';
import type { AuthorType } from '@/types/authorTypes';
import Link from 'next/link';
import style from './PostBlock.module.scss';

export default function PostAuthor({ name, country }: { name: string; country: string }) {
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
  const authorRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const allAuthors = useAppSelector((state) => state.allAuthors.allAuthorsData || []);
  const currentAuthor = name
    ? (allAuthors.find((author: AuthorType) => author.name === name) || fallbackAuthors.find((author) => author.name === name))
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

  const copy = authorsCopy[country === 'ukraine' ? 'uk' : country === 'poland' ? 'pl' : 'en'];
  const bio = name === 'Viacheslav Nikitenko' ? copy.editorBio : name === 'Andy Ray' ? copy.andyBio : '';
  const profile = authorProfile(name, country);
  const links = authorSocialLinks(currentAuthor?.links);
  return (
        <div ref={authorRef} style={{ position: 'relative' }} onFocusCapture={() => setTooltipVisible(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setTooltipVisible(false); }} onKeyDown={(event) => { if (event.key === 'Escape') setTooltipVisible(false); }}>
          <div
            className={`${style.post__author} ${tooltipVisible ? style.visible : ''}`}
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
          >
            {profile ? <a href={profile.url}>{name}</a> : name}
          </div>

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
                    alt={name}
                    onError={(e) => (e.currentTarget.src = '/no-photo.webp')}
                  />
                  <div>
                    <p className={style.tooltipName}>{currentAuthor.name}</p>
                    <div className={style.tooltipLinks}>
                      {links.map((link) => <Link key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</Link>)}
                    </div>
                  </div>
                </div>
                <p className={style.tooltipBio}>{bio || currentAuthor.description}</p>
              </div>
            </div>
          )}
        </div>
  );
}
