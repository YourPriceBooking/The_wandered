const searchCopy = {
  en: {
    lang: 'en',
    prompt: 'Where will your curiosity take you?',
    placeholder: 'Search articles…',
    label: 'Search articles',
    button: 'Search',
    section: 'section',
    viewsPrefix: 'we have ',
    footerTitle: 'Find your next story',
    footerDescription: 'Places, routes, and ideas for your travels.',
  },
  ukraine: {
    lang: 'uk',
    prompt: 'Куди приведе вас цікавість?',
    placeholder: 'Пошук статей…',
    label: 'Пошук статей',
    button: 'Знайти',
    section: 'розділ',
    viewsPrefix: 'переглядів: ',
    footerTitle: 'Знайдіть наступну історію',
    footerDescription: 'Місця, маршрути та ідеї для ваших подорожей.',
  },
  poland: {
    lang: 'pl',
    prompt: 'Dokąd zaprowadzi Cię ciekawość?',
    placeholder: 'Szukaj artykułów…',
    label: 'Wyszukiwanie artykułów',
    button: 'Szukaj',
    section: 'sekcja',
    viewsPrefix: 'wyświetlenia: ',
    footerTitle: 'Znajdź kolejną historię',
    footerDescription: 'Miejsca, trasy i pomysły na Twoje podróże.',
  },
};

export function getSearchCopy(country?: string) {
  if (country === 'ukraine' || country === 'poland') return searchCopy[country];
  return searchCopy.en;
}
