import { getPosts } from '@/services/getPosts';
import { postData } from '@/types/postTypes';

export default async function sitemap() {
	const baseUrl = 'https://www.thewandered.com';

	const data = await getPosts({ page: 1 });
	const articleUrls =
		data.result.map((article: postData) => {
			return {
				url: article.articleUrl,
				lastModified: new Date().toISOString(),
			};
		}) ?? [];

	return [
		{
			url: baseUrl,
			lastModified: new Date().toISOString(),
		},
		...articleUrls,
	];
}
