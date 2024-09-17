import s from './mainPage.module.scss';
import Article from '@/Components/Article/Article';
import Link from 'next/link';
import TopSection from '@/Components/TopSection/TopSection';
import { getPosts, getAllPosts } from '@/services/getPosts';
import { postData, postsDataType } from '@/types/postTypes';

export const dynamic = 'force-dynamic';

export default async function MainPage({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	let paramsPage = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;

	const data: postsDataType = await getPosts({ page: paramsPage });

	const Alldata: postsDataType = await getAllPosts();
	const length = Math.ceil(Alldata.result.length / 7);

	return (
		<main className={s.main}>
			<TopSection />
			<div className={s.contentSection}>
				{data.result.map((article: postData) => {
					return (
						<Article
							key={article._id}
							slug={article?.articleUrl?.split('/').pop()}
							title={article.title}
							imageSrc={article.imageUrl[0]}
							author={article.author}
							date={article.publicationDate}
							updated={''}
							description={article.description}
							id={article._id}
							heading={article.heading}
						></Article>
					);
				})}
				<div className={s.navSection}>
					<ul className={s.navNumbers}>
						{Array.from({ length }, (_, index) => (
							<li key={index}>
								<Link
									href={`/?page=${index + 1}`}
									className={`${paramsPage === index + 1 ? s.activePage : s.pageNumber}`}
								>
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
