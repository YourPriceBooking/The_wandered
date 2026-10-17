import { articleCountries, siteUrl } from '@/utils/articleUrl';

export type PageviewRow = { url: string; pageviews: number };
export type SectionTotals = Record<string, number>;

export function normalizeAnalyticsPath(value: string): string {
  let path = /^https?:\/\//.test(value) ? new URL(value).pathname : value.split(/[?#]/)[0];
  path = '/' + path.replace(/^\/+|\/+$/g, '');
  try { return decodeURIComponent(path); } catch { return path; }
}

function sectionPaths(articleUrls: string[]): Map<string, Set<string>> {
  const sections = new Map<string, Set<string>>(articleCountries.map(country => [country, new Set([country === 'home' ? '/' : '/' + country])]));
  for (const value of articleUrls) {
    const path = normalizeAnalyticsPath(value);
    const prefix = new URL(value, siteUrl).pathname.split('/')[1];
    const country = articleCountries.find(country => country !== 'home' && country === prefix) || 'home';
    sections.get(country)!.add(path);
  }
  return sections;
}

export function analyticsQueryPaths(articleUrls: string[]): string[] {
  const paths = new Set<string>();
  const rawPaths = [
    ...articleCountries.map(country => country === 'home' ? '/' : '/' + country),
    ...articleUrls.map(value => new URL(value, siteUrl).pathname),
  ];
  for (const raw of rawPaths) {
    const path = normalizeAnalyticsPath(raw);
    // Include exact canonical, decoded and browser-encoded historical paths.
    for (const variant of [raw, path, encodeURI(path)]) {
      paths.add(variant);
      if (variant !== '/') paths.add(variant + '/');
    }
  }
  return Array.from(paths);
}

export function aggregatePageviews(rows: PageviewRow[], articleUrls: string[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (typeof row.url !== 'string' || !row.url.startsWith('/')) throw new Error('Invalid analytics page path');
    if (!Number.isSafeInteger(row.pageviews) || row.pageviews < 0) throw new Error('Invalid analytics view count');
    const path = normalizeAnalyticsPath(row.url);
    const total = (counts.get(path) || 0) + row.pageviews;
    if (!Number.isSafeInteger(total)) throw new Error('Analytics view count exceeds safe integer range');
    counts.set(path, total);
  }
  const sectionTotals: SectionTotals = {};
  for (const [country, paths] of Array.from(sectionPaths(articleUrls))) {
    const total = Array.from(paths).reduce((sum, path) => sum + (counts.get(path) || 0), 0);
    if (!Number.isSafeInteger(total)) throw new Error('Section view count exceeds safe integer range');
    sectionTotals[country] = total;
  }
  return { pageviewsData: Array.from(counts).map(([url, pageviews]) => ({ url, pageviews })), sectionTotals };
}
