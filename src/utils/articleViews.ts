/** Read a card's views by its own canonical pathname, never the homepage fallback. */
export function articleViews(pageviews: Record<string, string | number>, pathname?: string): string | number {
  if (!pathname || pathname === '/') return 0;
  let decoded = pathname;
  try { decoded = decodeURIComponent(pathname); } catch { /* Stored slugs can contain literal percent signs. */ }
  return pageviews[pathname] ?? pageviews[decoded] ?? 0;
}
