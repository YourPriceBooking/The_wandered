const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { JSDOM } = require('jsdom');

// Compile the pure TypeScript utilities using the project's existing dependency.
function loadUtility(filename) {
  const source = fs.readFileSync(path.join(__dirname, '..', filename), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports }, { filename });
  return exports;
}

const { serializeSitemap } = loadUtility('src/utils/sitemapXml.ts');
const { journalPage, journalCanonical, journalPath, newEpisodesPath } = loadUtility('src/utils/journalSeo.ts');
const sitemapNamespace = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const xhtmlNamespace = 'http://www.w3.org/1999/xhtml';

test('sitemap is parseable XML and preserves URLs containing ampersands and Unicode', () => {
  const urls = [
    'https://www.thewandered.com/usa/regenerative-farm-hospitality-in-the-usa-nature-luxury-&-wellness-collide',
    'https://www.thewandered.com/ukraine/подорож?one=1&two=2',
    'https://www.thewandered.com/test?q=<value>&quote="yes"&single=\'ok\'',
  ];
  const dom = new JSDOM(serializeSitemap(urls.map((url) => ({ url }))), { contentType: 'application/xml' });
  const document = dom.window.document;
  assert.equal(document.documentElement.namespaceURI, sitemapNamespace);
  assert.deepEqual(Array.from(document.getElementsByTagNameNS(sitemapNamespace, 'loc'), (node) => node.textContent), urls);
  dom.window.close();
});

test('sitemap preserves multilingual authors alternates and valid dates', () => {
  const alternates = { en: 'https://www.thewandered.com/authors?a=1&b=2', uk: 'https://www.thewandered.com/ukraine/authors', pl: 'https://www.thewandered.com/poland/authors', 'x-default': 'https://www.thewandered.com/authors' };
  const dom = new JSDOM(serializeSitemap([
    { url: alternates.en, lastModified: '2026-10-17T07:00:00Z', alternates: { languages: alternates } },
    { url: alternates.uk, lastModified: 'invalid-date' },
  ]), { contentType: 'application/xml' });
  const document = dom.window.document;
  const links = Array.from(document.getElementsByTagNameNS(xhtmlNamespace, 'link'));
  assert.deepEqual(Object.fromEntries(links.map((node) => [node.getAttribute('hreflang'), node.getAttribute('href')])), alternates);
  assert.equal(document.getElementsByTagNameNS(sitemapNamespace, 'lastmod').length, 1);
  assert.equal(document.getElementsByTagNameNS(sitemapNamespace, 'lastmod')[0].textContent, '2026-10-17T07:00:00.000Z');
  dom.window.close();
});

test('sitemap stays valid for an empty collection and XML-forbidden control characters', () => {
  for (const entries of [[], [{ url: 'https://www.thewandered.com/test\u0001' }]]) {
    const dom = new JSDOM(serializeSitemap(entries), { contentType: 'application/xml' });
    assert.equal(dom.window.document.documentElement.localName, 'urlset');
    dom.window.close();
  }
});

test('journal canonicals use their own host and exact page path', () => {
  assert.equal(journalCanonical(journalPath, undefined), 'https://www.thewandered.com/daily-journal-of-your-price-booking-service-history');
  assert.equal(journalCanonical(newEpisodesPath, '1'), 'https://www.thewandered.com/daily-journal-of-your-price-booking-service-history/new-episodes');
  assert.equal(journalCanonical(newEpisodesPath, '2'), 'https://www.thewandered.com/daily-journal-of-your-price-booking-service-history/new-episodes?page=2');
  assert.equal(journalCanonical(journalPath, '3'), 'https://www.thewandered.com/daily-journal-of-your-price-booking-service-history?page=3');
});

test('game-zone and invalid page parameters share the actual first-page canonical', () => {
  for (const value of [undefined, '', 'game-zone', 'NaN', '0', '-1', '1.5', 'Infinity', '1e2', '02', '9007199254740992', ['2', '3']]) {
    assert.equal(journalPage(value), 1);
    assert.equal(journalCanonical(journalPath, value), `https://www.thewandered.com${journalPath}`);
  }
  assert.equal(journalPage('2'), 2);
});
