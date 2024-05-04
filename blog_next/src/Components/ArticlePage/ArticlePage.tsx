'use client';
import Image from 'next/image';
import { articleData } from '@/defaultData/articleData';
import s from './ArticlePage.module.scss';
import { useParams, usePathname } from 'next/navigation';
import { getPostData } from '@/services/getPostData';
import { useEffect, useState } from 'react';
import { postData } from '@/types/postTypes';
import { sanitize } from 'dompurify';
import Loading from '@/app/loading';

const formatDate = (isoString: string | Date) => {
	const date = new Date(isoString);
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day
		.toString()
		.padStart(2, '0')}`;

	const hours = date.getHours();
	const minutes = date.getMinutes();
	const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
		.toString()
		.padStart(2, '0')}`;

	return `${formattedDate} ${formattedTime}`;
};

export default function ArticlePage() {
	const pathname = usePathname();
	const params = useParams();

	const [post, setPost] = useState<postData | null>(null);

	useEffect(() => {
		(async () => {
			const data = await getPostData({
				pageLink: String(params.postPageLink),
			});
			setPost(data);
		})();
	}, []);
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
						<p>{formatDate(post.publicationDate)}</p>
						{/* <p>{formatDate(post.changeDate)}</p> */}
					</div>
					<p className={s.author}>{post.author}</p>
					<div
						className={s.markup}
						dangerouslySetInnerHTML={{ __html: sanitize(post.markup) }}
					></div>
				</div>
			</main>
		)
	);
}
