import type { MetadataRoute } from 'next';

// URL encoding does not replace XML escaping (for example, an & in an existing slug).
function escapeXml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '\uFFFD')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function serializeSitemap(entries: MetadataRoute.Sitemap): string {
  const urls = entries.map((entry) => {
    const lines = [`<loc>${escapeXml(entry.url)}</loc>`];
    if (entry.lastModified) {
      const date = typeof entry.lastModified === 'string' ? new Date(entry.lastModified) : entry.lastModified;
      if (!Number.isNaN(date.getTime())) lines.push(`<lastmod>${date.toISOString()}</lastmod>`);
    }
    for (const [language, url] of Object.entries(entry.alternates?.languages ?? {})) {
      if (url) lines.push(`<xhtml:link rel="alternate" hreflang="${escapeXml(language)}" href="${escapeXml(String(url))}" />`);
    }
    return `<url>\n${lines.join('\n')}\n</url>`;
  });
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.join('\n') + '\n</urlset>\n';
}
