import Image from 'next/image';
import s from './mainPage.module.scss';
import Article from '@/Components/Article/Article';
import { articleData } from '@/defaultData/articleData';
import Link from 'next/link';
import TopSection from '@/Components/TopSection/TopSection';

export default function MainPage() {
	return (
		<main className={s.main}>
			<TopSection />
			<div className={s.contentSection}>
				{articleData.map((article) => {
					return (
						<Article
							key={article.id}
							slug={article.slug}
							title={article.title}
							imageSrc={article.imageSrc}
							author={article.author}
							date={article.date}
							updated={article.updated}
						></Article>
					);
				})}
				<div className={s.navSection}>
					<ul className={s.navNumbers}>
						<li>
							<Link href="#" className={s.activeLink}>
								1
							</Link>
						</li>
						<li>
							<Link href="#">2</Link>
						</li>
						<li>
							<Link href="#">3</Link>
						</li>
						<li>
							<Link href="#">4</Link>
						</li>
						<li>
							<Link href="#">5</Link>
						</li>
						<li>
							<Link href="#">6</Link>
						</li>
						<li>
							<Link href="#">7</Link>
						</li>
						<li>
							<Link href="#">8</Link>
						</li>
						<li>
							<Link href="#">9</Link>
						</li>
						<li>
							<Link href="#">10</Link>
						</li>
					</ul>
				</div>
			</div>
		</main>
	);
}
