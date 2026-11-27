import { getListingPosts } from '@/services/getListingPosts';
import { articleCountries } from '@/utils/articleUrl';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const country = articleCountries.find((section) => section === query.get('section'));
  const page = Number(query.get('page'));
  if (!country || !Number.isSafeInteger(page) || page < 1 || String(page) !== query.get('page')) {
    return new Response(null, { status: 400 });
  }

  try {
    const data = await getListingPosts({ country, page });
    return Response.json(data, { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
  } catch {
    return new Response(null, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
