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

export default function ArticlePage() {
	const { postPageLink } = useParams();

	const pageviews = useAppSelector((state: any) => state.gaData.pageviews || {});
	const [post, setPost] = useState<postData | null>(null);

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

			// Split the content at the last occurrence of "—"
			const lastDashIndex = blockquoteText.lastIndexOf('—');
			if (lastDashIndex !== -1) {
				const quoteText = blockquoteText.substring(0, lastDashIndex);
				const authorText = blockquoteText.substring(lastDashIndex + 1).trim();

				// Wrap the author part in a <span class="author">
				blockquote.innerHTML = `${quoteText} — <span class="author">${authorText}</span>`;
			}
		});

		return doc.body.innerHTML;
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
			</main>
		)
	);
}
