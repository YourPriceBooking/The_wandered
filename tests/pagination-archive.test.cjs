const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const load = require('./helpers/load-ts.cjs');
const pagination = load('src/utils/pagination.ts');

test('page URLs normalize aliases/tracking/duplicates and preserve a real page number', () => {
  for (const page of ['1', '0', '-1', '02', '1.5', 'NaN', '9007199254740992', ['2', '3']]) assert.equal(pagination.paginationState('/usa', { page }).redirect, '/usa');
  assert.equal(pagination.paginationState('/usa', {}).redirect, undefined);
  assert.equal(pagination.paginationState('/usa', { page: '2' }).redirect, undefined);
  assert.equal(pagination.paginationState('/usa', { page: '2', utm_source: 'test' }).redirect, '/usa?page=2');
  assert.equal(pagination.paginationState('/journal', { page: 'game-zone' }, true).redirect, '/journal#game-zone');
  assert.equal(pagination.pageExists(4, 21, 7), false);
  assert.equal(pagination.pageExists(1, 0, 7), true);
});

test('article URL inventory accepts only matching blog routes and normalizes encoded canonical segments', () => {
  const { canonicalArticleUrl } = load('src/services/seo/articleArchive.ts');
  assert.equal(canonicalArticleUrl('http://thewandered.com/poland/podróż-&-100%25/?utm_source=x#top', 'poland'), 'https://www.thewandered.com/poland/podr%C3%B3%C5%BC-%26-100%25');
  for (const url of ['https://yourpricebooking.com/post', 'https://www.thewandered.com/authors', 'https://www.thewandered.com/wandered-posts?search=x', 'https://www.thewandered.com/usa/post', 'https://user@www.thewandered.com/post']) assert.equal(canonicalArticleUrl(url, 'home'), undefined);
});
function collector(mode = 'ok') {
  let calls = [];
  const total = 101;
  const record = (i) => ({ _id: String(i), articleUrl: `https://www.thewandered.com/post-${i}` });
  const fetch = async (input) => {
    const url = new URL(input); calls.push(url);
    if (url.pathname.endsWith('/get-all')) {
      const country = url.searchParams.get('typeOfPage');
      if (mode === '503' && country === 'poland') return new Response('Down', { status: 503 });
      if (country !== 'home') return Response.json({ result: [], total: 0 });
      const page = Number(url.searchParams.get('page'));
      const rows = Array.from({ length: page === 1 ? 100 : 1 }, (_, i) => record(page === 1 ? i + 1 : mode === 'duplicate' ? 1 : 101));
      return Response.json({ result: mode === 'short' && page === 1 ? rows.slice(0, 3) : rows, total: mode === 'drift' && page === 2 ? total + 1 : total });
    }
    const article = new URL(url.searchParams.get('articleUrl'));
    const id = article.pathname.split('-').pop();
    if (mode === 'lookup-failure' && id === '2') return new Response('Down', { status: 503 });
    if (mode === 'missing' && id === '2') return new Response('', { status: 404 });
    return Response.json({ result: { ...record(Number(id)), heading: 'Post', markup: '<p>Body</p>', publicationDate: '2026-10-17T07:00:00Z' } });
  };
  return { collect: load('src/services/seo/articleArchive.ts', { fetch }).collectArticleInventory, calls };
}
test('archive collector traverses all API pages and verifies totals and article existence', async () => {
  const source = collector(); const result = await source.collect();
  assert.equal(result.entries.length, 101); assert.equal(result.totals.home, 101); assert.equal(Object.keys(result.totals).length, 8);
  assert.equal(result.excluded, 0);
  assert.ok(source.calls.some((url) => url.searchParams.get('page') === '2'));
  assert.equal(source.calls.filter((url) => url.pathname.endsWith('/get-by-url')).length, 101);
  assert.ok(result.entries.every((entry) => entry.lastModified === '2026-10-17T07:00:00.000Z'));
  const missing = await collector('missing').collect();
  assert.equal(missing.entries.length, 100); assert.equal(missing.excluded, 1);
});
test('partial responses, total drift, duplicate IDs and upstream failures abort a complete refresh', async () => {
  for (const mode of ['short','drift','duplicate','503','lookup-failure']) await assert.rejects(collector(mode).collect(), undefined, mode);
});

