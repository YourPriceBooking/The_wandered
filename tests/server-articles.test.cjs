const assert = require('node:assert/strict');
const test = require('node:test');
const { JSDOM } = require('jsdom');
const loadTs = require('./helpers/load-ts.cjs');

const post = { _id: '123', heading: 'A real article', markup: '<p>Body</p>', author: 'Author', imageUrl: [] };
const params = { country: 'usa', pageLink: 'nature-&-подорож' };
const articleUrl = 'https://www.thewandered.com/usa/nature-&-подорож';
function service(status, payload, capture) {
  return loadTs('src/services/getPostData.ts', { fetch: async (url, options) => {
    if (capture) capture(url, options);
    return new Response(JSON.stringify(payload), { status });
  } }).getPostData;
}

test('article lookup preserves the full URL as a single query value and uses a bounded uncached request', async () => {
  const data = await service(200, { result: post }, (url, options) => {
    assert.equal(url.searchParams.get('articleUrl'), articleUrl);
    assert.equal([...url.searchParams].length, 1);
    assert.equal(options.cache, 'no-store');
    assert.ok(options.signal instanceof AbortSignal);
  })(params);
  assert.equal(data.heading, post.heading);
  assert.equal(data.description, '');
  assert.equal(data.imageUrl.length, 0);
});

test('missing status and the observed legacy missing response are distinct from other conflicts', async () => {
  for (const status of [404, 410]) assert.equal(await service(status, {})(params), null);
  assert.equal(await service(409, { code: 409, message: `posts with url ${articleUrl} don't found in DB` })(params), null);
  assert.equal(await service(200, { result: null })(params), null);
  await assert.rejects(service(409, { code: 409, message: 'A different conflict' })(params), /HTTP 409/);
});

test('an encoded route segment resolves to the same complete public article URL', async () => {
  await service(200, { result: post }, (url) => {
    assert.equal(url.searchParams.get('articleUrl'), articleUrl);
  })({ country: 'usa', pageLink: encodeURIComponent(params.pageLink) });
});

test('upstream failures and malformed success payloads do not become missing articles', async () => {
  for (const status of [401, 429, 500, 502, 503]) await assert.rejects(service(status, {})(params), /Article service/);
  for (const result of [undefined, [], {}, { ...post, heading: '' }, { ...post, markup: null }]) {
    await assert.rejects(service(200, { result })(params), /invalid record/);
  }
  const badJson = loadTs('src/services/getPostData.ts', { fetch: async () => new Response('<html>gateway error</html>') }).getPostData;
  await assert.rejects(badJson(params), /invalid JSON/);
});

test('network and timeout errors remain service failures', async () => {
  const getPostData = loadTs('src/services/getPostData.ts', { fetch: async () => { throw new DOMException('Timed out', 'TimeoutError'); } }).getPostData;
  await assert.rejects(getPostData(params), /temporarily unavailable/);
});

test('article lists reject service failures instead of returning a string as data', async () => {
  const getPosts = loadTs('src/services/getPosts.ts', { require: (id) => {
    if (id === '../utils/axios') return { __esModule: true, default: { get: async () => { throw new Error('upstream failed'); } } };
    if (id === '@/utils/url') return { apiUrl: 'https://www.thewandered.com/blog/' };
    if (id === '@/app/routes') return { routes: [] };
    throw new Error(`Unexpected import ${id}`);
  } }).getPosts;
  await assert.rejects(getPosts({ page: 1, country: 'usa' }), /Article list is temporarily unavailable/);
});

const { renderArticleHtml } = loadTs('src/components/Post/helpers/renderArticleHtml.ts');
test('server HTML keeps rich content, replaces indexed images, and safely renders captions', () => {
  const html = renderArticleHtml('<h2>Section</h2><p>Travel text</p><img src="imgUrlByIdx"><table><tr><td>Cell</td></tr></table><blockquote>Travel — Author</blockquote><iframe src="https://www.youtube.com/embed/test" allowfullscreen></iframe>', [
    '/hero.webp', { url: 'https://www.thewandered.com/body.webp?a=1&b=2', context: { alt: 'Body photo', caption: '<script>caption text</script>' } },
  ]);
  const dom = new JSDOM(html); const d = dom.window.document;
  assert.equal(d.querySelector('h2').textContent, 'Section');
  assert.equal(d.querySelector('td').textContent, 'Cell');
  assert.equal(d.querySelector('img').getAttribute('src'), 'https://www.thewandered.com/body.webp?a=1&b=2');
  assert.equal(d.querySelector('img').alt, 'Body photo');
  assert.equal(d.querySelector('.image-caption').textContent, '<script>caption text</script>');
  assert.equal(d.querySelector('blockquote .author').textContent, 'Author');
  assert.equal(d.querySelector('iframe').src, 'https://www.youtube.com/embed/test');
  assert.equal(d.querySelectorAll('script').length, 0);
  dom.window.close();
});

test('server HTML strips executable markup and works without images or browser globals', () => {
  const html = renderArticleHtml('<p style="color:red" onclick="evil()">Visible</p><script>evil()</script><img src="imgUrlByIdx" onerror="evil()"><a href="javascript:evil()" target="_blank">Link</a><iframe src="javascript:evil()"></iframe>', []);
  const dom = new JSDOM(html); const d = dom.window.document;
  assert.equal(d.querySelector('p').textContent, 'Visible');
  assert.equal(d.querySelectorAll('script,[onclick],[onerror],[style]').length, 0);
  assert.equal(d.querySelector('img').hasAttribute('src'), false);
  assert.equal(d.querySelector('a').hasAttribute('href'), false);
  assert.ok(d.querySelector('a').rel.includes('noopener'));
  assert.ok(!d.querySelector('iframe')?.getAttribute('src'));
  dom.window.close();
});
