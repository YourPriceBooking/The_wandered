const shortcutHints = {
  en: {
    lang: 'en',
    travel: 'Explore live travel tools — maps, weather, flight tracking, and practical resources for your next trip.',
    planet: 'We explore ancient monuments, competing theories of their construction, and the people — or civilizations — behind them.',
    games: 'Discover our Game Zone — quick, casual games for a little escape between adventures.',
    booking: 'Find a hotel or a short-term daily rental and propose your own price with Your Price Booking.',
  },
  ukraine: {
    lang: 'uk',
    travel: 'Корисні інструменти для подорожей: інтерактивні карти, погода, відстеження рейсів і практичні ресурси для вашої наступної мандрівки.',
    planet: 'Досліджуємо стародавні пам’ятки, різні теорії їхнього будівництва та людей або цивілізації, які їх створили.',
    games: 'Відкрийте нашу ігрову зону — короткі невимушені ігри, щоб відпочити між пригодами.',
    booking: 'Знайдіть готель або житло подобово та запропонуйте власну ціну з Your Price Booking.',
  },
  poland: {
    lang: 'pl',
    travel: 'Przydatne narzędzia podróżnicze: interaktywne mapy, pogoda, śledzenie lotów i praktyczne zasoby na kolejną podróż.',
    planet: 'Odkrywamy starożytne zabytki, różne teorie ich budowy oraz ludzi lub cywilizacje, które je stworzyły.',
    games: 'Odkryj naszą strefę gier — krótkie, niezobowiązujące rozgrywki na chwilę relaksu między przygodami.',
    booking: 'Znajdź hotel lub nocleg na doby i zaproponuj własną cenę z Your Price Booking.',
  },
};

export function getShortcutHints(section?: string) {
  if (section === 'ukraine' || section === 'poland') return shortcutHints[section];
  return shortcutHints.en;
}
