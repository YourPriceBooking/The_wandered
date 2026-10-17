import { getAllPosts } from '@/services/getPosts';
import { getDailyJournalPosts } from '@/services/getDailyJournalPosts';
import type { postData } from '@/types/postTypes';
import type { JournalPostType } from '@/types/historyTypes';
import type { MetadataRoute } from 'next';
import { authorsPaths, authorsAlternates } from '@/defaultData/authorsSeo';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.thewandered.com';
  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl },
    { url: `${baseUrl}/private-policy` },
    { url: `${baseUrl}/daily-journal-of-your-price-booking-service-history` },
    ...Object.values(authorsPaths).map((path) => ({
      url: `${baseUrl}${path}`,
      alternates: { languages: authorsAlternates },
    })),
  ];

  try {
    const articles: postData[] = (await getAllPosts()) || [];
    const journals = await getDailyJournalPosts();
    return [
      ...staticEntries,
      ...articles.map((article) => ({ url: article.articleUrl, lastModified: new Date().toISOString() })),
      ...(journals?.result?.map((journal: JournalPostType) => ({ url: journal.url, lastModified: new Date().toISOString() })) ?? []),
    ];
  } catch (error) {
    console.error('Sitemap error:', error);
    return staticEntries;
  }
}
