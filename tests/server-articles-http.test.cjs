const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { JSDOM } = require('jsdom');
let server, base, logPath, temp;
const firstPageCards = { '': 27, ukraine: 27, poland: 27, usa: 15, canada: 9, australia: 0, singapore: 27, 'uncharted-planet': 27 };

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
    cwd: path.join(__dirname, '..'), env: { ...process.env, ARTICLE_FIXTURE_LOG: logPath, SEO_FIXTURE_AUTHOR_DIRECTORY: '1', SEO_CACHE_DIRECTORY: path.join(temp, 'cache') }, stdio: ['ignore', log, log],
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
    const primary = d.querySelector('main > article');
    const heroFigure = primary.querySelector('figure');
    assert.ok(primary.querySelector('h1').compareDocumentPosition(heroFigure) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
    assert.ok(heroFigure.querySelector('button[data-article-image]'));
    assert.ok(primary.querySelector('dialog'));
    assert.equal(primary.querySelector('header').textContent.includes('Fixture description'), false);
    const breadcrumbs = schemas.find((value) => value['@type'] === 'BreadcrumbList').itemListElement;
    const visible = [...d.querySelectorAll('nav[aria-label="Breadcrumbs"] li, nav[aria-label="Навігаційний шлях"] li, nav[aria-label="Ścieżka nawigacji"] li')];
    assert.equal(breadcrumbs.length, visible.length);
    breadcrumbs.forEach((crumb, index) => assert.equal(crumb.name, visible[index].textContent));
    assert.equal(breadcrumbs[breadcrumbs.length - 1].item, canonical);
    const related = d.querySelector('main aside article h3 a');
    if (country === 'australia') assert.equal(related, null, 'Empty section has no related stories');
    else {
      assert.ok(related);
      assert.equal(related.closest('[hidden]'), null);
    }
    assert.ok(!d.querySelector('main > article aside'), 'Promotions/recommendations are outside the primary article');

    const feed = d.querySelector('main > section[aria-labelledby="other-sections-heading"]');
    const heading = country === 'ukraine' ? 'З інших розділів' : country === 'poland' ? 'Z innych działów' : 'From other sections';
    assert.equal(feed.querySelector('h2').textContent, heading);
    const ads = feed.previousElementSibling;
    assert.deepEqual([...ads.querySelectorAll('a')].map(link => new URL(link.href).hostname), ['www.yourpricebooking.com', 'gptiti.com']);
    if (related) assert.equal(ads.previousElementSibling.querySelectorAll('article h3 a').length, 4);
    assert.ok(feed.compareDocumentPosition(d.querySelector('footer')) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
    const otherSections = Object.keys(firstPageCards).filter(section => section !== country && firstPageCards[section] > 0);
    const expectedLinks = otherSections.flatMap(section => [1, 2].map(i =>
      'https://www.thewandered.com/' + (section ? section + '/' : '') + 'fixture-archive-' + i));
    const rows = [...feed.querySelectorAll('ul > li > a')];
    assert.deepEqual(rows.map(link => link.href), expectedLinks);
    assert.equal(feed.querySelectorAll('a').length, rows.length);
    for (const [i, link] of rows.entries()) {
      const section = otherSections[Math.floor(i / 2)];
      const language = section === 'ukraine' ? 'uk' : section === 'poland' ? 'pl' : 'en';
      assert.equal(link.hreflang, language);
      const [title, label] = link.getAttribute('aria-labelledby').split(' ').map(id => d.getElementById(id));
      assert.equal(title, link.querySelector('h3'));
      assert.equal(title.lang, language);
      assert.equal(title.textContent, `Archive ${section || 'home'} record ${i % 2 + 1}`);
      assert.ok(label.textContent.includes(language.toUpperCase()));
      if (section === 'canada') assert.ok(label.textContent.includes(country === 'ukraine' ? 'Канада' : country === 'poland' ? 'Kanada' : 'Canada'));
      assert.equal(link.querySelector('p').lang, language);
      assert.equal(link.querySelector('img').getAttribute('loading'), 'lazy');
    }

    assert.equal(d.documentElement.lang, country === 'ukraine' ? 'uk' : country === 'poland' ? 'pl' : 'en');
    assert.ok(d.querySelector('h1').textContent.includes(country === 'ukraine' ? 'Серверна' : country === 'poland' ? 'Artykuł' : 'Server article'));
    assert.equal(d.querySelector('#fixture-body').textContent, 'Server rendered body with a real link.');
    assert.equal(d.querySelector('.ql-editor td').textContent, 'Table content');
    assert.ok(d.querySelector('time').dateTime);
    assert.ok(d.body.textContent.includes('Fixture Author'));
    assert.equal(d.querySelector('.ql-editor img').alt, 'Body photo');
    assert.equal(d.querySelector('.ql-editor img').getAttribute('loading'), 'lazy');
    assert.equal(d.querySelector('.ql-editor iframe').getAttribute('loading'), 'lazy');
    assert.equal(d.querySelector('.ql-editor iframe').title, country === 'ukraine' ? 'Вбудовані медіа' : country === 'poland' ? 'Osadzone multimedia' : 'Embedded media');
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
      const main = d.querySelector('main');
      assert.equal(main.querySelector('h1').textContent, url.startsWith('/ukraine') ? 'Наші автори' : url.startsWith('/poland') ? 'Nasi autorzy' : 'Meet our authors');
      const cards = [...main.querySelectorAll('article')];
      assert.deepEqual(cards.map(card => card.querySelector('h2').textContent), ['Viacheslav Nikitenko', 'Andy Ray', 'New Contributor', 'Liza Nikitenko']);
      assert.ok([...cards[0].querySelectorAll('a')].some(link => link.href === 'https://x.com/mnogobitka'));
      assert.equal(cards[1].querySelector('a').href, 'https://x.com/X44JOJkiloVtSHV');
      assert.ok(cards[2].textContent.includes('Bio from the API.'));
      assert.equal(cards[2].querySelector('img').alt, 'New Contributor');
      assert.match(cards[2].querySelector('img').getAttribute('src'), /no-photo\.webp/);
      const social = cards[2].querySelector('a');
      assert.equal(social.href, 'https://x.com/fixture');
      assert.equal(social.getAttribute('target'), '_blank');
      assert.equal(social.getAttribute('rel'), 'noopener noreferrer');
      assert.match(social.getAttribute('aria-label'), /New Contributor/);
      const liza = cards[3];
      assert.equal(liza.getAttribute('aria-labelledby'), 'author-liza-nikitenko');
      assert.equal(liza.querySelector('a').href, 'https://x.com/Liza__Nikitenko');
      assert.match(liza.querySelector('img').getAttribute('src'), /no-photo\.webp/);
      const lizaBio = url.startsWith('/ukraine') ? /Карпенка-Карого.*документальними проєктами.*журналістика/
        : url.startsWith('/poland') ? /Karpenki-Karego.*projekty dokumentalne.*dziennikarstwie/
          : /I\. K\. Karpenko-Karyi.*documentary projects.*journalism/;
      assert.match(liza.textContent, lizaBio);
      const person = [...main.querySelectorAll('script[type="application/ld+json"]')]
        .map(script => JSON.parse(script.textContent))
        .find(schema => schema['@type'] === 'CollectionPage').mainEntity.itemListElement[3].item;
      assert.equal(person.name, 'Liza Nikitenko');
      assert.match(person.description, lizaBio);
      assert.equal(person.url, 'https://www.thewandered.com' + url + '#author-liza-nikitenko');
      assert.equal(person['@id'], undefined);
      assert.deepEqual(person.sameAs, ['https://x.com/Liza__Nikitenko']);
      assert.ok(main.querySelector('aside[aria-labelledby="behind-the-stories"] p').textContent);
      assert.ok(main.querySelector('#editorial-information'));
      assert.ok(main.querySelector('a[href="https://www.yourpricebooking.com/support"]'));
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
    const { response, dom } = await page(path + '?page=99');
    assert.equal(response.status, 404, path);
    assert.ok([...dom.window.document.querySelectorAll('meta[name="robots"]')].some((meta) => meta.content.includes('noindex')));
    dom.window.close();
  }
});
test('retired seven-card archive URLs lead to the batch containing their former first story', async () => {
  for (const [oldUrl, target] of [
    ['/?page=9', '/?page=3'], ['/ukraine?page=6', '/ukraine?page=2'],
    ['/poland?page=4', '/poland'], ['/usa?page=3', '/usa'], ['/canada?page=2', '/canada'],
  ]) {
    const response = await fetch(base + oldUrl, { redirect: 'manual' });
    assert.equal(response.status, 307, oldUrl);
    assert.equal(response.headers.get('location'), target);
  }
});

