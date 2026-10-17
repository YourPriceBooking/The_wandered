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
	const data = await getArticleForMetadata('australia', String(params.postPageLink));
	if (data === undefined) return articleErrorMetadata('australia');
	if (data === null) return articleMissingMetadata('australia');
	return articleMetadata(data, 'australia', params.postPageLink);
}

export default async function Post({ params }: { params: { postPageLink: string } }) {
	const data = await requireArticle('australia', String(params.postPageLink));
	return <ArticlePage data={data} country="australia" postPageLink={params.postPageLink} />;
}
