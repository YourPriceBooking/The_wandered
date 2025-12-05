'use client';
import React, { useEffect, useRef, useState } from 'react';
import HouseIcon from '../../../public/HouseIcon';
import style from './PostBlock.module.scss';
import Image from 'next/image';
import SuggestedArticles from '../SuggestedArticles/SuggestedArticles';
import { getPostData } from '@/services/getPostData';
import { PostPageProps } from '@/types/postTypes';
import { getReadableDate } from '@/services/getReadableDate';
import { notFound } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import PageViewes from '../PageViewes';
import { dataMarkup } from './helpers/dataMarkup';
import { AuthorType } from '@/types/authorTypes';
import { useAppSelector } from '@/lib/hooks';
import Link from 'next/link';
import { normalizeImageUrl, getImageUrl } from '@/utils/normalizeImageUrl';
import { replaceImagesInHtml } from '@/utils/replaceImagesInHtml';

const PostBlock: React.FC<PostPageProps> = ({ country, postPageLink }) => {
	const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
	const [data, setData] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [readableDate, setReadableDate] = useState('');
	const authorRef = useRef<HTMLDivElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);

	const allAuthors = useAppSelector((state) => state.allAuthors.allAuthorsData || []);
	const currentAuthor = data?.author
		? allAuthors.find((author: AuthorType) => author.name === data.author)
		: null;

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
	}, [setTooltipVisible]);

	useEffect(() => {
		const fetchData = async () => {
			if (!country || !postPageLink) {
				return notFound();
			}

			try {
				const post = await getPostData({ pageLink: String(postPageLink), country });
				if (!post) {
					return notFound();
				}

				const processedData = await dataMarkup(post);
				if (!processedData) {
					return notFound();
				}

				setData(processedData);

				if (processedData?.publicationDate) {
					setReadableDate(getReadableDate(processedData.publicationDate, country));
				}
			} catch (error) {
				console.error('Error fetching post data:', error);
				return notFound();
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [country, postPageLink]);

	if (isLoading) {
		return <div className={style.loading}>Loading...</div>;
	}

	if (!data) {
		return null;
	}

	const normalizedImages = normalizeImageUrl(data.imageUrl as any);
	const imageSrc = getImageUrl(normalizedImages, 0);

	return (
		<>
			<div className={style.imageWrapper}>
				<div className={style.post__img}>
					{imageSrc ? (
						<Image
							src={imageSrc}
							layout="responsive"
							width={100}
							height={100}
							alt="article-image"
							className={style.post__image}
						/>
					) : (
						<div className={style.post__img_bg}>
							<HouseIcon color="white" />
						</div>
					)}
				</div>
			</div>
			<div className={style.post__content}>
				<h1 className={style.post__title}>{data.heading}</h1>
				<div className={style.post__date_public}>
					<p>{readableDate}</p>
				</div>
				<div className={style.viewCounter}>
					<PageViewes country={country} postPageLink={postPageLink} />
					<img src="/eye.png" alt="views icon" />
				</div>
				<div ref={authorRef} style={{ position: 'relative' }}>
					<p
						className={`${style.post__author} ${tooltipVisible ? style.visible : ''}`}
						onMouseEnter={() => setTooltipVisible(true)}
						onMouseLeave={() => setTooltipVisible(false)}
					>
						{data.author}
					</p>

					{currentAuthor && (
						<div
							ref={tooltipRef}
							className={`${style.authorTooltipWrapper} ${
								tooltipVisible ? style.visible : ''
							}`}
							onMouseEnter={() => setTooltipVisible(true)}
							onMouseLeave={() => setTooltipVisible(false)}
						>
							<div className={style.authorTooltip}>
								<div className={style.tooltipMainInfo}>
									<img
										className={style.tooltipMainImg}
										src={currentAuthor.image}
										alt="Author Photo"
										onError={(e) => (e.currentTarget.src = 'no-photo.webp')}
									/>
									<div>
										<p className={style.tooltipName}>{currentAuthor.name}</p>
										<div className={style.tooltipLinks}>
											{JSON.parse(currentAuthor.links).map(
												(link: any, index: number) => {
													const platform = Object.keys(link)[0];
													const url = Object.values(link)[0];

													return (
														url && (
															<Link
																key={index}
																href={url}
																target="_blank"
																rel="noopener noreferrer"
															>
																<img
																	src={`/social_media_icons/${platform}-logo.svg`}
																	alt={platform}
																/>
															</Link>
														)
													);
												},
											)}
										</div>
									</div>
								</div>
								<p className={style.tooltipBio}>{currentAuthor.description}</p>
							</div>
						</div>
					)}
				</div>
<div
	className={style.post__markup}
	dangerouslySetInnerHTML={{
		__html: DOMPurify.sanitize(replaceImagesInHtml(data.markup, data.imageUrl), {
			ADD_ATTR: ['target', 'allowfullscreen', 'frameborder', 'src'],
			ADD_TAGS: ['iframe'],
		}),
	}}
></div>
			</div>
			<SuggestedArticles data={data} country={country} />
		</>
	);
};

export default PostBlock;
