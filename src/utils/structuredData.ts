import { articleDate } from '@/utils/articleDate';
export { articleDate } from '@/utils/articleDate';
import type { postData } from '@/types/postTypes';
import { articleCanonical, siteUrl } from '@/utils/articleUrl';
import { authorProfile } from '@/utils/authorIdentity';
import { languageForCountry } from '@/utils/seoMetadata';
import { normalizeImageUrl } from '@/utils/normalizeImageUrl';

export const publisher = { '@type': 'Organization', '@id': `${siteUrl}/#publisher`, name: 'Your Price Booking OÜ', url: 'https://www.yourpricebooking.com/' };
export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
export function contentImageUrl(value: string): string | undefined {
  try {
    const url = new URL(value, siteUrl);
    if (url.username || url.password) return undefined;
    if (url.protocol === 'http:' && url.hostname === 'res.cloudinary.com') url.protocol = 'https:';
    return url.protocol === 'https:' ? url.href : undefined;
  } catch { return undefined; }
}
const sectionNames: Record<string, string> = { ukraine: 'Україна', poland: 'Polska', usa: 'USA', canada: 'Canada', australia: 'Australia', singapore: 'Singapore', 'uncharted-planet': 'Uncharted Planet' };
export type Breadcrumb = { name: string; url: string };
export function articleBreadcrumbs(heading: string, country: string, slug: string): Breadcrumb[] {
  const language = languageForCountry(country);
  return [
    { name: language === 'uk' ? 'Головна' : language === 'pl' ? 'Strona główna' : 'Home', url: `${siteUrl}/` },
    ...(country !== 'home' && sectionNames[country] ? [{ name: sectionNames[country], url: `${siteUrl}/${country}` }] : []),
    { name: heading, url: articleCanonical(country, slug) },
  ];
}
export function breadcrumbStructuredData(items: Breadcrumb[]) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: item.url })) };
}
export function articleStructuredData(data: postData, country: string, slug: string) {
  const url = articleCanonical(country, slug);
  const profile = authorProfile(data.author, country);
  const published = articleDate(data.publicationDate), modified = articleDate(data.changeDate);
  // Use an image actually present in the story, never a generic social fallback.
  const hero = normalizeImageUrl(data.imageUrl)[0];
  const image = hero?.url && !hero.url.includes('/no-photo.webp') ? contentImageUrl(hero.url) : undefined;
  return {
    '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': `${url}#article`,
    url, headline: data.heading, ...(data.description.trim() ? { description: data.description } : {}),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@type': 'WebSite', '@id': `${siteUrl}/#website` },
    inLanguage: languageForCountry(country), publisher,
    ...(sectionNames[country] ? { articleSection: sectionNames[country] } : {}),
    ...(image ? { image: [image] } : {}),
    ...(data.author.trim() ? { author: { '@type': 'Person', name: data.author, ...(profile ? { '@id': profile.id, url: profile.url } : {}) } } : {}),
    ...(published ? { datePublished: published } : {}), ...(modified ? { dateModified: modified } : {}),
  };
}
export function websiteStructuredData() {
  return { '@context': 'https://schema.org', '@graph': [
    publisher,
    { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`, name: 'The Wandered', publisher: { '@id': publisher['@id'] }, inLanguage: 'en' },
  ] };
}
