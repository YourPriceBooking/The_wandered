import { google } from 'googleapis';
import path from 'path';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import { getAllPosts } from '@/services/getPosts';
import { postData } from '@/types/postTypes';

export async function GET(req: any) {
	const { result } = await getAllPosts();

	const urls: string[] = result.map((item: postData) => '/' + item.articleUrl.split('/').pop());

	try {
		const keyFile = path.join(process.cwd(), 'the-wandered-957bac979b04.json');
		const key = JSON.parse(await fs.readFile(keyFile, 'utf8'));

		const client = new google.auth.JWT(key.client_email, undefined, key.private_key, [
			'https://www.googleapis.com/auth/analytics.readonly',
		]);

		await client.authorize();

		const analytics = google.analyticsdata({
			version: 'v1beta',
			auth: client,
		});

		const response = await analytics.properties.runReport({
			property: `properties/453172943`,
			requestBody: {
				// dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
				dateRanges: [{ startDate: '2024-08-01', endDate: 'today' }],
				metrics: [{ name: 'screenPageViews' }],
				dimensions: [{ name: 'pagePath' }],
				dimensionFilter: {
					filter: {
						fieldName: 'pagePath',
						inListFilter: {
							values: urls,
						},
					},
				},
			},
		});

		const pageviewsData =
			response.data.rows?.map((row) => ({
				url: row.dimensionValues?.[0]?.value,
				pageviews: row.metricValues?.[0]?.value,
			})) || [];

		// return NextResponse.json({ pageviewsData });
		const res = NextResponse.json({ pageviewsData });

		res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
		res.headers.set('Pragma', 'no-cache');
		res.headers.set('Expires', '0');
		res.headers.set('Surrogate-Control', 'no-store');

		res.headers.set('ETag', '');

		return res;
	} catch (error) {
		console.error('Error fetching GA data:', error);
		return NextResponse.json({ error: 'Failed to fetch GA data' });
	}
}
