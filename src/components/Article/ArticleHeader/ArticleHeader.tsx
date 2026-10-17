'use client';
import s from './ArticleHeader.module.scss';
import { useAppSelector } from '@/lib/hooks';
import { useState } from 'react';
import { getArticleDate } from '@/services/getArticleDate';
import { authorProfile } from '@/utils/authorIdentity';
import { fallbackAuthors, authorSocialLinks } from '@/defaultData/authorProfiles';
import { authorsCopy } from '@/defaultData/authorsCopy';

export default function ArticleHeader({ author, date, updated, slug, country = 'home' }: {
  author: string; date: string; updated: string; slug: string; country?: string; isSuggested?: boolean;
}) {
  const authors = useAppSelector((state) => state.allAuthors.allAuthorsData || []);
  const current = authors.find((person) => person.name === author) || fallbackAuthors.find((person) => person.name === author);
  const profile = authorProfile(author, country);
  const pageviews = useAppSelector((state) => state.gaData.pageviews || {});
  const [visible, setVisible] = useState(false);
  const validDate = date && Number.isFinite(Date.parse(date));
  const copy = authorsCopy[country === 'ukraine' ? 'uk' : country === 'poland' ? 'pl' : 'en'];
  const bio = author === 'Viacheslav Nikitenko' ? copy.editorBio : author === 'Andy Ray' ? copy.andyBio : '';
  return <header className={s.authorBlock}>
    <div onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)} onFocusCapture={() => setVisible(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setVisible(false); }} onKeyDown={(event) => { if (event.key === 'Escape') setVisible(false); }}>
      <p className={s.author}>{profile ? <a href={profile.url}>{author}</a> : author}</p>
      {current && <div className={`${s.authorTooltipWrapper} ${visible ? s.visible : ''}`}>
        <div className={s.authorTooltip}>
          <div className={s.tooltipMainInfo}>
            <img className={s.tooltipMainImg} src={current.image} alt={current.name} onError={(event) => { event.currentTarget.src = '/no-photo.webp'; }} />
            <div><p className={s.tooltipName}>{current.name}</p><div className={s.tooltipLinks}>
              {authorSocialLinks(current.links).map((link) => <a href={link.url} key={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>)}
            </div></div>
          </div>
          <p className={s.tooltipBio}>{bio || current.description}</p>
        </div>
      </div>}
    </div>
    <div className={s.dateBlock}>
      {validDate && <time className={s.date} dateTime={new Date(date).toISOString()}>{getArticleDate(date, country)}</time>}
      {updated && <p className={s.updateDate}>{updated}</p>}
    </div>
    <div className={s.viewCounter}><p>{pageviews['/' + slug] || 0}</p><img src="/eye.png" alt="" /></div>
  </header>;
}
