const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const load = require('./helpers/load-ts.cjs');
const schema = load('src/utils/structuredData.ts');
const identities = load('src/utils/authorIdentity.ts');
const urls = load('src/utils/articleUrl.ts');
const record = { heading: 'A real travel story', description: 'The article summary', author: 'Viacheslav Nikitenko', publicationDate: '2026-10-17T07:00:00Z', changeDate: '2026-10-17T08:00:00Z', imageUrl: ['http://res.cloudinary.com/your-price-booking/image/upload/photo.jpg'] };
for (const [country, language] of [['home','en'],['ukraine','uk'],['poland','pl'],['usa','en'],['uncharted-planet','en']]) {
  test(`article schema matches canonical, profile and language: ${country}`, () => {
    const data = schema.articleStructuredData(record, country, 'trip-%26-%D0%BC%D1%96%D1%81%D1%82%D0%BE');
    const canonical = urls.articleCanonical(country, 'trip-%26-%D0%BC%D1%96%D1%81%D1%82%D0%BE');
    assert.equal(data['@type'], 'BlogPosting'); assert.equal(data.headline, record.heading);
    assert.equal(data.url, canonical); assert.equal(data.mainEntityOfPage['@id'], canonical);
    assert.equal(data.inLanguage, language); assert.equal(data.image[0], record.imageUrl[0].replace('http:', 'https:'));
    assert.equal(data.author['@id'], identities.authorIdentifier('66aa1ed114cefdb240cf70ca'));
    assert.equal(data.author.url, identities.authorProfile(record.author, country).url);
    assert.equal(data.publisher.name, 'Your Price Booking OÜ');
    assert.equal(data.datePublished, '2026-10-17T07:00:00.000Z'); assert.equal(data.dateModified, '2026-10-17T08:00:00.000Z');
    const crumbs = schema.articleBreadcrumbs(record.heading, country, 'trip-%26-%D0%BC%D1%96%D1%81%D1%82%D0%BE');
    const list = schema.breadcrumbStructuredData(crumbs).itemListElement;
    assert.equal(list.length, country === 'home' ? 2 : 3);
    assert.equal(list[list.length-1].item, canonical);
    assert.equal(list[list.length-1].name, record.heading);
    assert.equal(JSON.stringify(list.map(item=>item.position)), JSON.stringify(Array.from({length:list.length},(_,i)=>i+1)));
  });
}
test('optional or unknown fields do not invent images, authors, dates or profiles', () => {
  const data = schema.articleStructuredData({ ...record, author: '', imageUrl: [], publicationDate: '2026-02-31', changeDate: '' }, 'home', 'story');
  for (const key of ['image','author','datePublished','dateModified']) assert.equal(data[key], undefined);
  const unknown = schema.articleStructuredData({ ...record, author: 'New Writer', imageUrl: ['/no-photo.webp'] }, 'home', 'story');
  assert.equal(unknown.author.name, 'New Writer'); assert.equal(unknown.author.url, undefined); assert.equal(unknown.image, undefined);
  for (const date of ['bad-date','2026-02-31','10/17/26','']) assert.equal(schema.articleDate(date), undefined);
  assert.equal(schema.contentImageUrl('javascript:alert(1)'), undefined);
});
test('JSON-LD is safe against closing scripts and preserves the actual visible headline', () => {
  const heading = '</script><script id="injected">alert(1)</script>\u2028';
  const serialized = schema.serializeStructuredData(schema.articleStructuredData({ ...record, heading }, 'home', 'story'));
  assert.ok(!serialized.includes('<'));
  const dom = new JSDOM(`<script type="application/ld+json">${serialized}</script>`);
  assert.equal(dom.window.document.querySelector('#injected'), null);
  assert.equal(JSON.parse(dom.window.document.querySelector('script').textContent).headline, heading);
  dom.window.close();
});
test('homepage website and publisher graph share stable identities', () => {
  const graph = schema.websiteStructuredData()['@graph'];
  assert.equal(graph.length, 2); assert.equal(graph[1]['@type'], 'WebSite');
  assert.equal(graph[1].publisher['@id'], graph[0]['@id']); assert.equal(graph[1].name, 'The Wandered');
  assert.equal(graph[0].name, 'Your Price Booking OÜ');
});
test('body headings and image captions have document semantics without dropping content', () => {
  const render = load('src/components/Post/helpers/renderArticleHtml.ts').renderArticleHtml;
  const html = render('<h1 id="section">Section title</h1><p>Before</p><p><img src="imgUrlByIdx"></p><p>After</p>', ['/hero.jpg', { url: '/body.jpg', context: { alt: 'Photo', caption: 'Credit — Author' } }]);
  const dom = new JSDOM(html); const d = dom.window.document;
  assert.equal(d.querySelector('h1'), null); assert.equal(d.querySelector('h2#section').textContent, 'Section title');
  assert.equal(d.querySelector('figure img').alt, 'Photo'); assert.equal(d.querySelector('figcaption').textContent, 'Credit — Author');
  assert.ok(d.body.textContent.includes('Before')); assert.ok(d.body.textContent.includes('After')); dom.window.close();
});

