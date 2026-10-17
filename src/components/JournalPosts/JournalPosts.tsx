import JournalPost from './JournalPost/JournalPost';
import type { JournalPostType } from '@/types/historyTypes';
import s from './JournalPosts.module.scss';
import Pagination from '@/components/Pagination/Pagination';
import { journalPath, newEpisodesPath } from '@/utils/journalSeo';
import { Fragment } from 'react';

// A server-rendered page has one URL and exactly one slice of the archive.
// Native anchors retain browser Back/Forward and scroll restoration, also without JS.
export default function JournalPosts({ initialPosts, initialPage, totalPages }: {
  initialPosts: JournalPostType[]; initialPage: number; totalPages: number;
}) {
  return <div className={s.containerPosts}>
    {initialPosts.map((post, index) => <Fragment key={post._id}>
      {index === 3 && <div className={s.btnNewEpisode}><a href={`${journalPath}#game-zone`}>Enter the Game Zone</a></div>}
      <JournalPost post={post} />
    </Fragment>)}
    <Pagination path={newEpisodesPath} page={initialPage} totalPages={totalPages} />
  </div>;
}
