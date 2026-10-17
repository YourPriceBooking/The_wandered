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
	const data = await getArticleForMetadata('usa', String(params.postPageLink));
	if (data === undefined) return articleErrorMetadata('usa');
	if (data === null) return articleMissingMetadata('usa');
	return articleMetadata(data, 'usa', params.postPageLink);
}

export default async function Post({ params }: { params: { postPageLink: string } }) {
	const data = await requireArticle('usa', String(params.postPageLink));
	return <ArticlePage data={data} country="usa" postPageLink={params.postPageLink} />;
}
