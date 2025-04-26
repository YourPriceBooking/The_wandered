import { getAllPosts } from '@/services/getPosts';
import { getDailyJournalPosts } from '@/services/getDailyJournalPosts';
import { postData } from '@/types/postTypes';
import { JournalPostType } from '@/types/historyTypes';

export default async function sitemap() {
	const baseUrl = 'https://www.thewandered.com';

	const articles: postData[] | [] = (await getAllPosts()) || [];
	const journals = await getDailyJournalPosts();

	const articlesUrls =
		articles.map((article: postData) => {
			return {
				url: article.articleUrl,
				lastModified: new Date().toISOString(),
			};
		}) ?? [];

	const journalsUrls =
		journals.result.map((journal: JournalPostType) => {
			return {
				url: journal.url,
				lastModified: new Date().toISOString(),
			};
		}) ?? [];

	return [
		{
			url: baseUrl,
			lastModified: new Date().toISOString(),
		},
		{
			url: `${baseUrl}/private-policy`,
			lastModified: new Date().toISOString(),
		},
		{
			url: `${baseUrl}/daily-journal-of-your-price-booking-service-history`,
			lastModified: new Date().toISOString(),
		},
		...articlesUrls,
		...journalsUrls,
	];
}
