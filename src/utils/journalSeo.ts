export const journalPath = '/daily-journal-of-your-price-booking-service-history';
export const newEpisodesPath = `${journalPath}/new-episodes`;

export function journalPage(value: string | string[] | undefined): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}

export function journalCanonical(path: typeof journalPath | typeof newEpisodesPath, value: string | string[] | undefined): string {
  const page = journalPage(value);
  return `https://www.thewandered.com${path}${page > 1 ? `?page=${page}` : ''}`;
}
