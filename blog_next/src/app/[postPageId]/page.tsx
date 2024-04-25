import { articleData } from '@/defaultData/articleData';
import { Metadata } from 'next';
import ArticlePage from '@/Components/ArticlePage/ArticlePage';

export async function generateMetadata({
	params,
}: {
	params: { slug: string };
}): Promise<Metadata> {
	//TODO ------- get data from server
	const post = articleData.find((elem) => elem.slug === params.slug);
	return {
		title: post?.metaTitle,
		description: post?.description,
	};
}

export default function Post() {
	return <ArticlePage />;
}
