'use client';
import Image from 'next/image';
import { articleData } from '@/defaultData/articleData';
import s from './ArticlePage.module.scss';
import { usePathname } from 'next/navigation';

export default function ArticlePage() {
	const pathname = usePathname();

	const post = articleData.find((elem) => elem.slug === pathname.substring(1, pathname.length));

	return (
		post && (
			<main className={s.postBlock}>
				<div className={s.imageBlock}>
					{post.imageSrc ? (
						<Image src={post.imageSrc} fill alt="article-image" className={s.image} />
					) : (
						<div className={s.defaultImage}></div>
					)}
				</div>
				<div className={s.textBlock}>
					<h1 className={s.title}>{post.title}</h1>
					<div className={s.dateBlock}>
						<p>{post.date}</p>
						<p>{post.updated}</p>
					</div>
					<p className={s.author}>{post.author}</p>
					<p className={s.text}>{post.text}</p>
					<h2 className={s.subtitle}>{post.subtitle}</h2>
					<p className={s.text}>{post.subtext}</p>
					{post.additional?.map((block, i) => {
						return (
							<div>
								<h3 className={s.blockSubtitle}>{block.title}</h3>
								<p className={s.text}>{block.text}</p>
							</div>
						);
					})}
				</div>
			</main>
		)
	);
}
