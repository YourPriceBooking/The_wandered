import { articleData } from '@/defaultData/articleData';
import { Metadata } from 'next';
import ArticlePage from '@/Components/ArticlePage/ArticlePage';
import { getPostData } from '@/services/getPostData';
import { postData } from '@/types/postTypes';

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
		icons: './houseIconOrange.svg',
		openGraph: {
			images: data.imageUrl[0],
		},
	};
}

export default function Post({}) {
	return <ArticlePage />;
}
