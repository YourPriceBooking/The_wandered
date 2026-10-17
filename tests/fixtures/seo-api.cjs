// Transport fixtures only for tests. No production switch or external network dependency.
require('./article-api.cjs');
const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const countries = ['home','ukraine','poland','usa','canada','australia','singapore','uncharted-planet'];
const identifier = (country, index) => (countries.indexOf(country) + 1).toString(16).padStart(2, '0') + index.toString(16).padStart(22, '0');
function article(country, index) {
  const heading = `Archive ${country} record ${index}`;
  return { _id: identifier(country, index), country, heading, title: heading, description: 'Archive fixture description', author: 'Fixture Author', publicationDate: '2026-10-17T07:00:00.000Z', changeDate: '', imageUrl: [{ url: `/no-photo.webp?fixture=${country}-${index}`, context: { alt: heading } }], markup: '<p>Archive body</p>', articleUrl: `https://www.thewandered.com/${country === 'home' ? '' : country + '/'}fixture-archive-${index}` };
}
function payload(url) {
  if (url.pathname.endsWith('/author/get-all-authors')) return { result: [] };
  if (url.pathname.endsWith('/post/search-query')) return { result: [] };
  const country = url.searchParams.get('typeOfPage') || 'home';
  const page = Number(url.searchParams.get('page') || 1), limit = Number(url.searchParams.get('limit') || 7);
  const records = Array.from({ length: 21 }, (_, i) => article(country, i + 1));
  return { result: records.slice((page - 1) * limit, page * limit), total: records.length };
}
const originalRequest = http.request;
const backend = http.createServer((req, res) => {
  const target = new URL(new URL(req.url, 'http://localhost').searchParams.get('target'));
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload(target)));
});
backend.listen(0, '127.0.0.1'); backend.unref();
for (const transport of [http, https]) {
  const original = transport.request;
  transport.request = function(options, ...args) {
    const value = typeof options === 'object' ? `${options.hostname || options.host || ''}${options.path || options.pathname || ''}` : String(options);
    if (/\/blog\/api\/(post\/(get-all|search-query)|author\/get-all-authors)/.test(value)) {
      const offset = value.indexOf('/blog/api/');
      const target = `https://www.thewandered.com${value.slice(offset)}`;
      return originalRequest.call(http, { ...options, protocol: 'http:', hostname: '127.0.0.1', host: '127.0.0.1', port: backend.address().port, path: '/?target=' + encodeURIComponent(target), agent: undefined }, ...args);
    }
    return original.call(this, options, ...args);
  };
}
const originalFetch = global.fetch;
global.fetch = (input, options) => {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (process.env.SEO_FIXTURE_LOG) fs.appendFileSync(process.env.SEO_FIXTURE_LOG, url.href + '\n');
  if (url.hostname === 'www.yourpricebooking.com' && url.pathname === '/api/acsess-to-admin/get-titles-and-description') {
    if (process.env.SEO_FIXTURE_JOURNAL_FAILURE === '1') return Promise.resolve(new Response('Unavailable', { status: 503 }));
    const result = Array.from({ length: 25 }, (_, i) => ({ _id: (i + 1).toString(16).padStart(24, '0'), title: `Journal record ${String(i + 1).padStart(3, '0')}`, description: `Journal description ${i + 1}`, url: `https://yourpricebooking.com/journal-${i + 1}-en`, linkOnPhoto: '/no-photo.webp' }));
    return Promise.resolve(Response.json({ result }));
  }
  if (url.origin === 'https://www.thewandered.com' && url.pathname === '/blog/api/post/get-all') {
    if (process.env.SEO_FIXTURE_INVENTORY_FAILURE === '1') return Promise.resolve(new Response('Unavailable', { status: 503 }));
    return Promise.resolve(Response.json(payload(url)));
  }
  if (url.origin === 'https://www.thewandered.com' && url.pathname === '/blog/api/post/get-by-url') {
    const articleUrl = new URL(url.searchParams.get('articleUrl'));
    const match = articleUrl.pathname.match(/fixture-archive-(\d+)$/);
    if (match) {
      const country = articleUrl.pathname.split('/').length === 2 ? 'home' : articleUrl.pathname.split('/')[1];
      return Promise.resolve(Response.json({ result: article(country, Number(match[1])) }));
    }
  }
  return originalFetch(input, options);
};
