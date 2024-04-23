'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isMobile } from 'react-device-detect';

import s from './Article.module.scss';
import { useRef, useState } from 'react';
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
	const [isHovered, setIsHovered] = useState(false);
	const [lastTap, setLastTap] = useState<number | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const router = useRouter();

	const handleTouch = (e: React.TouchEvent) => {
		const currentTime = new Date().getTime();
		const tapLength = lastTap ? currentTime - lastTap : null;

		if (lastTap && tapLength !== null && tapLength < 500) {
			router.push(`/${slug}`);

			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		} else {
			timerRef.current = setTimeout(() => {
				setIsHovered(!isHovered);
			}, 100);
		}

		setLastTap(currentTime);
	};
	const handleClick = (e: React.MouseEvent) => {
		router.push(`/${slug}`);
	};

	return (
		<article
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
