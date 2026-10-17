import type { Metadata } from 'next';
import { authorsCopy, type AuthorsLanguage } from './authorsCopy';
import { authorSocialLinks, safeProfileUrl, type DirectoryAuthor } from './authorProfiles';

export const authorsBaseUrl = 'https://www.thewandered.com';
export const authorsPaths = { en: '/authors', uk: '/ukraine/authors', pl: '/poland/authors' };
const ogLocales = { en: 'en_US', uk: 'uk_UA', pl: 'pl_PL' };
export const authorsAlternates = {
  ...Object.fromEntries(Object.entries(authorsPaths).map(([lang, path]) => [lang, `${authorsBaseUrl}${path}`])),
  'x-default': `${authorsBaseUrl}/authors`,
};

export function authorsMetadata(language: AuthorsLanguage): Metadata {
  const copy = authorsCopy[language];
  const title = `${copy.title} | The Wandered`;
  const url = `${authorsBaseUrl}${authorsPaths[language]}`;
  const image = { url: `${authorsBaseUrl}/authors-og-${language}.png`, width: 1200, height: 630, alt: `${copy.title} — Viacheslav Nikitenko, Andy Ray` };
  return {
    title,
    description: copy.meta,
    alternates: { canonical: url, languages: authorsAlternates },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website', siteName: 'The Wandered', title, description: copy.meta, url,
      locale: ogLocales[language],
      alternateLocale: Object.entries(ogLocales).filter(([lang]) => lang !== language).map(([, locale]) => locale),
      images: [image],
    },
    twitter: { card: 'summary_large_image', title, description: copy.meta, images: [image] },
  };
}

export function localizedAuthorBio(author: DirectoryAuthor, language: AuthorsLanguage): string {
  if (language !== 'en' && author.name === 'Viacheslav Nikitenko') return authorsCopy[language].editorBio;
  if (language !== 'en' && author.name === 'Andy Ray') return authorsCopy[language].andyBio;
  return author.description;
}

export function authorsStructuredData(authors: DirectoryAuthor[], language: AuthorsLanguage) {
  const copy = authorsCopy[language];
  const url = `${authorsBaseUrl}${authorsPaths[language]}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    url, name: copy.title, description: copy.meta, inLanguage: language,
    isPartOf: { '@type': 'WebSite', '@id': `${authorsBaseUrl}/#website`, name: 'The Wandered', url: authorsBaseUrl },
    mainEntity: {
      '@type': 'ItemList', numberOfItems: authors.length,
      itemListElement: authors.map((author, index) => ({
        '@type': 'ListItem', position: index + 1,
        item: {
          '@type': 'Person',
          '@id': `${authorsBaseUrl}/#author-${encodeURIComponent(author._id)}`,
          name: author.name,
          url: `${url}#author-${encodeURIComponent(author._id)}`,
          description: localizedAuthorBio(author, language),
          ...(safeProfileUrl(author.image) ? { image: safeProfileUrl(author.image) } : {}),
          sameAs: authorSocialLinks(author.links).map((link) => link.url),
        },
      })),
    },
  };
}

export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
