import { authorSocialLinks, directoryAuthors, fallbackAuthors, type DirectoryAuthor } from '@/defaultData/authorProfiles';
import type { AuthorsLanguage } from './authorsCopy';

type EditorialContributor = Omit<DirectoryAuthor, '_id'> & { editorialKey: string; role: string };
export type DirectoryEntry = DirectoryAuthor | EditorialContributor;

const lizaProfile = 'https://x.com/Liza__Nikitenko';
const lizaCopy = {
  en: {
    role: 'Contributor',
    description: 'Liza Nikitenko studies at the I. K. Karpenko-Karyi Kyiv National University of Theatre, Cinema and Television. She works on videos, documentary projects and interviews, with a focus on audiovisual content, journalism and television production.',
  },
  uk: {
    role: 'Авторка',
    description: 'Ліза Нікітенко навчається в Київському національному університеті театру, кіно і телебачення імені І. К. Карпенка-Карого. Працює над відеоматеріалами, документальними проєктами та інтерв’ю. Її основні напрями — аудіовізуальний контент, журналістика й телевізійне виробництво.',
  },
  pl: {
    role: 'Autorka',
    description: 'Liza Nikitenko studiuje na Kijowskim Narodowym Uniwersytecie Teatru, Kina i Telewizji im. Iwana Karpenki-Karego. Tworzy materiały wideo, projekty dokumentalne i wywiady. Koncentruje się na treściach audiowizualnych, dziennikarstwie i produkcji telewizyjnej.',
  },
} satisfies Record<AuthorsLanguage, Pick<EditorialContributor, 'role' | 'description'>>;

const lizaNames = new Set(['liza nikitenko', 'ліза нікітенко', 'елізавета нікітенко', 'єлизавета нікітенко', 'лиза никитенко', 'yelyzaveta nikitenko', 'elizaveta nikitenko']);

function hasLizaProfile(author: DirectoryAuthor) {
  return authorSocialLinks(author.links).some(({ label, url }) => {
    if (label !== 'X') return false;
    const { hostname, pathname } = new URL(url);
    return /^(?:www\.)?(?:x|twitter)\.com$/.test(hostname)
      && /^\/liza__nikitenko\/?$/i.test(pathname);
  });
}

function isLiza(author: DirectoryAuthor) {
  const name = author.name.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
  return lizaNames.has(name) || hasLizaProfile(author);
}

const normalizeAuthorName = (name: string) => name.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
const andyFallback = fallbackAuthors.find(({ _id }) => _id === '693f2b9a6afb2c045cce5f48');

/** Keep the localized editorial bio when a CMS record supplies Liza's profile. */
export function authorDirectory(value: unknown, language: AuthorsLanguage): DirectoryEntry[] {
  const authors = directoryAuthors(value);
  // A partial CMS response must not remove Andy's established public profile.
  if (andyFallback && !authors.some((author) => author._id === andyFallback._id
    || normalizeAuthorName(author.name) === normalizeAuthorName(andyFallback.name))) {
    authors.push(andyFallback);
  }
  const liza = authors.find(isLiza);
  if (liza) return authors.map((author) => author === liza ? {
    ...author,
    description: lizaCopy[language].description,
    links: hasLizaProfile(author) ? author.links : [{ x: lizaProfile }, author.links],
  } : author);
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
