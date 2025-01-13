"use client"
import s from './../Article.module.scss';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { isMobile } from 'react-device-detect';
import { useEffect, useRef, useState } from 'react';
import { routes } from '@/app/routes';

interface ArticleLinkContentProps {
	slug: string;
	title: string;
	imageSrc: string;
	description: string;
	id: string;
	heading: string;
	country?: string;
}

const ArticleLinkContent: React.FC<ArticleLinkContentProps> = ({
	slug,
	title,
	imageSrc,
	description,
	heading,
	country,
}) => {
	const router = useRouter();
	const articleRef = useRef<HTMLDivElement>(null);

	const [isTapped, setIsTapped] = useState(false);
	const [isFrstTapped, setIsFrstTapped] = useState(true);
	const [startTouch, setStartTouch] = useState<{ x: number; y: number } | null>(null);

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
	const truncateText = (text: string, wordLimit: number): string => {
		if (!isMobile) {
			return text;
		}

		const words = text.split(' ');
		if (words.length <= wordLimit) return text;
		return words.slice(0, wordLimit).join(' ') + '...';
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

	const readMoreLanguage = routes.find((item) => item.path === country);

	return (
		<>
			<div
				className={s.imageBlock}
				ref={articleRef}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onClick={isMobile ? () => {} : handleClick}
			>
				<article className={`${s.hoverBlock}`}>
					<h1>{title}</h1>
					<p>{truncateText(description, 50)}</p>
				</article>
				<div className={s.line}></div>
				{imageSrc ? (
					<Image src={imageSrc} fill alt="article-image" className={s.image} />
				) : (
					<div className={s.defaultImage}></div>
				)}
			</div>

			<div className={s.titleBlock}>
				<h1 className={s.title}>{heading}</h1>
			</div>
			<Link href={`/${slug}`} className={s.readMore}>
				<p className={s.link}>
					{readMoreLanguage?.readmore ? readMoreLanguage?.readmore : 'READ MORE'}
				</p>
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
