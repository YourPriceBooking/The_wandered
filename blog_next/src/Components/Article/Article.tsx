//'use client';
//import { useEffect, useState } from 'react';
import s from './Article.module.scss';

import ArticleHeader from './ArticleHeader/ArticleHeader';
import ArticleLinkContent from './ArticleLinkContent/ArticleLinkContent';
//import { useEffect, useRef, useState } from 'react';
// import { useAppSelector } from '@/lib/hooks';
// import { AuthorType } from '@/types/authorTypes';
//import dynamic from 'next/dynamic';
// import { getReadableDate } from '@/services/getReadableDate';

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
	
	
	// const readableDate = getReadableDate(date, country);

	// const authors = useAppSelector((state: any) => state.allAuthors.allAuthorsData || []);

	// const currentAuthor = authors.find((repo: AuthorType) => repo.name === author);
	// let parsedLinks = [];
	// if (currentAuthor) {
	// 	parsedLinks = JSON.parse(currentAuthor?.links);
	// }

	// const isMobile = window.innerWidth <= 768 ? true : false;	
	return (
		<article className={`${s.articleBlock} ${isSuggested ? s.suggested : ''}`}>
			<ArticleHeader  author={author}
				date={date}
				updated={updated}
				slug={slug || ''}
				// authorData={authors}
			/>
			<ArticleLinkContent
				slug={slug || ''}
				title={title}
				heading={heading}
				imageSrc={imageSrc}
				description={description}
				id={id}
				country={country}
			/>
		</article>
	);
}

export default Article;
//  dynamic(() => Promise.resolve(Article), { ssr: false });
