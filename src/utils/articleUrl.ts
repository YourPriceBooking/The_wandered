export const siteUrl = 'https://www.thewandered.com';
export const articleCountries = ['home', 'ukraine', 'poland', 'usa', 'canada', 'australia', 'singapore', 'uncharted-planet'] as const;

export function articleCanonical(country: string, slug: string): string {
  // Next 14 params can contain an encoded segment. Decode once, then encode as ONE segment.
  try { slug = decodeURIComponent(slug); } catch { /* A literal percent sign is valid content. */ }
  return `${siteUrl}/${country === 'home' ? '' : country + '/'}${encodeURIComponent(slug)}`;
}
export function canonicalArticleUrl(value: unknown, country: string): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || !['thewandered.com', 'www.thewandered.com'].includes(url.hostname) || url.username || url.password || url.port) return undefined;
    const segments = url.pathname.replace(/\/$/, '').split('/').filter(Boolean);
    if (country === 'home' ? segments.length !== 1 : segments.length !== 2 || segments[0] !== country) return undefined;
    const slug = segments[segments.length - 1];
    const reserved = ['authors', 'private-policy', 'travel-resources', 'wandered-posts', 'daily-journal-of-your-price-booking-service-history', ...articleCountries];
    if (country === 'home' && reserved.includes(slug)) return undefined;
    return articleCanonical(country, slug);
  } catch { return undefined; }
}
