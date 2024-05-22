import ArticlePage from '@/Components/ArticlePage/ArticlePage';
import { getPostData } from '@/services/getPostData';
import { postData } from '@/types/postTypes';
import { Metadata } from 'next';

export async function generateMetadata({
	params,
}: {
	params: { postPageLink: string };
}): Promise<Metadata> {
	const data: postData = await getPostData({
		pageLink: String(params.postPageLink),
	});

	const faviconUrl = data.imageUrl[0].slice(0, 4) + 's' + data.imageUrl[0].slice(4);

	return {
		title: data.heading,
		description: data.description,
		openGraph: {
			images: [
				{
					url: data.imageUrl[0],
					width: 1200,
					height: 630,
				},
			],
		},
		icons: {
			icon: faviconUrl,
      		shortcut: faviconUrl,
		},
	};
}

export default function Post({}) {
	return <ArticlePage />;
}
