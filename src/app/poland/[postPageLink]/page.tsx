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
    const data = await getArticleForMetadata('poland', String(params.postPageLink));
	if (data === undefined) return articleErrorMetadata('poland');
	if (data === null) return articleMissingMetadata('poland');
	return articleMetadata(data, 'poland', params.postPageLink);
}

export default async function Post({
	params,
}: {
	params: { postPageLink: string };
}) {
	const data = await requireArticle('poland', String(params.postPageLink));
	return <ArticlePage data={data} country='poland' postPageLink={params.postPageLink} />;
}

