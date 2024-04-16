import Image from 'next/image';
import Link from 'next/link';

import s from './Article.module.scss';

interface ArticleProps {
	slug: string;
	title: string;
	imageSrc: string;
	author: string;
	date: string;
	updated: string;
}

export default function Article({ slug, title, imageSrc, author, date, updated }: ArticleProps) {
	const dateStr = date;
	const newDate = new Date(dateStr);

	const options = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	};
	//@ts-ignore
	const readableDate = newDate.toLocaleDateString('en-US', options);

	return (
		<article className={s.articleBlock}>
			<div className={s.authorBlock}>
				<p className={s.author}>{author}</p>
				<div className={s.dateBlock}>
					<p className={s.date}>{readableDate}</p>
					<p className={s.date}>{updated}</p>
				</div>
			</div>
			<Link href={`/${slug}`}>
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
		</article>
	);
}
