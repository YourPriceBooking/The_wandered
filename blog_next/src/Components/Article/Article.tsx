'use client';
import s from './Article.module.scss';

import ArticleLinkContent from './ArticleLinkContent/ArticleLinkContent';
import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { AuthorType } from '@/types/authorTypes';
import dynamic from 'next/dynamic';
import { getReadableDate } from '@/services/getReadableDate';

interface ArticleProps {
	slug: string | undefined;
	title: string;
	imageSrc: string;
	author: string;
	date: string;
	updated: string;
	description: string;
	id: string;
	heading: string;
	isSuggested?: boolean;
	country?: string;
}

type SocialMediaIcons = {
	[key: string]: string;
};

const socialMediaIcons: SocialMediaIcons = {
	tiktok: '/social_media_icons/tiktok-logo.svg',
	instagram: '/social_media_icons/instagram-logo.svg',
	youtube: '/social_media_icons/youtube-logo.svg',
	xsolid: '/social_media_icons/x-logo.svg',
	linkedin: '/social_media_icons/linkedin-logo.svg',
	pinterest: '/social_media_icons/pinterest-logo.svg',
	facebook: '/social_media_icons/facebook-logo.svg',
};

//upd
function Article({
	slug,
	title,
	imageSrc,
	author,
	date,
	updated,
	description,
	id,
	heading,
	isSuggested,
	country,
}: ArticleProps) {
	const readableDate = getReadableDate(date, country);

	const pageviews = useAppSelector((state: any) => state.gaData.pageviews || {});

	const authors = useAppSelector((state: any) => state.allAuthors.allAuthorsData || []);

	const authorRef = useRef<HTMLDivElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const [tooltipVisible, setTooltipVisible] = useState(false);

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
	}, []);

	const currentAuthor = authors.find((repo: AuthorType) => repo.name === author);
	let parsedLinks = [];
	if (currentAuthor) {
		parsedLinks = JSON.parse(currentAuthor?.links);
	}

	const isMobile = window.innerWidth <= 768 ? true : false;

	const truncateText = (text: string, wordLimit: number): string => {
		if (!isMobile) {
			return text;
		}

		const words = text.split(' ');
		if (words.length <= wordLimit) return text;
		return words.slice(0, wordLimit).join(' ') + '...';
	};

	return (
		<article className={`${s.articleBlock} ${isSuggested ? s.suggested : ''}`}>
			<div className={s.authorBlock}>
				{currentAuthor && (
					<div
						ref={tooltipRef}
						className={`${s.authorTooltipWrapper} ${tooltipVisible ? s.visible : ''}`}
						onMouseEnter={() => setTooltipVisible(true)}
						onMouseLeave={() => setTooltipVisible(false)}
					>
						<div className={s.authorTooltip}>
							{currentAuthor && (
								<>
									<div className={s.tooltipMainInfo}>
										<img
											className={s.tooltipMainImg}
											src={currentAuthor.image}
											alt="Author Photo"
											onError={(e) => {
												e.currentTarget.src = 'no-photo.webp';
											}}
										/>
										<div>
											<p className={s.tooltipName}>{currentAuthor.name}</p>
											<div className={s.tooltipLinks}>
												{parsedLinks.map((link: any, index: number) => {
													const platform = Object.keys(link)[0];
													const url = Object.values(link)[0];

													return (
														url && (
															<a
																key={index}
																href={link[platform]}
																target="_blank"
																rel="noopener noreferrer"
															>
																<img
																	src={socialMediaIcons[platform]}
																	alt={platform}
																/>
															</a>
														)
													);
												})}
											</div>
										</div>
									</div>
									<p className={s.tooltipBio}>{currentAuthor.description}</p>
								</>
							)}
						</div>
					</div>
				)}
				<p
					ref={authorRef}
					onClick={() => setTooltipVisible(!tooltipVisible)}
					onMouseEnter={() => setTooltipVisible(true)}
					onMouseLeave={() => setTooltipVisible(false)}
					className={s.author}
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
			</div>
			<ArticleLinkContent
				slug={slug || ''}
				title={title}
				heading={heading}
				imageSrc={imageSrc}
				description={truncateText(description, 50)}
				id={id}
				country={country}
			/>
		</article>
	);
}

export default dynamic(() => Promise.resolve(Article), { ssr: false });
