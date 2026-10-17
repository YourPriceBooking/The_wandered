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
    const data = await getArticleForMetadata('uncharted-planet', String(params.postPageLink));
	if (data === undefined) return articleErrorMetadata('uncharted-planet');
	if (data === null) return articleMissingMetadata('uncharted-planet');
	return articleMetadata(data, 'uncharted-planet', params.postPageLink);
}

export default async function Post({
	params,
}: {
	params: { postPageLink: string };
}) {
	const data = await requireArticle('uncharted-planet', String(params.postPageLink));
	return <ArticlePage data={data} country='uncharted-planet' postPageLink={params.postPageLink} />;
}

