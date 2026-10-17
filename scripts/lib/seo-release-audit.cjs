const { JSDOM } = require('jsdom');
const ORIGIN = 'https://www.thewandered.com';
const NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const language = url => /^\/ukraine(?:\/|$)/.test(new URL(url).pathname) ? 'uk' : /^\/poland(?:\/|$)/.test(new URL(url).pathname) ? 'pl' : 'en';
const normalized = value => { try { const u = new URL(value); u.hash = ''; return u.href; } catch { return null; } };
const blocked = value => /(?:^|[\s,:])(?:noindex|none)(?:$|[\s,])/i.test(value || '');

function inspectPage(html, url, headers = new Headers(), expected = 'index') {
  const dom = new JSDOM(html); const d = dom.window.document; const errors = [];
  try {
    const metas = selector => [...d.querySelectorAll(selector)].map(n => n.content || '');
    const robots = [...metas('meta[name="robots" i],meta[name="googlebot" i]'), headers.get('x-robots-tag') || ''];
    if (expected === 'noindex') {
      if (!robots.some(blocked)) errors.push('Missing noindex on excluded URL');
      return { errors, images: [] };
    }
    if (robots.some(blocked)) errors.push('Indexable URL has noindex');
    if (d.documentElement.lang !== language(url)) errors.push('Incorrect initial HTML language');
    if (d.querySelectorAll('h1').length !== 1 || !d.querySelector('h1')?.textContent.trim()) errors.push('Expected one nonempty H1');
    if (d.querySelectorAll('title').length !== 1 || !d.querySelector('title')?.textContent.trim() || metas('meta[name="description"]').length !== 1 || !metas('meta[name="description"]')[0].trim()) errors.push('Missing/duplicate title or description');
    const canonicals = [...d.querySelectorAll('link[rel="canonical"]')];
    if (canonicals.length !== 1 || normalized(canonicals[0].getAttribute('href')) !== normalized(url)) errors.push('Canonical is missing, duplicate or not self-referencing');
    const property = key => metas(`meta[property="${key}"]`);
    const name = key => metas(`meta[name="${key}"]`);
    for (const key of ['og:title','og:description','og:type','og:url','og:site_name','og:locale','og:image','og:image:alt']) if (!property(key).some(v => v.trim())) errors.push(`Missing ${key}`);
    for (const key of ['twitter:title','twitter:description','twitter:image','twitter:image:alt']) if (!name(key).some(v => v.trim())) errors.push(`Missing ${key}`);
    if (normalized(property('og:url')[0]) !== normalized(url)) errors.push('og:url differs from canonical');
    if (name('twitter:card')[0] !== 'summary_large_image') errors.push('Incorrect Twitter Card type');
    const locale = { en: 'en_US', uk: 'uk_UA', pl: 'pl_PL' }[language(url)];
    if (property('og:locale')[0] !== locale) errors.push('Incorrect Open Graph locale');
    const images = [...new Set([...property('og:image'), ...name('twitter:image')])];
    for (const image of images) {
      try { if (new URL(image).protocol !== 'https:') errors.push('Social image must be absolute HTTPS'); } catch { errors.push('Invalid social image URL'); }
    }
    if (property('og:image:width')[0] !== '1200' || property('og:image:height')[0] !== '630') errors.push('Unexpected declared social image dimensions');
    for (const script of d.querySelectorAll('script[type="application/ld+json"]')) { try { JSON.parse(script.textContent); } catch { errors.push('Invalid JSON-LD'); } }
    return { errors, images };
  } finally { dom.window.close(); }
}

function parseSitemap(xml, origin = ORIGIN) {
  if (/<!DOCTYPE/i.test(xml)) throw Error('Unexpected sitemap DOCTYPE');
  const dom = new JSDOM(xml, { contentType: 'application/xml' });
  try {
    const d = dom.window.document, root = d.documentElement;
    if (root.namespaceURI !== NS || !['urlset','sitemapindex'].includes(root.localName)) throw Error('Invalid sitemap namespace/root');
    const group = root.localName === 'urlset' ? 'url' : 'sitemap';
    const urls = [...root.children].filter(n => n.localName === group).map(node => {
      const locs = [...node.children].filter(n => n.localName === 'loc');
      if (locs.length !== 1) throw Error('Sitemap entry must have one loc');
      const value = locs[0].textContent.trim(), url = new URL(value);
      if (url.origin !== origin || url.hash || url.search || url.username || url.password) throw Error('Sitemap contains a noncanonical or off-origin URL');
      return url.href;
    });
    if (!urls.length || new Set(urls).size !== urls.length) throw Error('Empty/duplicate sitemap entries');
    return { index: root.localName === 'sitemapindex', urls };
  } finally { dom.window.close(); }
}

