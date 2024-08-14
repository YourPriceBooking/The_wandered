import path from 'path';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import { getAllPosts } from '@/services/getPosts';
import { postData } from '@/types/postTypes';

dotenv.config();

export const dynamic = 'force-dynamic';

export async function GET(req: any) {
	const { result } = await getAllPosts();

	const urls: string[] = result.map((item: postData) => '/' + item.articleUrl.split('/').pop());

	try {
		const keyFile = path.join(process.cwd(), 'the-wandered-957bac979b04.json');
		// const key = JSON.parse(await fs.readFile(keyFile, 'utf8'));

		const client = new google.auth.JWT(
			process.env.GA4_CLIENT_EMAIL,
			undefined,
			process.env.GA4_PRIVATE_KEY!.replace(/\\n/gm, '\n'),
			['https://www.googleapis.com/auth/analytics.readonly'],
		);

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

		return NextResponse.json({ pageviewsData });
	} catch (error: any) {
		console.error('Error fetching GA data:', error);
		if (error.response) {
			console.error('Error Response:', error.response.data);
			console.error('Error Status:', error.response.status);
			console.error('Error Headers:', error.response.headers);
		} else if (error.request) {
			console.error('Error Request:', error.request);
		} else {
			console.error('Error Message:', error.message);
		}

		return NextResponse.json({ error: 'Failed to fetch GA data', details: error.message });
	}
}
