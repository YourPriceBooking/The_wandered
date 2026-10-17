import { articleDate } from '@/utils/articleDate';
import type { Metadata } from 'next';
import type { postData } from '@/types/postTypes';
import { normalizeImageUrl } from '@/utils/normalizeImageUrl';
import { journalPage } from '@/utils/journalSeo';
import { authorProfile } from '@/utils/authorIdentity';

import { articleCanonical, siteUrl } from '@/utils/articleUrl';
export { articleCanonical, siteUrl } from '@/utils/articleUrl';
export type SeoLanguage = 'en' | 'uk' | 'pl';
export const seoLocales = { en: 'en_US', uk: 'uk_UA', pl: 'pl_PL' };
export const languageForCountry = (country: string): SeoLanguage => country === 'ukraine' ? 'uk' : country === 'poland' ? 'pl' : 'en';
export const listingPage = journalPage;

type SocialImage = { url: string; alt: string; width: number; height: number; type: string };
export function socialImage(key: string, alt: string): SocialImage {
  return { url: `${siteUrl}/social/${key}.png`, alt, width: 1200, height: 630, type: 'image/png' };
}

export function pageMetadata({ title, description, path, language = 'en', image, index = true }: {
  title: string; description: string; path?: string; language?: SeoLanguage; image: SocialImage; index?: boolean;
}): Metadata {
  const url = path ? new URL(path, siteUrl).href : undefined;
  return {
    // Next 14.2 drops the query from og:url when metadataBase is set and the
    // pathname is "/". All URL fields here are already absolute; disable base
    // resolution only for this case to preserve the paginated homepage URL.
    metadataBase: url && new URL(url).pathname === '/' ? null : new URL(siteUrl),
    title, description,
    ...(url && index ? { alternates: { canonical: url } } : {}),
    robots: { index, follow: true },
    openGraph: { type: 'website', siteName: 'The Wandered', title, description, ...(url ? { url } : {}), locale: seoLocales[language], images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export const listingCopy = {
  home: { path: '/', language: 'en', title: 'Travel stories, destinations & practical tips | The Wandered', description: 'Explore travel stories, destination guides and practical tips for curious travelers. Discover places, people and ideas with The Wandered.', label: 'Stories for curious travelers' },
  ukraine: { path: '/ukraine', language: 'uk', title: 'Подорожі Україною: міста, природа та маршрути | The Wandered', description: 'Відкривайте Україну з The Wandered: міста, Карпати, культура та природні пам’ятки. Історії, маршрути й практичні поради для подорожей.', label: 'Подорожі Україною' },
  poland: { path: '/poland', language: 'pl', title: 'Podróże po Polsce: miasta, natura i trasy | The Wandered', description: 'Odkrywaj Polskę z The Wandered: miasta, przyrodę, kulturę i ciekawe trasy. Historie oraz praktyczne wskazówki dla podróżnych.', label: 'Podróże po Polsce' },
  usa: { path: '/usa', language: 'en', title: 'USA travel: road trips, cities & national parks | The Wandered', description: 'Explore the USA with travel stories about road trips, national parks, cities and places to stay. Find inspiration and practical tips on The Wandered.', label: 'Explore the USA' },
  canada: { path: '/canada', language: 'en', title: 'Canada travel: cities, lakes & wild landscapes | The Wandered', description: 'Discover Canada through travel stories about its cities, lakes, national parks and wild landscapes. Explore routes and practical notes on The Wandered.', label: 'Discover Canada' },
  australia: { path: '/australia', language: 'en', title: 'Australia travel: coastlines, cities & road trips | The Wandered', description: 'Discover Australia’s coastlines, cities and remarkable landscapes. Find travel stories, road trip inspiration and practical tips on The Wandered.', label: 'Explore Australia' },
  singapore: { path: '/singapore', language: 'en', title: 'Singapore travel: city guides, culture & local tips | The Wandered', description: 'Explore Singapore through stories about its neighborhoods, culture, food and city life. Find inspiration and practical travel tips on The Wandered.', label: 'Discover Singapore' },
  'uncharted-planet': { path: '/uncharted-planet', language: 'en', title: 'Uncharted Planet: ancient places & mysteries | The Wandered', description: 'Explore ancient sites, lost civilizations and remote places with Uncharted Planet. Stories about Earth’s mysteries and remarkable destinations on The Wandered.', label: 'Uncharted Planet' },
} satisfies Record<string, { path: string; language: SeoLanguage; title: string; description: string; label: string }>;

export function listingMetadata(country: keyof typeof listingCopy, value?: string | string[]): Metadata {
  const copy = listingCopy[country];
  const page = listingPage(value);
  const suffix = page > 1 ? ` — ${copy.language === 'uk' ? 'Сторінка' : copy.language === 'pl' ? 'Strona' : 'Page'} ${page}` : '';
  return pageMetadata({ ...copy, title: copy.title + suffix, path: copy.path + (page > 1 ? `?page=${page}` : ''), image: socialImage(country, copy.label) });
}

const fallbackCopy = {
  en: { label: 'Travel stories & discoveries', description: 'Read travel stories, discoveries and practical tips on The Wandered.' },
  uk: { label: 'Історії та відкриття у подорожах', description: 'Читайте історії, відкриття та практичні поради для подорожей на The Wandered.' },
  pl: { label: 'Historie i odkrycia w podróży', description: 'Czytaj historie, odkrycia i praktyczne porady podróżnicze na The Wandered.' },
};
function plainText(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
export function articleSocialImage(data: postData, language: SeoLanguage): SocialImage {
  const hero = normalizeImageUrl(data.imageUrl)[0];
  try {
    const url = new URL(hero?.url || '');
    // Only our known image CDN has a guaranteed HTTPS endpoint and predictable crop dimensions.
    if (['http:', 'https:'].includes(url.protocol) && url.hostname === 'res.cloudinary.com' && !url.username && !url.password && !url.port && url.pathname.startsWith('/your-price-booking/image/upload/')) {
      url.protocol = 'https:';
      url.pathname = url.pathname.replace('/image/upload/', '/image/upload/c_fill,w_1200,h_630,f_jpg,q_auto/');
      return { url: url.href, alt: plainText(hero.context.alt || data.heading), width: 1200, height: 630, type: 'image/jpeg' };
    }
  } catch { /* Missing or unsupported images use a real, localized public PNG. */ }
  return socialImage(`article-${language}`, fallbackCopy[language].label);
}
export function articleMetadata(data: postData, country: string, slug: string): Metadata {
  const language = languageForCountry(country);
  const title = plainText(data.heading);
  const description = plainText(data.description) || fallbackCopy[language].description;
  const url = articleCanonical(country, slug);
  const image = articleSocialImage(data, language);
  const author = plainText(data.author);
  const profileUrl = authorProfile(author, country)?.url;
  const publishedTime = articleDate(data.publicationDate);
  const modifiedTime = articleDate(data.changeDate);
  const common = pageMetadata({ title, description, path: url, language, image });
  return {
    ...common,
    ...(author ? { authors: [{ name: author, ...(profileUrl ? { url: profileUrl } : {}) }] } : {}),
    openGraph: { ...common.openGraph, type: 'article', ...(profileUrl ? { authors: [profileUrl] } : {}), ...(publishedTime ? { publishedTime } : {}), ...(modifiedTime ? { modifiedTime } : {}) },
  };
}