async function limitedBody(response, limit) {
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader(); const chunks = []; let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength; if (size > limit) throw Error(`Response exceeds ${limit} bytes`);
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks);
  } finally { await reader.cancel().catch(() => {}); }
}

function imageDimensions(bytes, mime) {
  if (mime === 'image/png' && bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
  if (mime === 'image/jpeg' && bytes[0] === 255 && bytes[1] === 216) {
    let offset = 2;
    while (offset + 4 < bytes.length) {
      if (bytes[offset++] !== 255) break;
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if ([0xd8,0xd9,0x01].includes(marker) || (marker >= 0xd0 && marker <= 0xd7)) continue;
      const length = bytes.readUInt16BE(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if ([0xc0,0xc1,0xc2].includes(marker) && length >= 7) return [bytes.readUInt16BE(offset + 5), bytes.readUInt16BE(offset + 3)];
      offset += length;
    }
  }
  throw Error('Unsupported/invalid image header (expected real PNG or JPEG)');
}

async function runAudit({ fetcher = fetch, origin = ORIGIN, maxPages = 0, expectedMinUrls = 15, timeoutMs = 20000, budgetMs = 480000, concurrency = 2, checkVariants = true } = {}) {
  if (origin !== ORIGIN) throw Error('This audit targets the canonical production origin');
  if (![maxPages,expectedMinUrls,timeoutMs,budgetMs,concurrency].every(Number.isSafeInteger) || maxPages < 0 || expectedMinUrls < 1 || timeoutMs < 1 || budgetMs < 1 || concurrency < 1 || concurrency > 4) throw Error('Invalid audit limits');
  const start = Date.now(), issues = [], pages = [], assets = [], redirects = [];
  const fail = (url, error) => issues.push({ url, error: String(error.message || error) });
  const request = async (url, image = false) => {
    if (Date.now() - start >= budgetMs) throw Error('Audit time budget exhausted');
    const signal = AbortSignal.timeout(Math.min(timeoutMs, Math.max(1, budgetMs - (Date.now() - start))));
    const response = await fetcher(url, { redirect: 'manual', signal, headers: { Accept: image ? 'image/png,image/jpeg' : 'text/html,application/xml,text/plain', 'User-Agent': 'TheWandered-SEO-Release-Audit/1.0' } });
    const body = await limitedBody(response, image ? 4 * 1024 * 1024 : 8 * 1024 * 1024);
    return { response, body };
  };
  let sitemapUrls = [];
  try {
    const { response, body } = await request(origin + '/robots.txt');
    if (response.status !== 200) throw Error(`robots.txt HTTP ${response.status}`);
    const robots = body.toString();
    if (!new RegExp(`^Sitemap:\\s*${origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/sitemap\\.xml\\s*$`, 'im').test(robots)) throw Error('robots.txt does not advertise canonical sitemap');
    // Detect sitewide blocks conservatively, including bot-specific groups. Detailed URL matching remains a crawler/SC check.
    let agents = [], directives = false;
    for (const line of robots.split(/\r?\n/)) {
      const rule = line.replace(/#.*$/, '').trim().match(/^([^:]+):\s*(.*)$/);
      if (!rule) continue;
      const key = rule[1].toLowerCase(), value = rule[2].trim();
      if (key === 'user-agent') {
        if (directives) { agents = []; directives = false; }
        agents.push(value.toLowerCase());
      } else if (key === 'allow' || key === 'disallow') {
        directives = true;
        if (key === 'disallow' && /^\/(?:\*\$?)?$/.test(value) && agents.some(agent => agent === '*' || agent.startsWith('googlebot'))) throw Error('robots.txt contains a sitewide disallow');
      }
    }
  } catch (e) { fail(origin + '/robots.txt', e); }
  try {
    const queue = [origin + '/sitemap.xml'], seen = new Set();
    while (queue.length) {
      const url = queue.shift(); if (seen.has(url) || seen.size >= 20) throw Error('Sitemap cycle/index limit exceeded'); seen.add(url);
      const { response, body } = await request(url);
      if (response.status !== 200 || !/xml/i.test(response.headers.get('content-type') || '')) throw Error(`Sitemap HTTP/MIME failure: ${response.status}`);
      const parsed = parseSitemap(body.toString(), origin);
      if (parsed.index) queue.push(...parsed.urls); else sitemapUrls.push(...parsed.urls);
      if (sitemapUrls.length > 1000) throw Error('Sitemap URL limit exceeded (1000); increase deliberately for a larger archive');
    }
    if (new Set(sitemapUrls).size !== sitemapUrls.length) throw Error('Duplicate URLs across sitemap parts');
    if (sitemapUrls.length < expectedMinUrls) throw Error(`Sitemap shrank: ${sitemapUrls.length} < baseline ${expectedMinUrls}`);
  } catch (e) { fail(origin + '/sitemap.xml', e); }
  const targets = maxPages ? sitemapUrls.slice(0, maxPages) : sitemapUrls;
  let cursor = 0;
  const imageUrls = new Set();
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (cursor < targets.length) {
      const url = targets[cursor++], began = Date.now();
      try {
        const { response, body } = await request(url);
        const result = { url, status: response.status, elapsedMs: Date.now() - began }; pages.push(result);
        if (response.status !== 200) throw Error(`Indexable URL returned HTTP ${response.status}`);
        if (!response.headers.get('content-type')?.includes('text/html')) throw Error('Page is not HTML');
        const checked = inspectPage(body.toString(), url, response.headers);
        checked.errors.forEach(error => fail(url, error)); checked.images.forEach(image => imageUrls.add(image));
      } catch (e) { fail(url, e); if (!pages.some(p => p.url === url)) pages.push({ url, status: null, elapsedMs: Date.now() - began }); }
    }
  }));
  for (const [path, status, expectation] of [['/wandered-posts?search=travel',200,'noindex'], ['/usa/__seo-release-audit-missing-7f41d9',404,'noindex']]) {
    const url = origin + path;
    try {
      const { response, body } = await request(url);
      if (response.status !== status) throw Error(`Expected HTTP ${status}, got ${response.status}`);
      inspectPage(body.toString(), url, response.headers, expectation).errors.forEach(error => fail(url, error));
    } catch (e) { fail(url, e); }
  }
  if (checkVariants) for (const input of ['http://www.thewandered.com/', 'http://thewandered.com/', 'https://thewandered.com/', origin + '/travel-resources/']) {
    let url = input; const chain = [], seen = new Set();
    try {
      for (let hops = 0; hops <= 3; hops++) {
        if (seen.has(url)) throw Error('Redirect loop'); seen.add(url);
        const { response } = await request(url); chain.push({ url, status: response.status });
        if (response.status >= 300 && response.status < 400) {
          if (![301,308].includes(response.status) || !response.headers.get('location')) throw Error('Nonpermanent/invalid redirect');
          url = new URL(response.headers.get('location'), url).href;
          if (![origin, 'http://www.thewandered.com','http://thewandered.com','https://thewandered.com'].includes(new URL(url).origin)) throw Error('Redirect leaves known site origins');
          continue;
        }
        if (response.status !== 200 || url !== (input.endsWith('/travel-resources/') ? origin + '/travel-resources' : origin + '/')) throw Error('Variant did not reach canonical 200');
        break;
      }
      if (chain.at(-1)?.status !== 200) throw Error('Redirect chain exceeds three hops');
    } catch (e) { fail(input, e); }
    redirects.push({ input, chain });
  }
  const imageList = [...imageUrls]; let imageCursor = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (imageCursor < imageList.length) {
      const url = imageList[imageCursor++];
      try {
        const u = new URL(url);
        if (u.protocol !== 'https:' || ![new URL(origin).hostname, 'res.cloudinary.com'].includes(u.hostname) || u.port || u.username || u.password) throw Error('Image origin not on audit allowlist');
        const { response, body } = await request(url, true);
        if (response.status !== 200) throw Error(`Social image HTTP ${response.status}`);
        const mime = (response.headers.get('content-type') || '').split(';')[0];
        const dimensions = imageDimensions(body, mime);
        if (dimensions[0] !== 1200 || dimensions[1] !== 630) throw Error(`Actual social image dimensions ${dimensions.join('x')}`);
        assets.push({ url, status: response.status, mime, dimensions, bytes: body.length });
      } catch (e) { fail(url, e); }
    }
  }));
  const complete = sitemapUrls.length > 0 && pages.length === sitemapUrls.length && pages.every(page => page.status !== null);
  return { checkedAt: new Date().toISOString(), origin, mode: maxPages ? 'sample' : 'full', complete,
    passed: issues.length === 0 && (maxPages > 0 || complete), elapsedMs: Date.now() - start,
    coverage: { discovered: sitemapUrls.length, requested: targets.length, checked: pages.length, expectedMinUrls, uniqueImages: imageUrls.size, checkedImages: assets.length, unverifiedImages: imageUrls.size - assets.length },
    limitations: ['Initial HTTP/HTML only; no JS execution or Google indexing confirmation.', 'robots check detects sitewide blocks; per-path rules need separate review.', 'Private staging protection, devices, Search Console and field CWV require separate acceptance.'],
    issues, pages, assets, redirects };
}
module.exports = { inspectPage, parseSitemap, imageDimensions, runAudit };
