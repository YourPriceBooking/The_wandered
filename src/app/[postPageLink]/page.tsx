import { articleMissingMetadata, articleErrorMetadata } from '@/utils/articleMissingMetadata';
import ArticlePage from '@/components/ArticlePage/ArticlePage';
import { getArticleForMetadata, requireArticle } from '@/services/getArticle';
import { Metadata } from 'next';
import { articleMetadata } from '@/utils/seoMetadata';

export async function generateMetadata({
	params,
}: {
	params: { postPageLink: string };
}): Promise<Metadata> {
	const data = await getArticleForMetadata('home', String(params.postPageLink));
	if (data === undefined) return articleErrorMetadata('home');
	if (data === null) return articleMissingMetadata('home');
	return articleMetadata(data, 'home', params.postPageLink);
}

export default async function Post({ params }: { params: { postPageLink: string } }) {
	const data = await requireArticle('home', String(params.postPageLink));
	return <ArticlePage data={data} country="home" postPageLink={params.postPageLink} />;
}
