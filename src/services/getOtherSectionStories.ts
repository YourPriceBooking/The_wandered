import { createArticleListService } from '@/services/articleListService';
import { articleDate } from '@/utils/articleDate';
import { articleCountries, canonicalArticleUrl, siteUrl } from '@/utils/articleUrl';
import { getImageUrl, normalizeImageUrl } from '@/utils/normalizeImageUrl';
import type { postData } from '@/types/postTypes';

type Section = (typeof articleCountries)[number];
type Story = {
  id: string;
  section: Section;
  href: string;
  heading: string;
  description: string;
  published: string;
  image: string;
};

const perSection = 2;
const timeoutMs = 3000;
const getPage = createArticleListService({
  fetcher: (url, options) => fetch(url, options),
  pageSize: perSection,
  timeoutMs,
  maxEntries: 16,
  skipInvalidCards: true,
});

function thumbnail(images: postData['imageUrl']) {
  const source = getImageUrl(normalizeImageUrl(images));
  if (source) {
    try {
      const url = source.startsWith('/') ? new URL(source, siteUrl) : new URL(source);
      if (url.protocol === 'http:' && url.hostname === 'res.cloudinary.com') url.protocol = 'https:';
      if (!url.username && !url.password) {
        if (url.origin === siteUrl && !url.pathname.startsWith('//')) return url.pathname + url.search;
        if (['https://res.cloudinary.com', 'https://s3-alpha-sig.figma.com'].includes(url.origin)) return url.href;
      }
    } catch { /* Older records can have an empty or unsupported lead image. */ }
  }
  return '/no-photo.webp';
}

async function latestInSection(section: Section, articleId: string, now: number) {
  const stories: Story[] = [];
  const publishedBy = new Date(now).toISOString();
  // The public archive is newest-first. Read another pair only to replace an
  // ineligible record, and stop starting lookups once the section budget expires.
  for (let page = 1; Date.now() - now < timeoutMs; page++) {
    try {
      const { result, total } = await getPage({ country: section, page });
      for (const post of result) {
        const href = canonicalArticleUrl(post.articleUrl, section);
        const published = articleDate(post.publicationDate);
        if (!href || !published || published > publishedBy || post.country !== section || post._id === articleId) continue;
        if (stories.some(story => story.id === post._id || story.href === href)) continue;
        stories.push({
          id: post._id, section, href, published, heading: post.heading,
          description: post.description.trim(), image: thumbnail(post.imageUrl),
        });
      }
      if (stories.length >= perSection || page * perSection >= total) break;
    } catch {
      break; // A failed optional source must not hide the article or other sections.
    }
  }
  return stories.sort((a, b) => b.published.localeCompare(a.published)).slice(0, perSection);
}

export async function getOtherSectionStories(current: string, articleId: string) {
  const now = Date.now();
  const sections = articleCountries.filter(section => section !== current);
  const groups = await Promise.all(sections.map(section => latestInSection(section, articleId, now)));
  return groups.filter(group => group.length).sort((a, b) => b[0].published.localeCompare(a[0].published)).flat();
}
