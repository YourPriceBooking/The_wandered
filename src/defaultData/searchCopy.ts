const searchCopy = {
  en: {
    lang: 'en',
    prompt: 'Where will your curiosity take you?',
    placeholder: 'Search articles…',
    label: 'Search articles',
    button: 'Search',
    section: 'section',
    viewsPrefix: 'we have ',
  },
  ukraine: {
    lang: 'uk',
    prompt: 'Куди приведе вас цікавість?',
    placeholder: 'Пошук статей…',
    label: 'Пошук статей',
    button: 'Знайти',
    section: 'розділ',
    viewsPrefix: 'переглядів: ',
  },
  poland: {
    lang: 'pl',
    prompt: 'Dokąd zaprowadzi Cię ciekawość?',
    placeholder: 'Szukaj artykułów…',
    label: 'Wyszukiwanie artykułów',
    button: 'Szukaj',
    section: 'sekcja',
    viewsPrefix: 'wyświetlenia: ',
  },
};

export function getSearchCopy(country?: string) {
  if (country === 'ukraine' || country === 'poland') return searchCopy[country];
  return searchCopy.en;
}
