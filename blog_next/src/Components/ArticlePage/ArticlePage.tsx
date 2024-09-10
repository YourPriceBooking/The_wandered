'use client';
import s from './ArticlePage.module.scss';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import Loading from '@/app/loading';
import { useParams } from 'next/navigation';
import { getPostData } from '@/services/getPostData';
import { useEffect, useState } from 'react';
import { postData } from '@/types/postTypes';
import { useAppSelector } from '@/lib/hooks';
import SuggestedArticles from '../SuggestedArticles/SuggestedArticles';

import { getPosts } from '@/services/getPosts';

export default function ArticlePage() {
	const { postPageLink } = useParams();

	const pageviews = useAppSelector((state: any) => state.gaData.pageviews || {});
	const allPosts = useAppSelector((state: any) => state.allPosts.allPostsData);
	const [post, setPost] = useState<postData | null>(null);
	const [suggestedArticles, setSuggestedArticles] = useState<postData[] | []>([]);

	let readableDate = '';
	const dateStr = post?.publicationDate;
	if (dateStr) {
		const newDate = new Date(dateStr);
		const options = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		};
		//@ts-ignore
		readableDate = newDate.toLocaleDateString('en-US', options);
	}

	const editingHTMLData = (htmlStr: string) => {
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlStr, 'text/html');
		const elementsWithStyle = doc.querySelectorAll('[style]');

		elementsWithStyle.forEach((element) => {
			element.removeAttribute('style');
		});

		const elements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, img, iframe');
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

	const getSuggestedArticles = async () => {
		//@ts-ignore
		const articleIndex = allPosts.findIndex((item: postData) => item._id === post._id);

		const suggestions = [];

		const suggestionIndex1 = articleIndex - 7;
		if (suggestionIndex1 >= 0 && suggestionIndex1 < allPosts.length) {
			suggestions.push(allPosts[suggestionIndex1]);
		} else if (articleIndex + 7 < allPosts.length) {
			suggestions.push(allPosts[articleIndex + 7]);
		}

		const suggestionIndex2 = articleIndex - 8;
		if (suggestionIndex2 >= 0 && suggestionIndex2 < allPosts.length) {
			suggestions.push(allPosts[suggestionIndex2]);
		} else if (articleIndex + 8 < allPosts.length) {
			suggestions.push(allPosts[articleIndex + 8]);
		}

		setSuggestedArticles(suggestions);
	};

	useEffect(() => {
		(async () => {
			const data = await getPostData({
				pageLink: String(postPageLink),
			});

			const updatedData = { ...data, markup: editingHTMLData(data.markup) };

			setPost(updatedData);
		})();
	}, [postPageLink]);

	useEffect(() => {
		if (post && allPosts.length > 0) {
			getSuggestedArticles();
		}
	}, [allPosts, post]);

	if (!post) return <Loading />;

	return (
		post && (
			<main className={s.postBlock}>
				<div className={s.imageBlock}>
					{post.imageUrl ? (
						<Image src={post.imageUrl[0]} fill alt="article-image" className={s.image} />
					) : (
						<div className={s.defaultImage}></div>
					)}
				</div>
				<div className={s.textBlock}>
					<h1 className={s.title}>{post.heading}</h1>
					<div className={s.dateBlock}>
						<p>{readableDate}</p>
					</div>
					<div className={s.viewCounter}>
						<p>{pageviews['/' + decodeURI(String(postPageLink))] || 0}</p>
						<img src="eye.png" alt="views icon" />
					</div>
					<p className={s.author}>{post.author}</p>
					<div
						className={s.markup}
						dangerouslySetInnerHTML={{
							__html: DOMPurify.sanitize(post.markup, {
								ADD_ATTR: ['target', 'allowfullscreen', 'frameborder', 'src'],
								ADD_TAGS: ['iframe'],
							}),
						}}
					></div>
				</div>
				{suggestedArticles.length === 2 && (
					<SuggestedArticles suggestedArticles={suggestedArticles} />
				)}
			</main>
		)
	);
}
