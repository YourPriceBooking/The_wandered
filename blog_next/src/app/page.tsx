import Image from 'next/image';
import s from './mainPage.module.scss';
import Article from '@/Components/Article/Article';
import { articleData } from '@/defaultData/articleData';
import Link from 'next/link';
import TopSection from '@/Components/TopSection/TopSection';
import { getPosts, getAllPosts } from '@/services/getPosts';
import { postsDataType } from '@/types/postTypes';

export default async function MainPage() {
	const data: postsDataType = await getPosts({ page: 1 });
	const Alldata: postsDataType = await getAllPosts();
	const length = Math.ceil(Alldata.result.length / 7);

	return (
		<main className={s.main}>
			<TopSection />
			<div className={s.contentSection}>
				{data.result.map((article) => {
					return (
						<Article
							key={article._id}
							slug={article.articleUrl.split('/').pop()}
							title={article.title}
							imageSrc={article.imageUrl[0]}
							author={article.author}
							date={article.publicationDate}
							updated={''}
						></Article>
					);
				})}
				<div className={s.navSection}>
					<ul className={s.navNumbers}>
						{Array.from({ length: length }, (_, index) => (
							<li>
								<Link href="#" className={s.activeLink}>
									{index + 1}
								</Link>
							</li>
						))}
					</ul>
				</div>
			</div>
		</main>
	);
}
