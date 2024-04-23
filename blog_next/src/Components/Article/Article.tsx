'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isMobile } from 'react-device-detect';

import s from './Article.module.scss';
import { useEffect, useRef, useState } from 'react';
import ArticleLinkContent from './ArticleLinkContent/ArticleLinkContent';

interface ArticleProps {
	slug: string | undefined;
	title: string;
	imageSrc: string;
	author: string;
	date: string;
	updated: string;
	description: string;
}
//upd
export default function Article({
	slug,
	title,
	imageSrc,
	author,
	date,
	updated,
	description,
}: ArticleProps) {
	const dateStr = date;
	const newDate = new Date(dateStr);
	const options = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	};
	//@ts-ignore
	const readableDate = newDate.toLocaleDateString('en-US', options);
	const articleRef = useRef<HTMLDivElement>(null);
	const [isHovered, setIsHovered] = useState(false);
	const [isTapped, setIsTapped] = useState(false);
	const router = useRouter();

	const handleTouch = (e: React.TouchEvent<HTMLDivElement>) => {
		e.stopPropagation();
		if (isTapped) {
			router.push(`/${slug}`);
		} else {
			setIsTapped(true);
		}
	};

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		router.push(`/${slug}`);
	};

	useEffect(() => {
		const handleGlobalClick = (e: MouseEvent) => {
			if (articleRef.current && !articleRef.current.contains(e.target as Node)) {
				setIsTapped(false);
			}
		};

		document.addEventListener('click', handleGlobalClick);

		return () => {
			document.removeEventListener('click', handleGlobalClick);
		};
	}, []);

	return (
		<article
			ref={articleRef}
			className={s.articleBlock}
			onTouchStart={handleTouch}
			onClick={isMobile ? () => {} : handleClick}
		>
			<div className={s.authorBlock}>
				<p className={s.author}>{author}</p>
				<div className={s.dateBlock}>
					<p className={s.date}>{readableDate}</p>
					<p className={s.updateDate}>{updated}</p>
				</div>
			</div>
			<ArticleLinkContent
				slug={slug || ''}
				title={title}
				imageSrc={imageSrc}
				description={description}
				isHovered={isHovered}
			/>
		</article>
	);
}
