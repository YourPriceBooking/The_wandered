import { authorIdentifier } from '@/utils/authorIdentity';
export { serializeStructuredData } from '@/utils/structuredData';
import { pageMetadata } from '@/utils/seoMetadata';
import type { Metadata } from 'next';
import { authorsCopy, type AuthorsLanguage } from './authorsCopy';
import { authorSocialLinks, safeProfileUrl } from './authorProfiles';
import { directoryAnchor, type DirectoryEntry } from './authorDirectory';

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
  const common = pageMetadata({ title, description: copy.meta, path: url, language, image: { ...image, type: 'image/png' } });
  return {
    ...common,
    alternates: { canonical: url, languages: authorsAlternates },
    openGraph: {
      ...common.openGraph,
      alternateLocale: Object.entries(ogLocales).filter(([lang]) => lang !== language).map(([, locale]) => locale),
    },
  };
}

export function localizedAuthorBio(author: DirectoryEntry, language: AuthorsLanguage): string {
  if (language !== 'en' && author.name === 'Viacheslav Nikitenko') return authorsCopy[language].editorBio;
  if (language !== 'en' && author.name === 'Andy Ray') return authorsCopy[language].andyBio;
  return author.description;
}

export function authorsStructuredData(authors: DirectoryEntry[], language: AuthorsLanguage) {
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
          ...('_id' in author ? { '@id': authorIdentifier(author._id) } : {}),
          name: author.name,
          url: `${url}#${directoryAnchor(author)}`,
          description: localizedAuthorBio(author, language),
          ...(safeProfileUrl(author.image) ? { image: safeProfileUrl(author.image) } : {}),
          sameAs: authorSocialLinks(author.links).map((link) => link.url),
        },
      })),
    },
  };
}
