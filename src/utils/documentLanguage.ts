export type DocumentLanguage = 'en' | 'uk' | 'pl';

export function documentLanguage(pathname: string): DocumentLanguage {
  const section = pathname.split('/')[1];
  return section === 'ukraine' ? 'uk' : section === 'poland' ? 'pl' : 'en';
}
