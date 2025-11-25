import ArticlePage from '@/components/ArticlePage/ArticlePage';
import { getPostData } from '@/services/getPostData';
import { postData } from '@/types/postTypes';
import { Metadata } from 'next';
import { normalizeImageUrl, getImageUrl } from '@/utils/normalizeImageUrl';

export async function generateMetadata({
	params,
}: {
	params: { postPageLink: string };
}): Promise<Metadata> {
	const data: postData | null = await getPostData({
		pageLink: String(params.postPageLink),
		country: 'usa',
	});

	if (!data) {
		return {
			title: 'Page not found',
			description: 'This article is not exists or deleted.',
		};
	}

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

export default function Post({ params }: { params: { postPageLink: string } }) {
	return <ArticlePage country="usa" postPageLink={params.postPageLink} />;
}
