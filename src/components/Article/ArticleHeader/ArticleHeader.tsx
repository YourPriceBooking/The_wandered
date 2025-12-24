"use client"
import s from './ArticleHeader.module.scss';
import { AuthorType } from '@/types/authorTypes';
import Link from 'next/link';
import { useAppSelector } from '@/lib/hooks';
import { useEffect, useRef, useState } from 'react';
import { getArticleDate } from '@/services/getArticleDate';

type ArticleHeaderProps = {
  author: string;
  date: string;
  updated: string;
  slug: string;
//   authorData: AuthorType[];
  isSuggested?: boolean;
  country?: string;
};

const ArticleHeader: React.FC<ArticleHeaderProps> = ({
  author,
  date,
  updated,
  slug,
  country,
//   authorData,

}) => {
	const authors = useAppSelector((state: any) => state.allAuthors.allAuthorsData || []);
  const currentAuthor = authors.find((repo: AuthorType) => repo.name === author);


  const pageviews = useAppSelector((state: any) => state.gaData.pageviews || {});
  const readableDate = getArticleDate(date, country);

  const authorRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  

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

  if (!mounted || !currentAuthor) return ( 
    <header className={`${s.articleBlock} ${s.skeleton}`}>  
          <div className={s.skeletonHeader}></div>
          <div className={s.skeletonAuthor}></div> 
    </header>)
  const parsedLinks = currentAuthor.links;
  return (
    <header className={s.authorBlock}>
    <div
      className={`${s.authorTooltipWrapper} ${tooltipVisible ? s.visible : ''}`}
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      <div className={s.authorTooltip}>
        <div className={s.tooltipMainInfo}>
          <img
            className={s.tooltipMainImg}
            src={currentAuthor.image}
            alt="Author Photo"
            onError={(e) => (e.currentTarget.src = 'no-photo.webp')}
          />
          <div>
            <p className={s.tooltipName}>{currentAuthor.name}</p>
            <div className={s.tooltipLinks}>
              {parsedLinks.map((link: any, index: number) => {
                const platform = Object.keys(link)[0];
                const url = Object.values(link)[0];

                return (
                  url && (
                    <Link key={index} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={`/social_media_icons/${platform}-logo.svg`} alt={platform} />
                    </Link>
                  )
                );
              })}
            </div>
          </div>
        </div>
        <p className={s.tooltipBio}>{currentAuthor.description}</p>
      </div>
    </div>
    <p
      className={s.author}
      onClick={() => setTooltipVisible(!tooltipVisible)}
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      {author}
    </p>
    <div className={s.dateBlock}>
      <p className={s.date}>{readableDate}</p>
      <p className={s.updateDate}>{updated}</p>
    </div>
    <div className={s.viewCounter}>
      <p>{pageviews['/' + slug] || 0}</p>
      <img src="/eye.png" alt="views icon" />
    </div>
  </header>
  );
};

export default ArticleHeader;
