import ArticlePage from '@/Components/ArticlePage/ArticlePage';
import { getPostData } from '@/services/getPostData';
import { postData } from '@/types/postTypes';
import { Metadata } from 'next';

export async function generateMetadata({
	params,
}: {
	params: { postPageId: string };
}): Promise<Metadata> {
	const data: postData = await getPostData({
		postId: String(params.postPageId),
	});
	return {
		title: data.title,
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
	};
}

export default function Post({}) {
	return <ArticlePage />;
}
