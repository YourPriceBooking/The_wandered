export type AuthorsLanguage = 'en' | 'uk' | 'pl';

export const authorsCopy = {
  en: {
    title: 'Meet our authors',
    intro: 'The people behind The Wandered. Different perspectives, shared curiosity — and stories worth exploring.',
    about: 'Behind the stories',
    aboutText: 'Travel, architecture, and a curiosity about the world. Get to know the voices shaping The Wandered.',
    count: 'Authors',
    socials: 'Social profiles',
    newTab: 'opens in a new tab',
    editorRole: 'Traveler · Entrepreneur · Editor-in-chief',
    andyRole: 'Architect · Artist · Traveler · Researcher',
    editorBio: '',
    andyBio: '',
    meta: 'Meet the authors of The Wandered: travel perspectives from Viacheslav Nikitenko and Uncharted Planet author Andy Ray.',
  },
  uk: {
    title: 'Наші автори',
    intro: 'Люди, які створюють The Wandered. Різні погляди, спільна цікавість і історії, які варто відкрити.',
    about: 'Хто створює наші історії',
    aboutText: 'Подорожі, архітектура та цікавість до світу. Познайомтеся з авторами The Wandered.',
    count: 'Авторів',
    socials: 'Соціальні мережі',
    newTab: 'відкриється в новій вкладці',
    editorRole: 'Мандрівник · Підприємець · Головний редактор',
    andyRole: 'Архітектор · Художник · Мандрівник · Дослідник',
    editorBio: 'Мандрівник, головний редактор блогу The Wandered, підприємець, співзасновник і CEO Your Price Booking.',
    andyBio: 'Автор розділу Uncharted Planet — архітектор і художник, мандрівник та дослідник, прихильник альтернативної історії. Поєднуючи професійний архітектурний погляд, візуальне мислення та польові спостереження, він досліджує стародавні цивілізації, загадкові споруди й сліди знань, що не вписуються в загальноприйняті історичні уявлення.',
    meta: 'Познайомтеся з авторами The Wandered: головним редактором Viacheslav Nikitenko та автором Uncharted Planet Andy Ray.',
  },
  pl: {
    title: 'Nasi autorzy',
    intro: 'Ludzie, którzy tworzą The Wandered. Różne perspektywy, wspólna ciekawość i historie warte odkrycia.',
    about: 'Kto tworzy nasze historie',
    aboutText: 'Podróże, architektura i ciekawość świata. Poznaj autorów The Wandered.',
    count: 'Autorzy',
    socials: 'Profile społecznościowe',
    newTab: 'otwiera się w nowej karcie',
    editorRole: 'Podróżnik · Przedsiębiorca · Redaktor naczelny',
    andyRole: 'Architekt · Artysta · Podróżnik · Badacz',
    editorBio: 'Podróżnik, redaktor naczelny bloga The Wandered, przedsiębiorca, współzałożyciel i CEO Your Price Booking.',
    andyBio: 'Autor działu Uncharted Planet — architekt i artysta, podróżnik i badacz oraz zwolennik historii alternatywnej. Łącząc profesjonalne spojrzenie architekta, myślenie wizualne i obserwacje terenowe, bada starożytne cywilizacje, zagadkowe budowle i ślady wiedzy, które nie mieszczą się w powszechnie przyjętych narracjach historycznych.',
    meta: 'Poznaj autorów The Wandered: redaktora naczelnego Viacheslava Nikitenko oraz autora Uncharted Planet, Andy’ego Raya.',
  },
};

export function authorsPath(section?: string) {
  if (section === 'ukraine' || section === 'poland') return `/${section}/authors`;
  return '/authors';
}
