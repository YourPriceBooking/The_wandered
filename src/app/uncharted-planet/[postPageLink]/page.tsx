import { articleMissingMetadata, articleErrorMetadata } from '@/utils/articleMissingMetadata';
import ArticlePage from '@/components/ArticlePage/ArticlePage';
import { getArticleForMetadata, requireArticle } from '@/services/getArticle';
import { Metadata } from 'next';
import { normalizeImageUrl, getImageUrl } from '@/utils/normalizeImageUrl';

export async function generateMetadata({
    params,
}: {
    params: { postPageLink: string };
}): Promise<Metadata> {
    const data = await getArticleForMetadata('uncharted-planet', String(params.postPageLink));
	if (data === undefined) return articleErrorMetadata('uncharted-planet');
	if (data === null) return articleMissingMetadata('uncharted-planet');

    const normalizedImages = normalizeImageUrl(data.imageUrl as any);
    const imageUrl = getImageUrl(normalizedImages, 0) || '/default-image.jpg';

    return {
        title: data.heading,
        description: data.description,
        openGraph: {
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                },
            ],
        },
        icons: {
            icon: '/favicon.ico',
            shortcut: '/favicon.ico',
        },
    };
}

export default async function Post({
	params,
}: {
	params: { postPageLink: string };
}) {
	const data = await requireArticle('uncharted-planet', String(params.postPageLink));
	return <ArticlePage data={data} country='uncharted-planet' postPageLink={params.postPageLink} />;
}

