import { authorSocialLinks, directoryAuthors, type DirectoryAuthor } from '@/defaultData/authorProfiles';
import type { AuthorsLanguage } from './authorsCopy';

type EditorialContributor = Omit<DirectoryAuthor, '_id'> & { editorialKey: string; role: string };
export type DirectoryEntry = DirectoryAuthor | EditorialContributor;

const lizaProfile = 'https://x.com/Liza__Nikitenko';
const lizaCopy = {
  en: { role: 'Contributor', description: 'Liza Nikitenko wrote for TravelQ about Kyiv’s theatre scene, including puppet theatre, operetta, opera and ballet.' },
  uk: { role: 'Авторка', description: 'Ліза Нікітенко писала для TravelQ про театральне життя Києва: театр ляльок, оперету, оперу та балет.' },
  pl: { role: 'Autorka', description: 'Liza Nikitenko pisała dla TravelQ o kijowskiej scenie teatralnej, w tym o teatrze lalek, operetce, operze i balecie.' },
} satisfies Record<AuthorsLanguage, Pick<EditorialContributor, 'role' | 'description'>>;

const lizaNames = new Set(['liza nikitenko', 'ліза нікітенко', 'елізавета нікітенко', 'єлизавета нікітенко', 'лиза никитенко', 'yelyzaveta nikitenko', 'elizaveta nikitenko']);

function isLiza(author: DirectoryAuthor) {
  const name = author.name.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
  if (lizaNames.has(name)) return true;
  return authorSocialLinks(author.links).some(({ label, url }) => {
    if (label !== 'X') return false;
    const { hostname, pathname } = new URL(url);
    return /^(?:www\.)?(?:x|twitter)\.com$/.test(hostname)
      && /^\/liza__nikitenko\/?$/i.test(pathname);
  });
}

/** The attributed TravelQ contributor is a directory card until an API record exists. */
export function authorDirectory(value: unknown, language: AuthorsLanguage): DirectoryEntry[] {
  const authors = directoryAuthors(value);
  if (authors.some(isLiza)) return authors;
  return [...authors, {
    editorialKey: 'liza-nikitenko',
    name: 'Liza Nikitenko',
    image: '',
    links: { x: lizaProfile },
    ...lizaCopy[language],
  }];
}

export function directoryAnchor(author: DirectoryEntry) {
  return `author-${encodeURIComponent('_id' in author ? author._id : author.editorialKey)}`;
}
