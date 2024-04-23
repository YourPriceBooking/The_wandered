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
	const [isTapped, setIsTapped] = useState(false);
	const [isFrstTapped, setIsFrstTapped] = useState(true);
	const [startTouch, setStartTouch] = useState<{ x: number; y: number } | null>(null);
	const router = useRouter();

	const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		const touch = e.touches[0];
		setStartTouch({ x: touch.clientX, y: touch.clientY });
		setIsTapped(true);
	};

	const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
		if (!startTouch) return;
		const touch = e.touches[0];
		const moveX = Math.abs(touch.clientX - startTouch.x);
		const moveY = Math.abs(touch.clientY - startTouch.y);

		if (moveX > 10 || moveY > 10) {
			setIsTapped(false);
		}
	};

	const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
		console.log(isTapped, isFrstTapped);
		if (isTapped && !isFrstTapped) {
			router.push(`/${slug}`);
		} else if (isTapped && isFrstTapped) {
			setIsFrstTapped(false);
		}
		setStartTouch(null);
	};

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		router.push(`/${slug}`);
	};

	useEffect(() => {
		const handleGlobalClick = (e: MouseEvent) => {
			if (articleRef.current && !articleRef.current.contains(e.target as Node)) {
				setIsTapped(false);
				setIsFrstTapped(true);
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
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
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
			/>
		</article>
	);
}
