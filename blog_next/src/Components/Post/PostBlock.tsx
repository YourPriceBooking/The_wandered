 'use client'
import React from "react";
import HouseIcon from "../../../public/HouseIcon";
import style from "./PostBlock.module.scss";
import Image from "next/image";
import SuggestedArticles from "../SuggestedArticles/SuggestedArticles";
//import { useEffect, useState } from 'react';
import { getPostData } from '@/services/getPostData';
import { postData } from '@/types/postTypes';
import { getReadableDate } from '@/services/getReadableDate';
import { useAppSelector } from '@/lib/hooks';
import { useParams } from 'next/navigation';
import DOMPurify from 'dompurify';

interface PostBlockProps {
	country: string;
 }

 let data: postData | null = null;
const PostBlock: React.FC<PostBlockProps> = ({ country }) => {


	const { postPageLink } = useParams();
	const allPosts = useAppSelector((state: any) =>
		state.allPosts[`allPosts${country.charAt(0).toUpperCase() + country.slice(1)}`] || []
	 );
	//const postPageLinkString = Array.isArray(postPageLink) ? postPageLink[0] : postPageLink;
	const MARKUP_SPLIT_KEY = 'imgUrlByIdx';
	//const [data, setData] = useState<postData | null>(null);

	const pageviews = useAppSelector((state: any) => state.gaData.pageviews || {});
	const pageViewsByUrl = `/${country !== 'home' ? country + '/' : ''}${decodeURI(
		String(postPageLink),
	)}`;




	const fetchData = async () => {
		const fetchData = await getPostData({ pageLink: String(postPageLink), country });
		return fetchData;
	  };

	 const dataMarkup = async () => {
		const data = await fetchData();
		const updatedMarkup = editingHTMLData(data.markup);

		const splitedMarkup = updatedMarkup.split(MARKUP_SPLIT_KEY);
		let resultMarkup = splitedMarkup[0];

		for (let i = 1; i < splitedMarkup.length; i++) {
		  resultMarkup += data.imageUrl[i] + splitedMarkup[i];
		}

		return { ...data, markup: resultMarkup };
	  };
	  const init = async () => {
		data = await dataMarkup();
		console.log(data);
	  };
  		init();



	const editingHTMLData = (htmlStr: string) => {
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlStr, 'text/html');
		const elementsWithStyle = doc.querySelectorAll('[style]');

		elementsWithStyle.forEach((element) => {
			element.removeAttribute('style');
		});

		const elements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, img, iframe, blockquote');
		elements.forEach((element) => {
			const previousSibling = element.previousElementSibling;
			if (
				!previousSibling ||
				!(previousSibling.tagName === 'P' && previousSibling.innerHTML === '<br>')
			) {
				const paragraph = doc.createElement('p');
				paragraph.innerHTML = '<br/>';
				element.parentNode?.insertBefore(paragraph, element);
			}
		});

		const blockquotes = doc.querySelectorAll('blockquote');
		blockquotes.forEach((blockquote) => {
			const blockquoteText = blockquote.innerHTML;

			const lastDashIndex = blockquoteText.lastIndexOf('—');
			if (lastDashIndex !== -1) {
				const quoteText = blockquoteText.substring(0, lastDashIndex);
				const authorText = blockquoteText.substring(lastDashIndex + 1).trim();

				blockquote.innerHTML = `${quoteText} — <span class="author">${authorText}</span>`;
			}
		});

		return doc.body.innerHTML;
	};

	let readableDate = '';
	if (data?.publicationDate) {
		readableDate = getReadableDate(data?.publicationDate, country);
	}



	// useEffect(() => {
	// 	(async () => {
	// 	  const data = await getPostData({ pageLink: String(postPageLink), country });
	// 	  const updatedMarkup = editingHTMLData(data.markup);

	// 		const splitedMarkup = updatedMarkup.split(MARKUP_SPLIT_KEY);
	// 		let resultMarkup = splitedMarkup[0];

	// 		for (let i = 1; i < splitedMarkup.length; i++) {
	// 			resultMarkup += data.imageUrl[i] + splitedMarkup[i];
	// 		}

	// 		const updatedData = { ...data, markup: resultMarkup };

	// 	  setData(updatedData);
	// 	})();
	//  }, [postPageLinkString, country]);
	 /*        */
	 const getSuggestedArticles = (post: postData, allPosts: postData[]) => {
		if (!post || allPosts.length === 0) return [];

		const articleIndex = allPosts.findIndex((item) => item._id === post._id);
		if (articleIndex === -1) return [];

		const suggestions = new Set<postData>();
		[-7, 7, -8, 8, -12, 12, -13, 13].forEach(offset => {
		  const index = articleIndex + offset;
		  if (index >= 0 && index < allPosts.length) suggestions.add(allPosts[index]);
		});

		return Array.from(suggestions).slice(0, 4);
	 };
	 const suggestedArticles = data ? getSuggestedArticles(data, allPosts) : [];




	 /*       */
	if (!data) return null;

	return (<>
	<div className={style.post__img}>
		{data.imageUrl.length > 0 ? (
			<Image src={data.imageUrl[0]}
  					 layout="responsive"
 					 width={100}
 					 height={100}
 					 alt="article-image"
  					 className={style.post__image}/>)
		: (<div className={style.post__img_bg}>
			<HouseIcon color="white"/>
			</div>)}
	</div>
	<div className={style.post__content}>
					<h1 className={style.post__title}>{data.heading}</h1>
					<div className={style.post__date_public}>
						 <p>{readableDate}</p>
					</div>
					<div className={style.viewCounter}>
						 <p>{pageviews[pageViewsByUrl] || 0}</p>
						<img src="/eye.png" alt="views icon" />
					</div>
					<p className={style.post__author}>{data.author}</p>
					<div
						className={style.post__markup}
						dangerouslySetInnerHTML={{
							__html: DOMPurify.sanitize(data.markup, {
								ADD_ATTR: ['target', 'allowfullscreen', 'frameborder', 'src'],
								ADD_TAGS: ['iframe'],
							}),
						}}
					></div>
	</div>
	{suggestedArticles.length >= 2 && <SuggestedArticles suggestedArticles={suggestedArticles} />}

	</>)
}


export default PostBlock;


