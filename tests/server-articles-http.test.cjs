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
    cwd: path.join(__dirname, '..'), env: { ...process.env, ARTICLE_FIXTURE_LOG: logPath, SEO_CACHE_DIRECTORY: path.join(temp, 'cache') }, stdio: ['ignore', log, log],
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
    const schemas = [...d.querySelectorAll('script[type="application/ld+json"]')].map((node) => JSON.parse(node.textContent));
    const articleSchema = schemas.find((value) => value['@type'] === 'BlogPosting');
    assert.ok(articleSchema); assert.equal(articleSchema.headline, d.querySelector('h1').textContent);
    assert.equal(articleSchema.url, canonical); assert.equal(articleSchema.mainEntityOfPage['@id'], canonical);
    assert.equal(articleSchema.author.name, 'Fixture Author'); assert.equal(articleSchema.author.url, undefined);
    assert.equal(d.querySelectorAll('h1').length, 1);
    const breadcrumbs = schemas.find((value) => value['@type'] === 'BreadcrumbList').itemListElement;
    const visible = [...d.querySelectorAll('nav[aria-label="Breadcrumbs"] li, nav[aria-label="Навігаційний шлях"] li, nav[aria-label="Ścieżka nawigacji"] li')];
    assert.equal(breadcrumbs.length, visible.length);
    breadcrumbs.forEach((crumb, index) => assert.equal(crumb.name, visible[index].textContent));
    assert.equal(breadcrumbs[breadcrumbs.length - 1].item, canonical);
    assert.ok(d.querySelector('aside[aria-label="More stories"], aside[aria-label="Інші статті"], aside[aria-label="Inne artykuły"] h2 a'));
    assert.equal(d.querySelector('main aside h2 a').closest('[hidden]'), null);
    assert.ok(!d.querySelector('main > article aside'), 'Promotions/recommendations are outside the primary article');

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

const journalArchivePath = '/daily-journal-of-your-price-booking-service-history/new-episodes';
test('journal pages contain disjoint SSR slices, last page has no next link, reload is stable', async () => {
  const identifiers = [];
  for (let number = 1; number <= 3; number++) {
    const url = journalArchivePath + (number > 1 ? `?page=${number}` : '');
    const { response, dom } = await page(url); const d = dom.window.document;
    assert.equal(response.status, 200);
    const titles = [...d.querySelectorAll('[data-journal-title]')].map((heading) => heading.textContent).filter((title) => title.startsWith('Journal record '));
    assert.equal(titles.length, number === 3 ? 5 : 10);
    assert.equal(titles[0], `Journal record ${String(25 - (number - 1) * 10).padStart(3, '0')}`);
    identifiers.push(...titles);
    assert.equal(Boolean(d.querySelector('a[rel="next"]')), number < 3);
    if (number > 1) assert.equal(d.querySelector('a[rel="prev"]').getAttribute('href'), journalArchivePath + (number > 2 ? `?page=${number - 1}` : ''));
    const again = await page(url);
    assert.equal(again.dom.window.document.querySelector('[data-journal-title]').textContent, titles[0]);
    again.dom.window.close(); dom.window.close();
  }
  assert.equal(new Set(identifiers).size, 25);
});
test('out-of-range article and journal pages return 404/noindex before streaming', async () => {
  for (const path of ['/', '/ukraine', '/poland', '/usa', '/canada', '/australia', '/singapore', '/uncharted-planet', journalArchivePath]) {
    const { response, dom } = await page(path + '?page=4');
    assert.equal(response.status, 404, path);
    assert.ok([...dom.window.document.querySelectorAll('meta[name="robots"]')].some((meta) => meta.content.includes('noindex')));
    dom.window.close();
  }
});
test('aliases, repeated page values and tracking redirect to their normalized URLs', async () => {
  for (const path of ['/', '/ukraine', '/poland', '/usa', '/canada', '/australia', '/singapore', '/uncharted-planet', journalArchivePath]) {
    for (const [query, suffix] of [['?page=1',''], ['?page=0',''], ['?page=02',''], ['?page=2&page=3',''], ['?utm_source=test',''], ['?page=2&utm_source=test','?page=2']]) {
      const response = await fetch(base + path + query, { redirect: 'manual' });
      assert.equal(response.status, 308, path + query);
      const location = new URL(response.headers.get('location'), base);
      assert.equal(location.pathname + location.search, path + suffix);
    }
  }
  const main = '/daily-journal-of-your-price-booking-service-history';
  for (const [suffix, target] of [['?page=2', journalArchivePath + '?page=2'], ['?page=game-zone', main + '#game-zone']]) {
    const response = await fetch(base + main + suffix, { redirect: 'manual' });
    assert.equal(response.status, 308); assert.equal(response.headers.get('location'), target);
  }
});
test('sitemap is complete, same-origin, deduplicated and retains the verified archive', async () => {
  const response = await fetch(base + '/sitemap.xml');
  assert.equal(response.status, 200);
  assert.ok(response.headers.get('content-type').includes('application/xml'));
  assert.ok(['fresh-complete','stale-complete'].includes(response.headers.get('x-sitemap-status')));
  const dom = new JSDOM(await response.text(), { contentType: 'application/xml' });
  const locations = [...dom.window.document.querySelectorAll('url > loc')].map((node) => node.textContent);
  assert.equal(locations.length, Number(response.headers.get('x-sitemap-urls')));
  assert.equal(new Set(locations).size, locations.length);
  for (const path of ['/', '/ukraine','/poland','/usa','/canada','/australia','/singapore','/uncharted-planet','/travel-resources','/authors','/ukraine/authors','/poland/authors',journalArchivePath]) assert.ok(locations.includes('https://www.thewandered.com' + path));
  assert.ok(locations.every((url) => new URL(url).origin === 'https://www.thewandered.com' && !url.includes('wandered-posts')));
  assert.ok(locations.length > 15, 'Must include article archive, not only static pages');
  const unchanged = await fetch(base + '/sitemap.xml', { headers: { 'if-none-match': response.headers.get('etag') } });
  assert.equal(unchanged.status, 304);
  assert.equal((await fetch(base + '/sitemaps/2.xml')).status, 404);
  dom.window.close();
});

