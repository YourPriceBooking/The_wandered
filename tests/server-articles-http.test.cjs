const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { JSDOM } = require('jsdom');
let server, base, logPath, temp;

before(async () => {
  temp = fs.mkdtempSync(path.join(__dirname, '../.next/article-http-'));
  logPath = path.join(temp, 'lookups.log');
  const socket = net.createServer();
  await new Promise((resolve) => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  base = `http://127.0.0.1:${port}`;
  const log = fs.openSync(path.join(temp, 'server.log'), 'w');
  server = spawn(process.execPath, ['--require', path.join(__dirname, 'fixtures/seo-api.cjs'), 'node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: path.join(__dirname, '..'), env: { ...process.env, ARTICLE_FIXTURE_LOG: logPath }, stdio: ['ignore', log, log],
  });
  fs.closeSync(log);
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await fetch(`${base}/robots.txt`)).ok) return; } catch {}
    if (server.exitCode !== null) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(fs.readFileSync(path.join(temp, 'server.log'), 'utf8'));
});
after(async () => {
  if (server && server.exitCode === null) {
    const closed = new Promise((resolve) => server.once('exit', resolve));
    server.kill('SIGTERM');
    const force = setTimeout(() => server.kill('SIGKILL'), 5000);
    await closed; clearTimeout(force);
  }
  if (temp && !process.env.KEEP_ARTICLE_HTTP_LOGS) fs.rmSync(temp, { recursive: true, force: true });
});
async function page(url) {
  const response = await fetch(base + url, { signal: AbortSignal.timeout(60000) });
  const html = await response.text();
  if (response.status !== 200) console.log(`HTTP ${response.status}: ${url}`);
  fs.writeFileSync(path.join(temp, 'last-response.html'), html);
  return { response, html, dom: new JSDOM(html) }; // No JS execution or resource loading.
}

for (const country of ['', 'ukraine', 'poland', 'usa', 'canada', 'australia', 'singapore', 'uncharted-planet']) {
  test(`initial HTML contains visible article content: ${country || 'home'}`, async () => {
    const url = `/${country ? country + '/' : ''}fixture-special-&-${encodeURIComponent('подорож')}`;
    const { response, html, dom } = await page(url); const d = dom.window.document;
    assert.equal(response.status, 200);
    const canonical = d.querySelector('link[rel="canonical"]').href;
    assert.equal(canonical, 'https://www.thewandered.com' + url.replace('-&-', '-%26-'));
    assert.equal(d.querySelector('meta[property="og:type"]').content, 'article');
    assert.equal(d.querySelector('meta[property="og:url"]').content, canonical);
    assert.equal(d.querySelector('meta[name="twitter:card"]').content, 'summary_large_image');
    assert.equal(d.querySelector('meta[name="twitter:image"]').content, d.querySelector('meta[property="og:image"]').content);
    assert.equal(d.querySelector('meta[property="article:published_time"]').content, '2026-10-17T07:00:00.000Z');
    assert.equal(d.documentElement.lang, country === 'ukraine' ? 'uk' : country === 'poland' ? 'pl' : 'en');
    assert.ok(d.querySelector('h1').textContent.includes(country === 'ukraine' ? 'Серверна' : country === 'poland' ? 'Artykuł' : 'Server article'));
    assert.equal(d.querySelector('#fixture-body').textContent, 'Server rendered body with a real link.');
    assert.equal(d.querySelector('.ql-editor td').textContent, 'Table content');
    assert.ok(d.querySelector('time').dateTime);
    assert.ok(d.body.textContent.includes('Fixture Author'));
    assert.equal(d.querySelector('.ql-editor img').alt, 'Body photo');
    assert.ok(d.querySelector('.ql-editor iframe'));
    assert.equal(d.querySelectorAll('.ql-editor script').length, 0);
    assert.ok(!html.includes('visibility:hidden'));
    const expected = `https://www.thewandered.com/${country ? country + '/' : ''}fixture-special-&-подорож`;
    const lookups = fs.readFileSync(logPath, 'utf8').trim().split('\n');
    assert.equal(lookups.filter((entry) => entry === expected).length, 1, `metadata and body must share one lookup: ${JSON.stringify(lookups)}`);
    dom.window.close();
  });
}
function flightText(document) {
  return [...document.querySelectorAll('script')].flatMap((script) => {
    const prefix = 'self.__next_f.push(';
    if (!script.textContent.startsWith(`${prefix}[1,`)) return [];
    return [JSON.parse(script.textContent.slice(prefix.length).replace(/\);?$/, ''))[1]];
  }).join('');
}
for (const [country, title] of [['usa', 'Page not found'], ['ukraine', 'Сторінку не знайдено'], ['poland', 'Nie znaleziono strony']]) {
  test(`missing article is HTTP 404 with localized Next fallback and noindex: ${country}`, async () => {
    const { response, dom } = await page(`/${country}/fixture-missing`); const d = dom.window.document;
    assert.equal(response.status, 404);
    // Next 14 emits error UI through its Flight fallback, not initial SSR DOM.
    const fallback = flightText(d);
    assert.ok(fallback.includes(`"children":"${title}"`));
    assert.ok(fallback.includes(`"href":"${country === 'usa' ? '/' : '/' + country}"`));
    assert.ok([...d.querySelectorAll('meta[name="robots"]')].some((m) => m.content.includes('noindex')));
    dom.window.close();
  });
}
test('delayed missing record does not stream an early HTTP 200', async () => {
  const { response, dom } = await page('/usa/fixture-delayed-missing');
  assert.equal(response.status, 404); dom.window.close();
});
for (const slug of ['fixture-unavailable', 'fixture-conflict', 'fixture-invalid', 'fixture-timeout']) {
  test(`service failure returns HTTP 500 instead of a false 404: ${slug}`, async () => {
    const { response, dom } = await page(`/usa/${slug}`);
    assert.equal(response.status, 500);
    assert.ok(!dom.window.document.querySelector('h1')?.textContent.includes('Page not found'));
    dom.window.close();
  });
}
test('article without images still renders its text', async () => {
  const { response, dom } = await page('/usa/fixture-empty');
  assert.equal(response.status, 200); assert.ok(dom.window.document.querySelector('#fixture-body'));
  dom.window.close();
});

