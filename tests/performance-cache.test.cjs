const assert = require('node:assert/strict');
const test = require('node:test');
const loadTs = require('./helpers/load-ts.cjs');
const { createArticleListService } = loadTs('src/services/articleListService.ts');
const card = index => ({ _id: String(index), heading: `Story ${index}`, title: `Story ${index}`, articleUrl: `https://www.thewandered.com/usa/story-${index}`, markup: 'Body is not a card field'.repeat(100) });
const payload = (total = 14, start = 1) => ({ total, result: Array.from({ length: Math.min(7, total) }, (_, i) => card(i + start)) });
const query = { country: 'usa', page: 1 };

test('list transport encodes its query, bounds time, bypasses Next persistent cache and retains only card fields', async () => {
  const service = createArticleListService({ fetcher: async (url, options) => {
    assert.equal(url.origin + url.pathname, 'https://www.thewandered.com/blog/api/post/get-all');
    assert.deepEqual(Object.fromEntries(url.searchParams), { page: '1', limit: '7', typeOfPage: 'usa' });
    assert.equal(options.cache, 'no-store'); assert.ok(options.signal instanceof AbortSignal);
    assert.equal(options.headers.Accept, 'application/json');
    return Response.json(payload());
  } });
  const data = await service(query);
  assert.equal(data.total, 14); assert.equal(data.result.length, 7);
  assert.equal(data.result[0].markup, ''); assert.equal(data.result[0].country, 'usa');
});

test('simultaneous requests coalesce, fresh entries hit, countries and page keys remain separate', async () => {
  let calls = 0, release;
  const gate = new Promise(resolve => { release = resolve; });
  const service = createArticleListService({ fetcher: async () => { calls++; await gate; return Response.json(payload()); } });
  const first = service(query), second = service(query); release();
  const [a,b] = await Promise.all([first,second]); assert.equal(a, b); assert.equal(calls, 1);
  await service(query); assert.equal(calls, 1);
  await service({ country: 'poland', page: 1 }); await service({ country: 'usa', page: 2 }); assert.equal(calls, 3);
});

test('TTL expires after 30 seconds and cache hits do not extend freshness', async () => {
  let clock = 0, calls = 0;
  const service = createArticleListService({ now: () => clock, fetcher: async () => { calls++; return Response.json(payload()); } });
  await service(query); clock = 29_999; await service(query); assert.equal(calls, 1);
  clock = 30_000; await service(query); assert.equal(calls, 2);
});

test('LRU cap evicts the least recently used key', async () => {
  let calls = 0;
  const service = createArticleListService({ maxEntries: 2, fetcher: async () => { calls++; return Response.json(payload()); } });
  await service(query); await service({ country: 'poland', page: 1 }); await service(query);
  await service({ country: 'home', page: 1 }); await service({ country: 'poland', page: 1 });
  assert.equal(calls, 4);
});

test('oversized entries are served uncached and the byte budget evicts other entries', async () => {
  const sample = await createArticleListService({ fetcher: async () => Response.json(payload()) })(query);
  const size = Buffer.byteLength(JSON.stringify(sample)); let calls = 0;
  const service = createArticleListService({ maxBytes: size + 30, fetcher: async () => { calls++; return Response.json(payload()); } });
  await service(query); await service({ country: 'poland', page: 1 }); await service(query); assert.equal(calls, 3);
  const uncached = createArticleListService({ maxBytes: 1, fetcher: async () => { calls++; return Response.json(payload()); } });
  await uncached(query); await uncached(query); assert.equal(calls, 5);
});

test('HTTP, network, JSON, record and incomplete-page errors are retried instead of cached as missing', async () => {
  for (const broken of [
    () => new Response('unavailable', { status: 503 }),
    () => { throw new DOMException('Timed out', 'TimeoutError'); },
    () => new Response('<html>bad JSON</html>'),
    () => Response.json({ total: '14', result: [] }),
    () => Response.json({ total: 14, result: [] }),
    () => Response.json({ total: 1, result: [{}] }),
  ]) {
    let calls = 0;
    const service = createArticleListService({ fetcher: async () => { calls++; return calls === 1 ? broken() : Response.json(payload()); } });
    await assert.rejects(service(query), /temporarily unavailable/);
    assert.equal((await service(query)).total, 14); assert.equal(calls, 2);
  }
});

test('expired data is not served during an outage, and recovery uses the updated total', async () => {
  let clock = 0, calls = 0;
  const service = createArticleListService({ now: () => clock, fetcher: async () => { calls++; return calls === 2 ? new Response('', { status: 503 }) : Response.json(payload(calls === 1 ? 14 : 7)); } });
  await service(query); clock = 30_000;
  await assert.rejects(service(query), /temporarily unavailable/);
  assert.equal((await service(query)).total, 7); assert.equal(calls, 3);
});

test('empty sections are valid; invalid countries and pages never reach upstream', async () => {
  let calls = 0;
  const service = createArticleListService({ fetcher: async () => { calls++; return Response.json(payload(0)); } });
  assert.equal((await service(query)).result.length, 0);
  for (const bad of [{ country: '../private', page: 1 }, { country: 'usa', page: 0 }, { country: 'usa', page: 1.5 }]) await assert.rejects(service(bad), /Invalid article list query/);
  assert.equal(calls, 1);
});