for (const country of ['', 'ukraine', 'poland', 'usa', 'canada', 'australia', 'singapore', 'uncharted-planet']) {
  test(`one H1 and canonical linked H2 cards in listing: ${country || 'home'}`, async () => {
    const { response, dom } = await page('/' + country); const d = dom.window.document;
    assert.equal(response.status, 200); assert.equal(d.querySelectorAll('h1').length, 1);
    const cards = [...d.querySelectorAll('main article')]; assert.equal(cards.length, 7);
    for (const card of cards) {
      const title = card.querySelector('h2 a'); assert.ok(title);
      assert.ok(title.href.startsWith('https://www.thewandered.com/'));
      assert.equal(card.querySelector('a[aria-label]').href, title.href);
      assert.ok(card.querySelector('header').textContent.includes('Fixture Author'));
    }
    if (!country) {
      const graph = [...d.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent)).find(value => value['@graph'])['@graph'];
      const site = graph.find(value => value['@type'] === 'WebSite');
      assert.equal(site.name, 'The Wandered'); assert.equal(site.url, 'https://www.thewandered.com/');
      assert.ok(graph.some(value => value['@id'] === site.publisher['@id'] && value.name === 'Your Price Booking OÜ'));
    }
    dom.window.close();
  });
}
for (const [country, language, updated] of [['usa','en','Updated'],['ukraine','uk','Оновлено'],['poland','pl','Zaktualizowano']]) {
  test(`known byline, author directory and modified date agree: ${country}`, async () => {
    const { response, dom } = await page(`/${country}/fixture-known`); const d = dom.window.document;
    assert.equal(response.status, 200);
    const data = [...d.querySelectorAll('script[type="application/ld+json"]')].map(node=>JSON.parse(node.textContent)).find(value=>value['@type']==='BlogPosting');
    assert.equal(data.author.name, 'Viacheslav Nikitenko'); assert.equal(data.inLanguage, language);
    assert.ok([...d.querySelectorAll('a')].some(link=>link.href===data.author.url && link.textContent==='Viacheslav Nikitenko'));
    assert.equal(data.dateModified, '2026-10-17T08:00:00.000Z');
    assert.ok([...d.querySelectorAll('time')].some(time=>time.dateTime===data.dateModified && time.parentElement.textContent.includes(updated)));
    const path = new URL(data.author.url).pathname;
    const profile = await page(path); const authorNode = profile.dom.window.document.getElementById(new URL(data.author.url).hash.slice(1));
    assert.equal(authorNode.textContent, data.author.name);
    const directory = JSON.parse(profile.dom.window.document.querySelector('script[type="application/ld+json"]').textContent);
    assert.ok(directory.mainEntity.itemListElement.some(item=>item.item['@id']===data.author['@id']));
    assert.ok(profile.dom.window.document.getElementById('editorial-information'));
    dom.window.close(); profile.dom.window.close();
  });
}
