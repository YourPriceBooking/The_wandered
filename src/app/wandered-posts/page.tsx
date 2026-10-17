import { pageMetadata, socialImage } from '@/utils/seoMetadata';
import s from './wandered-posts.module.scss';
import Article from '@/components/Article/Article';
import { getPostsBySearch } from '@/services/getPosts';
import { postData } from '@/types/postTypes';
import { normalizeImageUrl, getImageUrl } from '@/utils/normalizeImageUrl';
import type { Metadata } from 'next';

export const metadata: Metadata = pageMetadata({
	title: 'Search travel stories | The Wandered',
	description: 'Search travel stories, destinations and practical tips on The Wandered.',
	path: '/wandered-posts', index: false, image: socialImage('search', 'Search travel stories | The Wandered'),
});

interface PageProps {
	searchParams: { search: string };
}

const Page = async ({ searchParams }: PageProps) => {
	const postsData: postData[] = await getPostsBySearch({
		search: searchParams.search || '',
	}).then((data) => data || []);
	
	if (!postsData.length) {
		return (
			<div
				style={{
					height: '600px',
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<p
					style={{
						fontSize: '24px',
						fontWeight: 'bold',
						textTransform: 'uppercase',
					}}
				>
					Not found
				</p>
			</div>
		);
	}

	return (
		<div className={s.mainContainer}>
			{postsData.map((article) => {
				const country = article.country === 'home' ? '' : article.country + '/';
				const normalizedImages = normalizeImageUrl(article.imageUrl as any);
				const imageSrc = getImageUrl(normalizedImages, 0) || '';
				return (
					<Article
						key={article._id}
						slug={country + article?.articleUrl?.split('/').pop()}
						title={article.title}
						imageSrc={imageSrc}
						author={article.author}
						date={article.publicationDate}
						updated={''}
						description={article.description}
						id={article._id}
						heading={article.heading}
					/>
				);
			})}
		</div>
	);
};

export default Page;
