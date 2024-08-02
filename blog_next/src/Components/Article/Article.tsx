'use client';
import Image from 'next/image';
import Link from 'next/link';

import s from './Article.module.scss';

import ArticleLinkContent from './ArticleLinkContent/ArticleLinkContent';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

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
}

type Repo = {
	_id: number;
	name: string;
	image: string;
	description: string;
	skills: string;
	links: string[];
};

type Data = {
	loading: boolean;
	repos: Repo[];
};

type SocialMediaIcons = {
	[key: string]: string;
};

const socialMediaIcons: SocialMediaIcons = {
	tiktok: 'social_media_icons/tiktok-logo.svg',
	instagram: 'social_media_icons/instagram-logo.svg',
	youtube: 'social_media_icons/youtube-logo.svg',
	xsolid: 'social_media_icons/x-logo.svg',
	linkedin: 'social_media_icons/linkedin-logo.svg',
	pinterest: 'social_media_icons/pinterest-logo.svg',
	facebook: 'social_media_icons/facebook-logo.svg',
};

//upd
export default function Article({
	slug,
	title,
	imageSrc,
	author,
	date,
	updated,
	description,
	id,
	heading,
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

	const authorRef = useRef<HTMLDivElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const [tooltipVisible, setTooltipVisible] = useState(false);
	const [authors, setAuthors] = useState<Data>({
		loading: true,
		repos: [],
	});

	useEffect(() => {
		const fetchAuthors = async () => {
			const response = await axios.get(
				'https://ypbooking.chost.com.ua/blog/api/author/get-all-authors',
			);
			const allRepos: Repo[] = response.data.result;

			if (allRepos.length) {
				setAuthors({ loading: false, repos: allRepos });
			}
		};

		fetchAuthors();
	}, []);

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

	const currentAuthor = authors.repos.find((repo) => repo.name === author);

	return (
		<article className={s.articleBlock}>
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
												{currentAuthor.links.map((link, index) => {
													const parsedLink = JSON.parse(link) as Record<
														string,
														string
													>;
													const [platform, url] = Object.entries(parsedLink)[0];

													return (
														<a
															key={index}
															href={url}
															target="_blank"
															rel="noopener noreferrer"
														>
															<img src={socialMediaIcons[platform]} alt={platform} />
														</a>
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
					<p>0</p>
					<img src="eye.png" alt="views icon" />
				</div>
			</div>
			<ArticleLinkContent
				slug={slug || ''}
				title={title}
				heading={heading}
				imageSrc={imageSrc}
				description={description}
				id={id}
			/>
		</article>
	);
}
