import Image from 'next/image';
import s from './mainPage.module.scss';
import logo from '../../public/house-icon.svg';
import Article from '@/Components/Article/Article';
import { articleData } from '@/defaultData/articleData';
import Link from 'next/link';
import { getPosts, getAllPosts } from '@/services/getPosts';
import { postsDataType } from '@/types/postTypes';

export default async function MainPage() {
	const data: postsDataType = await getPosts({ page: 1 });
	const Alldata: postsDataType = await getAllPosts();
	const length = Math.ceil((Alldata.result.length) / 7)

	return (
		<main className={s.main}>
			<div className={s.topSection}>
				<Image src={logo} width={63} height={58} alt="logo-icon" className={s.logo} priority={true} />
				<div className={s.mainTextBlock}>
					<h2 className={s.mainTitle}>the wandered</h2>
					<h1 className={s.title}>The official Your Price Booking blog</h1>
				</div>
			</div>
			<div className={s.contentSection}>
				{data.result.map((article) => {
					return (
						<Article
							key={article._id}
							slug={''}
							title={article.title}
							imageSrc={article.imageUrl[0]}
							author={article.author}
							date={""}
							updated={""}
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
						))
						}

					</ul>
				</div>
			</div>
		</main>
	);
}
