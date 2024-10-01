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
import Link from 'next/link';
import { getReadableDate } from '@/services/getReadableDate';

export default function ArticlePage({ country = 'home' }: { country?: string }) {
	const { postPageLink } = useParams();
	const MARKUP_SPLIT_KEY = 'imgUrlByIdx';

	const pageviews = useAppSelector((state: any) => state.gaData.pageviews || {});

	const allPosts = useAppSelector((state: any) => {
		switch (country) {
			case 'ukraine':
				return state.allPosts.allPostsUkraine;
			case 'poland':
				return state.allPosts.allPostsPoland;
			case 'usa':
				return state.allPosts.allPostsUSA;
			case 'canada':
				return state.allPosts.allPostsCanada;
			case 'home':
				return state.allPosts.allPostsHome;
			default:
				return state.allPosts.allPostsData;
		}
	});

	const [post, setPost] = useState<postData | null>(null);
	const [suggestedArticles, setSuggestedArticles] = useState<postData[] | []>([]);

	let readableDate = '';
	if (post?.publicationDate) {
		readableDate = getReadableDate(post?.publicationDate, country);
	}

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

	const getSuggestedArticles = async () => {
		//@ts-ignore
		const articleIndex = allPosts.findIndex((item: postData) => item._id === post._id);

		if (articleIndex === -1) return [];

		const suggestions = new Set<postData>();

		const addSuggestion = (index: number) => {
			if (index >= 0 && index < allPosts.length && index !== articleIndex) {
				suggestions.add(allPosts[index]);
			}
		};

		addSuggestion(articleIndex - 7);
		addSuggestion(articleIndex + 7);
		addSuggestion(articleIndex - 8);
		addSuggestion(articleIndex + 8);
		addSuggestion(articleIndex - 12);
		addSuggestion(articleIndex + 12);
		addSuggestion(articleIndex - 13);
		addSuggestion(articleIndex + 13);

		if (allPosts.length >= 3 && allPosts.length <= 13) {
			for (let i = 0; i < allPosts.length; i++) {
				if (suggestions.size < 4) {
					addSuggestion(i);
				}
			}
		}

		const suggestedArticles = Array.from(suggestions);
		if (suggestedArticles.length >= 4) {
			setSuggestedArticles(suggestedArticles.slice(0, 4));
		} else {
			setSuggestedArticles(suggestedArticles.slice(0, 2));
		}
	};

	useEffect(() => {
		(async () => {
			const data = await getPostData({
				pageLink: String(postPageLink),
				country,
			});

			const updatedMarkup = editingHTMLData(data.markup);

			const splitedMarkup = updatedMarkup.split(MARKUP_SPLIT_KEY);
			let resultMarkup = splitedMarkup[0];

			for (let i = 1; i < splitedMarkup.length; i++) {
				resultMarkup += data.imageUrl[i] + splitedMarkup[i];
			}

			const updatedData = { ...data, markup: resultMarkup };

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
					{post.imageUrl.length > 0 ? (
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
						<img src="/eye.png" alt="views icon" />
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
				{suggestedArticles.length >= 2 && (
					<SuggestedArticles suggestedArticles={suggestedArticles} />
				)}

				<Link
					href="https://www.yourpricebooking.com"
					target="blank"
					className={s.bannerWrapper}
				>
					<div className={`${s.banner} ${s.shine}`}>
						<div className={s.bannerTextWrapper}>
							<p className={s.title}>
								<span>Your Price </span>
								Booking
							</p>
							<div className={s.strips}>
								<div></div>
								<div></div>
								<div></div>
								<div></div>
								<div></div>
							</div>
						</div>
						<img
							className={s.bannerImage}
							src="/banner-img.png"
							alt="Banner image Your Price Booking"
						/>
					</div>
				</Link>
				<div className={s.whiteSpace}></div>
			</main>
		)
	);
}