function recommendations(get) {
  return load('src/services/getRecommendedArticles.ts', { fetch: get, require: (id) => {
    if (id === 'react') return { cache: (fn) => fn };
    if (id === '@/utils/articleUrl') return urls;
    if (id === '@/services/getSuggestedArticles') return load('src/services/getSuggestedArticles.ts');
    throw new Error(id);
  } }).getRecommendedArticles;
}
test('server recommendations exclude the current article and preserve canonical source URLs', async () => {
  const rows = Array.from({ length: 7 }, (_, index) => ({ _id: String(index), articleUrl: `https://www.thewandered.com/uncharted-planet/story-${index}`, country: 'uncharted-planet', title: 'Title', heading: 'Heading' }));
  const source = recommendations(async (query, options) => { assert.equal(query.searchParams.get('typeOfPage'), 'uncharted-planet'); assert.equal(query.searchParams.get('page'), '1'); assert.equal(options.cache, 'no-store'); return Response.json({ result: rows }); });
  const result = await source('0', 'uncharted-planet');
  assert.equal(result.length, 4); assert.ok(result.every((row) => row._id !== '0'));
  assert.equal(new Set(result.map((row) => row._id)).size, result.length);
});
test('failed optional recommendations return an empty list rather than failing the article', async () => {
  const result = await recommendations(async () => { throw new Error('503'); })('id', 'usa');
  assert.equal(result.length, 0);
});
test('malformed and external recommendation records cannot create broken article links', async () => {
  const source = recommendations(async () => Response.json({ result: [null, { _id: 'external', title: 'Title', heading: 'Heading', articleUrl: 'https://external.example/post' }, { _id: 'incomplete' }, { _id: 'valid', title: 'Title', heading: 'Heading', articleUrl: 'https://www.thewandered.com/story' }] }));
  const result = await source('primary', 'home');
  assert.equal(result.length, 1); assert.equal(result[0]._id, 'valid'); assert.equal(result[0].imageUrl.length, 0);
});

const { articleViews } = load('src/utils/articleViews.ts');
test('recommended cards use their own country-qualified path, not homepage views', () => {
  const views = { '/': 7481, '/canada/story-one': 31, '/canada/story-two': 72, '/story-one': 9 };
  assert.equal(articleViews(views, '/canada/story-one'), 31);
  assert.equal(articleViews(views, '/canada/story-two'), 72);
  assert.equal(articleViews(views, '/story-one'), 9);
  for (const path of [undefined, '', '/', '/canada/unknown']) assert.equal(articleViews(views, path), 0);
});
test('card views support encoded and decoded analytics paths without dropping real zeros', () => {
  const encoded = '/ukraine/trip-%D0%BC%D1%96%D1%81%D1%82%D0%BE-%26-spa';
  const decoded = decodeURIComponent(encoded);
  assert.equal(articleViews({ [decoded]: 42 }, encoded), 42);
  assert.equal(articleViews({ [encoded]: 0, [decoded]: 42 }, encoded), 0);
  assert.equal(articleViews({ '/canada/100%-travel': 7 }, '/canada/100%-travel'), 7);
});
test('a recommendation without a slug passes its canonical URL path to the counter', () => {
  const ts = require('typescript');
  const fs = require('node:fs');
  const vm = require('node:vm');
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync('src/components/Article/Article.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const Header = () => null;
  vm.runInNewContext(source, { exports, URL, require: id => {
    if (id === 'react/jsx-runtime') return require(id);
    if (id === '@/utils/articleUrl') return urls;
    if (id.endsWith('ArticleHeader/ArticleHeader')) return Header;
    return () => null;
  } });
  const card = exports.default({ articleUrl: 'https://www.thewandered.com/canada/story-one', country: 'canada', slug: undefined });
  const header = card.props.children.props.children.find(child => child.type === Header);
  assert.equal(header.props.viewPath, '/canada/story-one');
  assert.equal(articleViews({ '/': 7481, '/canada/story-one': 31 }, header.props.viewPath), 31);
});
