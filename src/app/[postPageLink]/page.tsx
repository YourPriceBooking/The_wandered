import { articleMissingMetadata, articleErrorMetadata } from '@/utils/articleMissingMetadata';
import ArticlePage from '@/components/ArticlePage/ArticlePage';
import { getArticleForMetadata, requireArticle } from '@/services/getArticle';
import { Metadata } from 'next';
import { normalizeImageUrl, getImageUrl } from '@/utils/normalizeImageUrl';

export async function generateMetadata({
	params,
}: {
	params: { postPageLink: string };
}): Promise<Metadata> {
	const data = await getArticleForMetadata('home', String(params.postPageLink));
	if (data === undefined) return articleErrorMetadata('home');
	if (data === null) return articleMissingMetadata('home');

	const normalizedImages = normalizeImageUrl(data.imageUrl as any);
	const imageUrl = getImageUrl(normalizedImages, 0) || '/default-image.jpg';

	return {
		title: data.heading,
		description: data.description,
		openGraph: {
			images: [
				{
					url: imageUrl,
					width: 1200,
					height: 630,
				},
			],
		},
		icons: {
			icon: '/favicon.ico',
			shortcut: '/favicon.ico',
		},
	};
}

export default async function Post({ params }: { params: { postPageLink: string } }) {
	const data = await requireArticle('home', String(params.postPageLink));
	return <ArticlePage data={data} country="home" postPageLink={params.postPageLink} />;
}
