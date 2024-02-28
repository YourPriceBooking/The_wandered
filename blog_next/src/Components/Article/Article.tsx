import Image from 'next/image';
import Link from 'next/link';

import s from './Article.module.scss';

interface ArticleProps {
  title: string;
  imageSrc: string;
  author: string;
  date: string;
  updated: string;
}

export default function Article({ title, imageSrc, author, date, updated }: ArticleProps) {
  return (
    <div className={s.articleBlock}>
      <div className={s.authorBlock}>
        <p className={s.author}>{author}</p>
        <div className={s.dateBlock}>
          <p className={s.date}>{date}</p>
          <p className={s.date}>{updated}</p>
        </div>
      </div>
      <Link href="#">
        <div className={s.imageBlock}>
          <div className={s.line}></div>
          {imageSrc ? (
            <Image src={imageSrc} fill alt="article-image" className={s.image} />
          ) : (
            <div className={s.defaultImage}></div>
          )}
        </div>
        <div className={s.titleBlock}>
          <p className={s.title}>{title}</p>
          <p className={s.link}>READ MORE {'>'}</p>
        </div>
      </Link>
    </div>
  );
}
