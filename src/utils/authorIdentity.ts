import { fallbackAuthors } from '@/defaultData/authorProfiles';
import { siteUrl } from '@/utils/articleUrl';

export const authorIdentifier = (id: string) => `${siteUrl}/#author-${encodeURIComponent(id)}`;
export function authorProfile(name: string, country: string) {
  const author = fallbackAuthors.find((profile) => profile.name === name.trim());
  if (!author) return undefined;
  const path = country === 'ukraine' ? '/ukraine/authors' : country === 'poland' ? '/poland/authors' : '/authors';
  return { ...author, id: authorIdentifier(author._id), url: `${siteUrl}${path}#author-${encodeURIComponent(author._id)}` };
}