test('archive controls expose just the next HTML slice, with localized copy, including without JavaScript', async () => {
  for (const [path, label, next] of [
    ['/', 'Show more', '/?page=2'], ['/?page=2', 'Show more', '/?page=3'], ['/?page=3', '', null],
    ['/ukraine', 'Показати ще', '/ukraine?page=2'], ['/poland', 'Pokaż więcej', '/poland?page=2'],
    ['/singapore', '', null], ['/australia', '', null], ['/canada', '', null],
    ['/uncharted-planet?page=2', '', null],
  ]) {
    const { response, dom } = await page(path);
    const main = dom.window.document.querySelector('main');
    assert.equal(response.status, 200);
    assert.equal([...main.querySelectorAll('a')].some(a => /^\d+$/.test(a.textContent.trim())), false);
    const link = main.querySelector('a[rel="next"]');
    assert.equal(link?.getAttribute('href') ?? null, next, path);
    if (link) assert.equal(link.textContent.trim(), label);
    if (path.includes('?page=')) assert.ok(main.querySelector('a[rel="prev"]'));
    dom.window.close();
  }
});

test('incremental feed returns only card data in 27s, including the remainder, and validates the section and page', async () => {
  const ids = new Set();
  for (const [number, count] of [[1, 27], [2, 27], [3, 5]]) {
    const response = await fetch(base + '/api/article-feed?section=home&page=' + number);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-robots-tag'), 'noindex');
    const batch = await response.json();
    assert.equal(batch.total, 59);
    assert.equal(batch.result.length, count);
    for (const post of batch.result) {
      assert.equal(post.markup, '');
      assert.ok(post.imageUrl.length <= 1);
      ids.add(post._id);
    }
  }
  assert.equal(ids.size, 59);
  for (const query of ['section=other&page=1', 'section=home&page=0', 'section=home&page=0.5', 'section=home']) {
    assert.equal((await fetch(base + '/api/article-feed?' + query)).status, 400, query);
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
    const cards = [...d.querySelectorAll('main article')]; assert.equal(cards.length, firstPageCards[country]);
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
    assert.equal(data.dateModified, '2026-10-18T08:00:00.000Z');
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

test('travel resources retain four interactive providers without dead link wrappers', async () => {
  const { response, dom } = await page('/travel-resources');
  const d = dom.window.document;
  assert.equal(response.status, 200);
  assert.equal(d.querySelectorAll('h1').length, 1);
  const expected = [
    ['live-flights-map', 'https://globe.adsbexchange.com/', 'https://globe.adsbexchange.com/'],
    ['global-weather', 'https://embed.windy.com/embed2.html?width=650&height=400&level=surface&overlay=temperature&menu=&marker=true', 'https://www.windy.com/'],
    ['travel-news-trends', 'https://rss.bloople.net/?url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3Dtravel%26hl%3Den-US%26gl%3DUS%26ceid%3DUS%3Aen&showtitle=false&type=html', 'https://news.google.com/search?q=travel&hl=en-US&gl=US&ceid=US%3Aen'],
    ['explore-world-map', 'https://www.openstreetmap.org/export/embed.html', 'https://www.openstreetmap.org/'],
  ];
  assert.equal(d.querySelectorAll('main iframe').length, 4);
  const titles = [];
  for (const [id, src, sourceUrl] of expected) {
    const section = d.getElementById(id); assert.ok(section);
    const heading = section.querySelector('h2'); assert.ok(heading);
    assert.equal(section.getAttribute('aria-labelledby'), heading.id);
    assert.ok(section.querySelector('p').textContent.length > 80, 'Original explanation outside iframe');
    const frame = section.querySelector('iframe');
    assert.equal(frame.getAttribute('src'), src, 'Existing embed URL preserved exactly');
    assert.equal(frame.closest('a'), null);
    assert.equal(heading.closest('a'), null);
    assert.equal(frame.getAttribute('loading'), 'lazy');
    assert.ok(frame.title.length > 20); titles.push(frame.title);
    assert.ok(Number(frame.getAttribute('width')) > 0);
    assert.ok(Number(frame.getAttribute('height')) > 0);
    assert.equal(frame.hasAttribute('sandbox'), false, 'No new sandbox restrictions on existing providers');
    const link = section.querySelector('a'); assert.equal(link.href, sourceUrl);
    assert.equal(link.target, '_blank');
    assert.ok(link.relList.contains('noopener') && link.relList.contains('noreferrer'));
    assert.ok(link.textContent.includes('new tab'));
    assert.equal(d.querySelector(`a[href="/travel-resources/${id}"]`), null);
  }
  assert.equal(new Set(titles).size, 4);
  assert.equal(d.querySelector('link[rel="canonical"]').href, 'https://www.thewandered.com/travel-resources');
  assert.ok(d.querySelector('meta[property="og:image"]').content.startsWith('https://'));
  assert.equal(d.querySelector('meta[name="twitter:card"]').content, 'summary_large_image');
  assert.ok(d.querySelector('meta[name="twitter:image"]').content.startsWith('https://'));
  dom.window.close();
});

test('retired travel tool URLs redirect permanently to their matching dashboard sections', async () => {
  const dashboard = await page('/travel-resources');
  try {
    for (const tool of ['live-flights-map', 'travel-news-trends', 'global-weather', 'explore-world-map']) {
      assert.ok(dashboard.dom.window.document.getElementById(tool)?.querySelector('iframe'));
      for (const query of ['', '?utm_source=legacy']) {
        const response = await fetch(`${base}/travel-resources/${tool}${query}`, { redirect: 'manual' });
        assert.equal(response.status, 308);
        assert.equal(response.headers.get('location'), `https://www.thewandered.com/travel-resources${query}#${tool}`);
      }
    }
  } finally { dashboard.dom.window.close(); }
  const missing = await fetch(base + '/travel-resources/nonexistent-tool', { redirect: 'manual' });
  assert.equal(missing.status, 404, 'Unknown resources still return a real 404');
});

test('misplaced support URL redirects permanently to the actual English Help Center', async () => {
  const response = await fetch(base + '/en/support', { redirect: 'manual' });
  assert.equal(response.status, 308);
  assert.equal(response.headers.get('location'), 'https://www.yourpricebooking.com/en/support');
  const missing = await fetch(base + '/en/nonexistent-page', { redirect: 'manual' });
  assert.equal(missing.status, 404, 'Other English paths are not redirected to another site');
});

test('legacy user terms URL redirects permanently to its matching publisher document', async () => {
  for (const query of ['', '?utm_source=legacy']) {
    const response = await fetch(base + '/terms-conditions-users' + query, { redirect: 'manual' });
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), 'https://www.yourpricebooking.com/en/terms-conditions-users' + query);
  }
  const missing = await fetch(base + '/terms-conditions-users/other', { redirect: 'manual' });
  assert.equal(missing.status, 404, 'No broad terms-prefix redirect');
});

test('listing images prioritize only the first card and keep lower cards lazy', async () => {
  for (const route of ['/', '/ukraine', '/poland', '/usa', '/canada', '/australia', '/singapore', '/uncharted-planet']) {
    const { response, dom } = await page(route); const d = dom.window.document;
    assert.equal(response.status, 200);
    const images = [...d.querySelectorAll('main article a[aria-label] img[data-nimg]')];
    assert.equal(images.length, firstPageCards[route.slice(1)], route);
    if (images.length) assert.notEqual(images[0].getAttribute('loading'), 'lazy');
    for (const image of images.slice(1)) assert.equal(image.getAttribute('loading'), 'lazy');
    images.forEach((image, index) => {
      const featured = route === '/' && index === 0;
      assert.equal(image.getAttribute('sizes'), featured
        ? '(max-width: 640px) calc(100vw - 32px), (max-width: 900px) calc(100vw - 48px), 570px'
        : '(max-width: 640px) calc(100vw - 32px), (max-width: 808px) calc(100vw - 48px), 760px');
    });
    dom.window.close();
  }
});

test('article hero is responsive while related images and promotion remain lazy', async () => {
  const { response, dom } = await page('/usa/fixture-known'); const d = dom.window.document;
  assert.equal(response.status, 200);
  const hero = d.querySelector('main > article figure img[data-nimg]'); assert.ok(hero);
  assert.notEqual(hero.getAttribute('loading'), 'lazy');
  assert.ok(hero.getAttribute('sizes').includes('1040px'));
  const deferred = [...d.querySelectorAll('main > aside img[data-nimg]')];
  assert.equal(deferred.length, 5);
  for (const image of deferred) assert.equal(image.getAttribute('loading'), 'lazy');
  const banner = deferred.find(image => image.alt === 'Banner image Your Price Booking');
  assert.ok(banner.getAttribute('sizes').includes('510px'));
  dom.window.close();
});

test('non-article routes omit editor CSS and load compressed fonts; articles retain editor formatting', async () => {
  for (const [route, editor] of [['/', false], ['/travel-resources', false], ['/usa/fixture-known', true]]) {
    const { response, dom } = await page(route); assert.equal(response.status, 200);
    const sheets = [...new Set([...dom.window.document.querySelectorAll('link[rel="stylesheet"]')].map(sheet => sheet.getAttribute('href')))];
    let css = '';
    for (const sheet of sheets) {
      const asset = await fetch(new URL(sheet, base)); assert.equal(asset.status, 200);
      css += await asset.text();
    }
    assert.equal(css.includes('.ql-editor'), editor, route);
    assert.ok(css.includes('.woff2')); assert.equal(css.includes('.ttf'), false);
    if (!editor) assert.ok(Buffer.byteLength(css) < 75_000, `Non-article initial CSS budget: ${route}, ${Buffer.byteLength(css)} bytes from ${JSON.stringify(sheets)}`);
    for (const name of new Set([...css.matchAll(/url\([^)]*?([^/()'"\s]+\.woff2)['"]?\)/g)].map(match => match[1]))) {
      const font = await fetch(base + '/_next/static/media/' + name); assert.equal(font.status, 200);
      const bytes = Buffer.from(await font.arrayBuffer());
      assert.equal(bytes.subarray(0, 4).toString(), 'wOF2');
    }
    dom.window.close();
  }
});

test('bare production host redirects permanently to HTTPS www while preserving path and query', async () => {
  // Node fetch strips the forbidden Host header; use HTTP transport to exercise vhost routing.
  const hostRequest = (path, host) => new Promise((resolve, reject) => {
    require('node:http').get(base + path, { headers: { host } }, response => {
      response.on('error', reject);
      response.on('end', () => resolve({ status: response.statusCode, location: response.headers.location }));
      response.resume();
    }).on('error', reject);
  });
  for (const path of ['/', '/ukraine/authors?source=test', '/usa/nature-%26-%D0%BF%D0%BE%D0%B4%D0%BE%D1%80%D0%BE%D0%B6?x=1&x=2', '/robots.txt', '/favicon.ico']) {
    const response = await hostRequest(path, 'thewandered.com');
    assert.equal(response.status, 308, path);
    const actual = new URL(response.location);
    const expected = new URL('https://www.thewandered.com' + path);
    assert.equal(actual.origin, expected.origin);
    assert.equal(decodeURIComponent(actual.pathname), decodeURIComponent(expected.pathname));
    assert.deepEqual([...actual.searchParams], [...expected.searchParams]);
  }
  const canonicalHost = await hostRequest('/', 'www.thewandered.com');
  assert.equal(canonicalHost.status, 200, 'No canonical-host redirect loop');
  for (const host of ['thewandered.com', 'www.thewandered.com']) {
    const tool = await hostRequest('/travel-resources/live-flights-map?utm_source=legacy', host);
    assert.equal(tool.status, 308);
    assert.equal(tool.location, 'https://www.thewandered.com/travel-resources?utm_source=legacy#live-flights-map', 'Legacy redirects avoid an extra host-normalization hop');
    const support = await hostRequest('/en/support', host);
    assert.equal(support.status, 308);
    assert.equal(support.location, 'https://www.yourpricebooking.com/en/support');
    const terms = await hostRequest('/terms-conditions-users', host);
    assert.equal(terms.status, 308);
    assert.equal(terms.location, 'https://www.yourpricebooking.com/en/terms-conditions-users');
  }
});


test('home features one story and exposes disjoint 27-card archive pages', async () => {
  for (const [url, featured, first, count] of [['/', 1, 1, 27], ['/?page=2', 0, 28, 27], ['/?page=3', 0, 55, 5]]) {
    const { response, dom } = await page(url);
    const d = dom.window.document;
    assert.equal(response.status, 200);
    const cards = [...d.querySelectorAll('main article')];
    assert.equal(cards.length, count);
    assert.equal(cards.filter((card) => card.className.includes('featured')).length, featured);
    const urls = cards.map((card) => card.querySelector('h2 a').href);
    assert.equal(new Set(urls).size, count);
    assert.ok(urls[0].endsWith(`fixture-archive-${first}`));
    assert.equal(d.querySelector('link[rel="canonical"]').href, 'https://www.thewandered.com' + url);
    assert.equal(d.querySelectorAll('main h1').length, 1);
    for (const card of cards) {
      assert.ok(card.querySelector('p[class*="description"]').textContent);
      assert.equal(card.querySelectorAll('a[aria-label]').length, 2);
    }
    dom.window.close();
  }
});


for (const section of ['', 'ukraine', 'poland', 'usa', 'canada', 'australia', 'singapore', 'uncharted-planet']) {
  test(`editorial landing keeps one title, full destinations and four resource anchors: ${section || 'home'}`, async () => {
    const { response, dom } = await page('/' + section);
    const d = dom.window.document;
    assert.equal(response.status, 200);
    assert.equal(d.querySelectorAll('main h1').length, 1);
    assert.equal(d.querySelectorAll('hotfx-shy-header').length, 1);
    const pinned = d.querySelector('hotfx-shy-header');
    assert.equal(pinned.dataset.pinned, 'true');
    assert.equal(pinned.querySelector('[class*="toolLinks"]'), null, 'Travel tools remain in document flow');
    assert.equal(pinned.querySelector('[class*="desktopNav"]'), null, 'Desktop navigation remains in document flow');
    assert.equal(d.querySelectorAll('[class*="countryPanel"] a').length, 6);
    const tools = [...d.querySelectorAll('[class*="toolLinks"] a')];
    assert.deepEqual(tools.map(a => a.getAttribute('href')), [
      '/travel-resources#live-flights-map', '/travel-resources#global-weather',
      '/travel-resources#travel-news-trends', '/travel-resources#explore-world-map',
    ]);
    const forms = [...d.querySelectorAll('form[role="search"]')];
    assert.ok(forms.length);
    forms.forEach(form => { assert.equal(form.getAttribute('action'), '/wandered-posts'); assert.equal(form.method, 'get'); });
    assert.equal(d.querySelector('[class*="headerShell"]').lang, section === 'ukraine' ? 'uk' : section === 'poland' ? 'pl' : 'en');
    dom.window.close();
  });
}

test('verified historical edits and explicit same-day edits show an update without overwriting publication date', async () => {
  const cases = [
    ['/ukraine/etias-oboviazkovyi-dlia-hromadian-yaki-khochut-vidvidaty-krainy-yes-bez-vizy', 'Оновлено', '2024-10-18T21:22:24.319Z', '2026-11-21T12:36:47.996Z'],
    ['/poland/jak-wystawi%C4%87-wiz%C4%99-do-wietnamu-dla-obywateli-rp', 'Zaktualizowano', '2024-12-15T19:58:33.598Z', '2026-11-21T12:39:02.206Z'],
    ['/usa/fixture-same-day', 'Updated', '2026-10-17T07:00:00.000Z', '2026-10-17T08:00:00.000Z'],
  ];
  for (const [url, label, published, modified] of cases) {
    const { response, dom } = await page(url);
    const d = dom.window.document;
    assert.equal(response.status, 200);
    const times = [...d.querySelectorAll('time')];
    assert.ok(times.some(time => time.dateTime === published));
    assert.ok(times.some(time => time.dateTime === modified && time.parentElement.textContent.includes(label)));
    assert.equal(d.querySelector('meta[property="article:modified_time"]').content, modified);
    const article = [...d.querySelectorAll('script[type="application/ld+json"]')].map(el => JSON.parse(el.textContent)).find(value => value['@type'] === 'BlogPosting');
    assert.equal(article.datePublished, published);
    assert.equal(article.dateModified, modified);
    dom.window.close();
  }
});

test('a generic database update is not presented as an editorial update', async () => {
  const { response, dom } = await page('/usa/fixture-db-touch');
  assert.equal(response.status, 200);
  const times = [...dom.window.document.querySelectorAll('time')];
  assert.ok(times.some(time => time.dateTime === '2024-10-18T21:22:24.319Z'));
  assert.ok(!times.some(time => time.parentElement.textContent.includes('Updated')));
  assert.ok(!times.some(time => time.dateTime === '2025-11-28T08:49:43.644Z'));
  dom.window.close();
});

test('NYC guide has only the 2027 public address with one unchanged backend record', async () => {
  const oldPath = '/usa/public-transport-in-new-york-city-a-2023-travelq-guide';
  const newPath = '/usa/public-transport-in-new-york-city-2027';
  const newUrl = 'https://www.thewandered.com' + newPath;
  const lookups = () => fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8').split('\n').filter((line) => line.endsWith(oldPath)).length : 0;
  const previous = lookups();
  for (const path of [oldPath, oldPath + '?utm_source=test', oldPath.replace('public-', '%70ublic-')]) {
    const retired = await fetch(base + path, { redirect: 'manual' });
    assert.equal(retired.status, 410);
    assert.equal(retired.headers.get('location'), null);
    assert.equal(retired.headers.get('x-robots-tag'), 'noindex');
  }
  assert.equal(lookups(), previous);
  const { response, dom } = await page(newPath);
  assert.equal(response.status, 200);
  const d = dom.window.document;
  assert.equal(d.querySelector('h1').textContent, 'Public Transport in New York City: 2027 Guide');
  assert.equal(d.querySelector('link[rel="canonical"]').href, newUrl);
  assert.equal(d.querySelector('meta[property="og:url"]').content, newUrl);
  const schema = [...d.querySelectorAll('script[type="application/ld+json"]')]
    .map((node) => JSON.parse(node.textContent)).find((value) => value['@type'] === 'BlogPosting');
  assert.equal(schema.url, newUrl);
  assert.equal(schema.headline, d.querySelector('h1').textContent);
  assert.equal(d.querySelector('.ql-editor p').textContent, 'Archive body');
  assert.equal(lookups(), previous + 1);
  dom.window.close();
  for (const path of ['/usa', '/wandered-posts?search=nyc-transport-fixture', '/usa/fixture-archive-6']) {
    const { dom: listing } = await page(path);
    const links = [...listing.window.document.querySelectorAll('main a')].map((node) => node.href);
    assert.ok(links.includes(newUrl), path);
    assert.ok(!links.some((href) => href.endsWith(oldPath)), path);
    listing.window.close();
  }
  const sitemap = await fetch(base + '/sitemap.xml');
  const xml = await sitemap.text();
  assert.ok(xml.includes('<loc>' + newUrl + '</loc>'));
  assert.ok(!xml.includes(oldPath));
});