test('sitemap partitioning respects URL and byte limits and produces a valid index', () => {
  const { sitemapDocuments, sitemapIndex } = load('src/utils/sitemapDocuments.ts');
  const entries = Array.from({ length: 5 }, (_, i) => ({ url: `https://www.thewandered.com/post-${i}?a=1&b=2` }));
  const chunks = sitemapDocuments(entries, 2);
  assert.equal(chunks.length, 3);
  const locations = chunks.flatMap((xml) => {
    const dom = new JSDOM(xml, { contentType: 'application/xml' });
    const urls = [...dom.window.document.querySelectorAll('loc')].map((node) => node.textContent); dom.window.close(); return urls;
  });
  assert.deepEqual(Array.from(locations), entries.map((entry) => entry.url));
  const size = Buffer.byteLength(sitemapDocuments(entries.slice(0,1))[0]);
  assert.equal(sitemapDocuments(entries, 50_000, size + 5).length, 5);
  const dom = new JSDOM(sitemapIndex('https://www.thewandered.com', 3), { contentType: 'application/xml' });
  assert.equal(dom.window.document.querySelectorAll('sitemap').length, 3); dom.window.close();
});

test('durable snapshots are atomic, validate on read and survive service recreation', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'wandered-seo-'));
  const globals = { process: { ...process, env: { ...process.env, SEO_CACHE_DIRECTORY: directory } } };
  try {
    const service = load('src/services/seo/persistentCache.ts', globals);
    const snapshot = { version: 1, generatedAt: new Date().toISOString(), data: ['one','two'] };
    await service.writeSnapshot('example', snapshot);
    const restarted = load('src/services/seo/persistentCache.ts', globals);
    assert.equal(JSON.stringify(await restarted.readSnapshot('example', Array.isArray)), JSON.stringify(snapshot));
    assert.equal(await restarted.readSnapshot('example', () => false), undefined);
    assert.deepEqual(await fs.readdir(directory), ['example.json.gz']);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});

test('journal adapter sorts and slices one complete source response without skipped or duplicate records', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'wandered-journal-'));
  let requests = 0;
  const records = Array.from({ length: 25 }, (_, i) => ({ _id: (i+1).toString(16).padStart(24, '0'), title: `Record ${i+1}`, url: `https://yourpricebooking.com/${i+1}-en`, description: '', linkOnPhoto: '' }));
  const globals = { process: { ...process, env: { ...process.env, SEO_CACHE_DIRECTORY: directory } }, fetch: async (input) => {
    requests++; const url = new URL(input);
    assert.equal(url.searchParams.get('page'), '1'); assert.equal(url.searchParams.get('limit'), '100000');
    return Response.json({ result: records });
  } };
  try {
    const service = load('src/services/getDailyJournalPosts.ts', globals);
    const pages = await Promise.all([1,2,3,4].map((page) => service.getDailyJournalPosts(page)));
    assert.deepEqual(pages.map((page) => page.result.length), [10,10,5,0]);
    const ids = pages.flatMap((page) => page.result.map((post) => post._id));
    assert.equal(new Set(ids).size, 25); assert.equal(ids[0], records[24]._id); assert.equal(requests, 1);
    // A restarted process must keep the complete disk snapshot even if API is down.
    const restarted = load('src/services/getDailyJournalPosts.ts', { ...globals, fetch: async () => { throw new Error('Offline'); } });
    assert.equal((await restarted.getDailyJournalPosts(2)).result[0]._id, records[14]._id);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});

