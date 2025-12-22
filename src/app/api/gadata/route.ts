import path from 'path';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getAllPosts } from '@/services/getPosts';
import { postData } from '@/types/postTypes';

dotenv.config();

export const dynamic = 'force-dynamic';

export async function GET(req: any) {

	try{
    	const data: postData[] | string | undefined = await getAllPosts();

    	if (!Array.isArray(data) || data.length === 0) {
    	  console.error('[gadata] Invalid posts data:', data);
    	  return NextResponse.json(
    	    { pageviewsData: [] },
    	    { status: 200 }
    	  );
    	}

		const urls: string[] = data.flatMap((item: postData) => {
			const articleSlug = item.articleUrl.split('/').pop();

			let baseUrl = '';

			if (item.country !== 'home') {
				baseUrl = `/${item.country}/${articleSlug}`;
			} else {
				baseUrl = `/${articleSlug}`;
			}

			return baseUrl;
		});

    	if (urls.length === 0) {
    	  console.warn('[gadata] No URLs to query GA');
    	  return NextResponse.json({ pageviewsData: [] }, { status: 200 });
    	}
		
		const keyFile = path.join(process.cwd(), 'the-wandered-957bac979b04.json');
		// const key = JSON.parse(await fs.readFile(keyFile, 'utf8'));

    	const client = new google.auth.JWT(
    	  process.env.GA4_CLIENT_EMAIL,
    	  undefined,
    	  process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    	  ['https://www.googleapis.com/auth/analytics.readonly']
    	);

    	await client.authorize();

    	const analytics = google.analyticsdata({
    	  version: 'v1beta',
    	  auth: client,
    	});
		const countryRoots = Array.from(new Set(
			data.map(p => p.country).filter(c => c && c !== 'home')
			)).flatMap(c => [`/${c}`, `/${c}/`]);
		const homeRoots = ['/'];

        const urlsUnique = Array.from(new Set([ ...urls, ...countryRoots, ...homeRoots ]));

    	const response = await analytics.properties.runReport({
    	  property: 'properties/453172943',
    	  requestBody: {
    	    dateRanges: [{ startDate: '2024-08-01', endDate: 'today' }],
    	    metrics: [{ name: 'screenPageViews' }],
    	    dimensions: [{ name: 'pagePath' }],
    	    dimensionFilter: {
    	      filter: {
    	        fieldName: 'pagePath',
    	        inListFilter: { values: urlsUnique },
    	      },
    	    },
    	  },
    	});

    const pageviewsData =
      response.data.rows?.map((row) => ({
        url: row.dimensionValues?.[0]?.value ?? '',
        pageviews: Number(row.metricValues?.[0]?.value ?? 0),
      })) ?? [];

    return NextResponse.json({ pageviewsData });
  } catch (err: any) {
    console.error('[gadata] Fatal error:', err);
    return NextResponse.json(
      {
        pageviewsData: [],
        error: err?.message || 'Unknown error',
      },
      { status: 200 }
    );
  }
}


// 	if (Array.isArray(data)) {
// 		try {
// 		} catch (error: any) {
// 			console.error('Error fetching GA data:', error);
// 			if (error.response) {
// 				console.error('Error Response:', error.response.data);
// 				console.error('Error Status:', error.response.status);
// 				console.error('Error Headers:', error.response.headers);
// 			} else if (error.request) {
// 				console.error('Error Request:', error.request);
// 			} else {
// 				console.error('Error Message:', error.message);
// 			}
// 			return NextResponse.json({ error: 'Failed to fetch GA data', details: error.message });
// 		}
// 	}
// }
