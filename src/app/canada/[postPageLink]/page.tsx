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
	const data = await getArticleForMetadata('canada', String(params.postPageLink));
	if (data === undefined) return articleErrorMetadata('canada');
	if (data === null) return articleMissingMetadata('canada');
	return articleMetadata(data, 'canada', params.postPageLink);
}

export default async function Post({ params }: { params: { postPageLink: string } }) {
	const data = await requireArticle('canada', String(params.postPageLink));
	return <ArticlePage data={data} country="canada" postPageLink={params.postPageLink} />;
}