function sitemapService(collect, fallback) {
  const countries = ['home','ukraine','poland','usa','canada','australia','singapore','uncharted-planet'];
  const real = load('src/services/seo/articleArchive.ts');
  const seo = load('src/utils/seoMetadata.ts');
  return load('src/services/getSitemapEntries.ts', { require: (id) => {
    if (id === '@/defaultData/authorsSeo') return { authorsPaths: { en: '/authors', uk: '/ukraine/authors', pl: '/poland/authors' }, authorsAlternates: {} };
    if (id === '@/utils/seoMetadata') return seo;
    if (id === '@/utils/journalSeo') return load('src/utils/journalSeo.ts');
    if (id === '@/services/seo/articleArchive') return { collectArticleInventory: collect, canonicalArticleUrl: real.canonicalArticleUrl, articleCountries: countries };
    if (id === '@/services/seo/persistentCache') return { readSnapshot: async () => undefined, writeSnapshot: async () => {} };
    if (id === '@/defaultData/sitemapSnapshot.json') return fallback || { version: 1, generatedAt: '1970-01-01T00:00:00Z', data: null };
    throw new Error(`Unexpected ${id}`);
  }, console: { ...console, error: () => {}, info: () => {} } });
}
test('failed sitemap refresh retains the complete seed and backs off, while no seed remains an error', async () => {
  let calls = 0;
  const data = { entries: [{ url: 'https://www.thewandered.com/post' }], excluded: 0, totals: { home: 1, ukraine: 0, poland: 0, usa: 0, canada: 0, australia: 0, singapore: 0, 'uncharted-planet': 0 } };
  const seed = { version: 1, generatedAt: '2000-01-01T00:00:00Z', data };
  const source = sitemapService(async () => { calls++; throw new Error('503'); }, seed);
  assert.equal((await source.getSitemapSnapshot()).data.entries.length, 1);
  assert.equal((await source.default()).length, 16);
  assert.equal(calls, 1);
  const cold = sitemapService(async () => { throw new Error('503'); });
  await assert.rejects(cold.default(), /503/);
});
test('sitemap response reports 503 without a complete snapshot and supports ETag only for valid XML', async () => {
  const loadResponse = (available) => load('src/services/seo/sitemapResponse.ts', { require: (id) => {
    if (id === '@/services/getSitemapEntries') return { __esModule: true, default: async () => { if (!available) throw new Error('Unavailable'); return [{ url: 'https://www.thewandered.com/' }]; }, getSitemapSnapshot: async () => ({ generatedAt: '2000-01-01T00:00:00Z' }) };
    if (id === '@/utils/sitemapDocuments') return load('src/utils/sitemapDocuments.ts');
    if (id === '@/utils/seoMetadata') return { siteUrl: 'https://www.thewandered.com' };
    return require(id);
  }, console: { ...console, error: () => {} } }).sitemapResponse;
  const missing = await loadResponse(false)(new Request('https://www.thewandered.com/sitemap.xml'));
  assert.equal(missing.status, 503); assert.equal(missing.headers.get('retry-after'), '300');
  const available = loadResponse(true);
  const response = await available(new Request('https://www.thewandered.com/sitemap.xml'));
  assert.equal(response.status, 200); assert.equal(response.headers.get('x-sitemap-status'), 'stale-complete');
  const cached = await available(new Request('https://www.thewandered.com/sitemap.xml', { headers: { 'if-none-match': response.headers.get('etag') } }));
  assert.equal(cached.status, 304);
});
test('a stale journal snapshot survives an upstream failure without being overwritten', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'wandered-journal-stale-'));
  const globals = { process: { ...process, env: { ...process.env, SEO_CACHE_DIRECTORY: directory } }, console: { ...console, error: () => {} } };
  const old = { version: 1, generatedAt: '2000-01-01T00:00:00Z', data: [{ _id: '000000000000000000000001', title: 'Last complete record', description: '', url: 'https://yourpricebooking.com/record-en', linkOnPhoto: '' }] };
  try {
    await load('src/services/seo/persistentCache.ts', globals).writeSnapshot('journal', old);
    let calls = 0;
    const source = load('src/services/getDailyJournalPosts.ts', { ...globals, fetch: async () => { calls++; return new Response('Down', { status: 503 }); } });
    assert.equal((await source.getDailyJournalPosts()).result[0].title, 'Last complete record');
    await source.getDailyJournalPosts(); assert.equal(calls, 1);
    assert.equal((await load('src/services/seo/persistentCache.ts', globals).readSnapshot('journal', Array.isArray)).generatedAt, old.generatedAt);
    const empty = await fs.mkdtemp(path.join(os.tmpdir(), 'wandered-journal-empty-'));
    try {
      const cold = load('src/services/getDailyJournalPosts.ts', { ...globals, process: { ...process, env: { ...process.env, SEO_CACHE_DIRECTORY: empty } }, fetch: async () => new Response('Down', { status: 503 }) });
      await assert.rejects(cold.getDailyJournalPosts(), /Journal HTTP 503/);
    } finally { await fs.rm(empty, { recursive: true, force: true }); }
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});

test('English journal pages filter other source languages before applying page boundaries', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'wandered-journal-languages-'));
  const records = Array.from({ length: 24 }, (_, i) => ({ _id: (i+1).toString(16).padStart(24, '0'), title: `Record ${i}`, description: '', linkOnPhoto: '', url: `https://yourpricebooking.com/story-${i}-${i % 2 ? 'uk' : 'en'}` }));
  try {
    const source = load('src/services/getDailyJournalPosts.ts', { process: { ...process, env: { ...process.env, SEO_CACHE_DIRECTORY: directory } }, fetch: async () => Response.json({ result: records }) });
    const first = await source.getDailyJournalPosts(1), second = await source.getDailyJournalPosts(2);
    assert.equal(first.sourceTotal, 24); assert.equal(first.total, 12); assert.equal(first.totalPages, 2);
    assert.equal(first.result.length, 10); assert.equal(second.result.length, 2);
    assert.ok([...first.result,...second.result].every((record) => record.url.endsWith('-en')));
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