const staticPages = ['/', '/ukraine', '/poland', '/usa', '/canada', '/australia', '/singapore', '/uncharted-planet', '/authors', '/ukraine/authors', '/poland/authors', '/daily-journal-of-your-price-booking-service-history', '/daily-journal-of-your-price-booking-service-history/new-episodes', '/travel-resources', '/private-policy', '/wandered-posts?search=travel'];
for (const url of staticPages) {
  test(`complete metadata in initial HTML: ${url}`, async () => {
    const { response, dom } = await page(url); const d = dom.window.document;
    assert.equal(response.status, 200);
    for (const field of ['title', 'description', 'type', 'url', 'site_name', 'locale', 'image', 'image:alt', 'image:width', 'image:height']) {
      assert.ok(d.querySelector(`meta[property="og:${field}"]`)?.content, `og:${field}: ${url}`);
    }
    for (const field of ['card', 'title', 'description', 'image', 'image:alt']) assert.ok(d.querySelector(`meta[name="twitter:${field}"]`)?.content, `twitter:${field}: ${url}`);
    assert.equal(d.querySelector('meta[name="twitter:card"]').content, 'summary_large_image');
    assert.equal(d.querySelector('meta[property="og:locale"]').content, url.startsWith('/ukraine') ? 'uk_UA' : url.startsWith('/poland') ? 'pl_PL' : 'en_US');
    if (!url.startsWith('/wandered-posts')) assert.equal(d.querySelector('link[rel="canonical"]').href, 'https://www.thewandered.com' + url);
    else {
      assert.ok(d.querySelector('meta[name="robots"]').content.includes('noindex'));
      assert.equal(d.querySelector('link[rel="canonical"]'), null);
    }
    const imageUrl = new URL(d.querySelector('meta[property="og:image"]').content);
    const imageResponse = await fetch(base + imageUrl.pathname); const bytes = Buffer.from(await imageResponse.arrayBuffer());
    assert.equal(imageResponse.status, 200); assert.ok(imageResponse.headers.get('content-type').includes('image/png'));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), 1200); assert.equal(bytes.readUInt32BE(20), 630);
    if (url.endsWith('/authors')) {
      assert.equal(d.querySelectorAll('link[rel="alternate"][hreflang]').length, 4);
      for (const [language, path] of [['en', '/authors'], ['uk', '/ukraine/authors'], ['pl', '/poland/authors'], ['x-default', '/authors']]) {
        assert.equal(d.querySelector(`link[hreflang="${language}"]`).href, 'https://www.thewandered.com' + path);
      }
    }
    dom.window.close();
  });
}
test('page two uses its own canonical and social URL without inheriting the homepage', async () => {
  for (const url of ['/?page=2', '/ukraine?page=2', '/daily-journal-of-your-price-booking-service-history/new-episodes?page=2']) {
    const { response, dom } = await page(url); const d = dom.window.document;
    assert.equal(response.status, 200);
    assert.equal(d.querySelector('link[rel="canonical"]').href, 'https://www.thewandered.com' + url);
    assert.equal(d.querySelector('meta[property="og:url"]').content, 'https://www.thewandered.com' + url);
    dom.window.close();
  }
});
