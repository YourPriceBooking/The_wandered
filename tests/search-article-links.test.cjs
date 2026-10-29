const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { JSDOM } = require('jsdom');
const load = require('./helpers/load-ts.cjs');
const { articleCountries, articleCanonical, canonicalArticleUrl } = load('src/utils/articleUrl.ts');

// Render the real search page, Article and ArticleLinkContent. Stub only transport,
// metadata, image optimization and unrelated header/suspense presentation.
function searchPage(posts) {
  function moduleAt(filename) {
    const exports = {};
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    function localRequire(id) {
      if (id.endsWith('.scss')) return new Proxy({}, { get: (_, key) => key === '__esModule' ? false : String(key) });
      if (id === '@/services/getPosts') return { getPostsBySearch: async () => posts };
      if (id === '@/utils/seoMetadata') return { pageMetadata: () => ({}), socialImage: () => '' };
      if (id === '@/components/ui/UiSuspense') return { __esModule: true, default: ({ children }) => children };
      if (id.includes('Skeleton') || id.includes('ArticleHeader')) return { __esModule: true, default: () => null };
      if (id === 'next/image') return { __esModule: true, default: (props) => { const imageProps = { ...props }; delete imageProps.fill; delete imageProps.priority; return React.createElement('img', imageProps); } };
      if (id.startsWith('@/') || id.startsWith('.')) {
        const base = id.startsWith('@/') ? path.resolve('src', id.slice(2)) : path.resolve(path.dirname(filename), id);
        const resolved = ['.tsx', '.ts'].map((ext) => base + ext).find(fs.existsSync);
        return moduleAt(resolved);
      }
      return require(id);
    }
    vm.runInNewContext(source, { exports, require: localRequire, URL, console }, { filename });
    return exports;
  }
  return moduleAt(path.resolve('src/app/wandered-posts/page.tsx')).default;
}
const fixtures = articleCountries.map((country) => ({
  _id: country, country, articleUrl: articleCanonical(country, 'story-&-подорож'),
  heading: `${country} story`, title: 'Story', description: '', imageUrl: [], author: '', publicationDate: '',
}));

test('mixed-country search renders working image, heading and localized Read more links for every card', async () => {
  const posts = process.env.SEARCH_INVENTORY ? Object.values(JSON.parse(fs.readFileSync(process.env.SEARCH_INVENTORY, 'utf8'))).flat() : fixtures;
  const Page = searchPage(posts);
  const html = renderToStaticMarkup(await Page({ searchParams: { search: 'story' } }));
  const cards = new JSDOM(html).window.document.querySelectorAll('article');
  assert.equal(cards.length, posts.length);
  posts.forEach((post, index) => {
    const anchors = [...cards[index].querySelectorAll('a')];
    assert.equal(anchors.length, 3, post.heading);
    const expected = canonicalArticleUrl(post.articleUrl, post.country);
    assert.ok(expected, post.articleUrl);
    anchors.forEach((anchor) => assert.equal(anchor.getAttribute('href'), expected));
    const copy = post.country === 'ukraine' ? 'ЧИТАТИ ДАЛІ' : post.country === 'poland' ? 'CZYTAJ WIĘCEJ' : 'READ MORE';
    assert.equal(anchors[2].textContent, copy);
  });
});

test('invalid and mismatched URLs still produce no navigation links', async () => {
  const posts = ['https://example.com/story', 'javascript:alert(1)', 'https://www.thewandered.com/authors', 'https://www.thewandered.com/poland/story'].map((articleUrl, i) => ({ ...fixtures[0], _id: String(i), articleUrl }));
  const Page = searchPage(posts);
  const html = renderToStaticMarkup(await Page({ searchParams: { search: 'story' } }));
  assert.equal(new JSDOM(html).window.document.querySelectorAll('article a').length, 0);
});
