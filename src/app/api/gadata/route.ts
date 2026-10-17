import dotenv from 'dotenv';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getSitemapSnapshot } from '@/services/getSitemapEntries';
import { aggregatePageviews, analyticsQueryPaths, type PageviewRow } from '@/utils/pageviewTotals';

dotenv.config();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot = await getSitemapSnapshot();
    const articleUrls = snapshot.data.entries.map(entry => entry.url);
    const paths = analyticsQueryPaths(articleUrls);
    const client = new google.auth.JWT(
      process.env.GA4_CLIENT_EMAIL,
      undefined,
      process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/analytics.readonly'],
    );
    await client.authorize();
    const analytics = google.analyticsdata({ version: 'v1beta', auth: client });
    const rows: PageviewRow[] = [];
    // Bound each filter and avoid relying on GA's default report row limit.
    for (let offset = 0; offset < paths.length; offset += 1000) {
      const values = paths.slice(offset, offset + 1000);
      const response = await analytics.properties.runReport({
        property: 'properties/453172943',
        requestBody: {
          dateRanges: [{ startDate: '2024-08-01', endDate: 'today' }],
          metrics: [{ name: 'screenPageViews' }],
          dimensions: [{ name: 'pagePath' }],
          dimensionFilter: { filter: { fieldName: 'pagePath', inListFilter: { values, caseSensitive: true } } },
          limit: '1000',
        },
      });
      const reportRows = response.data.rows || [];
      if ((response.data.rowCount || 0) > reportRows.length) throw new Error('Incomplete analytics report');
      rows.push(...reportRows.map(row => ({
        url: row.dimensionValues?.[0]?.value || '',
        pageviews: Number(row.metricValues?.[0]?.value || 0),
      })));
    }
    return NextResponse.json(aggregatePageviews(rows, articleUrls));
  } catch (err: unknown) {
    console.error('[gadata] Failed to load complete section counts', err);
    return NextResponse.json({ pageviewsData: [], error: err instanceof Error ? err.message : 'Unknown error' }, { status: 200 });
  }
}
