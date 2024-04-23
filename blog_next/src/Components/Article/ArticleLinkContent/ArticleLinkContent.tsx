import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import s from './../Article.module.scss';

interface ArticleLinkContentProps {
	slug: string;
	title: string;
	imageSrc: string;
	description: string;
}
const ArticleLinkContent: React.FC<ArticleLinkContentProps> = ({
	slug,
	title,
	imageSrc,
	description,
}) => {
	return (
		<>
			<div className={s.imageBlock}>
				<article className={`${s.hoverBlock}`}>
					<h3>{title}</h3>
					<p>{description}</p>
				</article>
				<div className={s.line}></div>
				{imageSrc ? (
					<Image src={imageSrc} fill alt="article-image" className={s.image} />
				) : (
					<div className={s.defaultImage}></div>
				)}
			</div>
			<div className={s.titleBlock}>
				<p className={s.title}>{title}</p>
			</div>
			<Link href={`/${slug}`} className={s.readMore}>
				<p className={s.link}>READ MORE</p>
				<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 16 16">
					<path
						fillRule="evenodd"
						d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
					/>
				</svg>
			</Link>
		</>
	);
};

export default ArticleLinkContent;
