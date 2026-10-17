const assert = require('node:assert/strict');
const test = require('node:test');
const { inspectPage, parseSitemap, imageDimensions, runAudit } = require('../scripts/lib/seo-release-audit.cjs');
const origin = 'https://www.thewandered.com';
const image = origin + '/social.png';
function html(url = origin + '/', lang = 'en') {
  return `<html lang="${lang}"><head><title>Travel</title><meta name="description" content="Travel description"><link rel="canonical" href="${url}">
  ${Object.entries({ 'og:title':'Travel','og:description':'Description','og:type':'website','og:url':url,'og:site_name':'The Wandered','og:locale':{en:'en_US',uk:'uk_UA',pl:'pl_PL'}[lang],'og:image':image,'og:image:alt':'Travel image','og:image:width':'1200','og:image:height':'630' }).map(([key,value])=>`<meta property="${key}" content="${value}">`).join('')}
  ${Object.entries({'twitter:title':'Travel','twitter:description':'Description','twitter:card':'summary_large_image','twitter:image':image,'twitter:image:alt':'Travel image'}).map(([key,value])=>`<meta name="${key}" content="${value}">`).join('')}
  </head><body><h1>Travel</h1><script type="application/ld+json">{"@type":"WebSite"}</script></body></html>`;
}
const sitemap = urls => `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url=>`<url><loc>${url.replaceAll('&','&amp;')}</loc></url>`).join('')}</urlset>`;
const png = () => { const b = Buffer.alloc(24); Buffer.from([137,80,78,71,13,10,26,10]).copy(b); b.writeUInt32BE(1200,16); b.writeUInt32BE(630,20); return b; };
function transport(overrides = {}) {
  return async url => {
    url = String(url); if (overrides[url]) return overrides[url]();
    if (url.endsWith('/robots.txt')) return new Response(`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml`);
    if (url.endsWith('/sitemap.xml')) return new Response(sitemap([origin+'/',origin+'/travel-resources']),{headers:{'content-type':'application/xml'}});
    if (url === image) return new Response(png(), { headers: { 'content-type': 'image/png' } });
    if (url.includes('wandered-posts?')) return new Response('<meta name="robots" content="noindex, follow">');
    if (url.includes('__seo-release-audit-missing')) return new Response('<meta name="robots" content="noindex">', { status:404 });
    if (url.startsWith('http:') || url.startsWith('https://thewandered.com/')) return new Response(null,{status:301,headers:{location:origin+'/'}});
    if (url.endsWith('/travel-resources/')) return new Response(null,{status:308,headers:{location:origin+'/travel-resources'}});
    return new Response(html(url), { headers: { 'content-type': 'text/html' } });
  };
}

test('initial metadata audit accepts matching Ukrainian, Polish and English documents',()=>{
  for(const [path,lang] of [['/','en'],['/ukraine/story','uk'],['/poland/authors','pl']]) assert.equal(inspectPage(html(origin+path,lang),origin+path).errors.length,0);
});
test('initial HTML audit detects noindex headers, duplicate headings, wrong canonical and broken schema',()=>{
  const value=html().replace('<body>','<body><h1>Duplicate</h1>').replace('href="'+origin+'/"','href="'+origin+'/other"').replace('{"@type":"WebSite"}','broken');
  const errors=inspectPage(value,origin+'/',new Headers({'x-robots-tag':'noindex'})).errors;
  for(const word of ['noindex','H1','Canonical','JSON-LD']) assert.ok(errors.some(e=>e.includes(word)));
});
test('social metadata requires both image URLs, alt and a large Twitter Card',()=>{
  const value=html().replace('name="twitter:image"','name="missing"').replace('property="og:image:alt"','property="missing"').replace('summary_large_image','summary');
  const errors=inspectPage(value,origin+'/').errors;
  assert.ok(errors.some(e=>e.includes('twitter:image')));assert.ok(errors.some(e=>e.includes('og:image:alt')));assert.ok(errors.some(e=>e.includes('Twitter Card')));
});
test('sitemap parsing preserves escaped ampersands and rejects duplicates, malformed XML and off-origin URLs',()=>{
  assert.equal(parseSitemap(sitemap([origin+'/a-&-b'])).urls[0],origin+'/a-&-b');
  for(const value of [sitemap([origin+'/',origin+'/']),sitemap(['https://example.com/']),sitemap([origin+'/?search=x']),'<urlset>','<!DOCTYPE xml>'+sitemap([origin+'/'])]) assert.throws(()=>parseSitemap(value));
});
test('asset audit verifies MIME/magic and dimensions instead of accepting HTML as an image',()=>{
  assert.deepEqual(imageDimensions(png(),'image/png'),[1200,630]);
  assert.throws(()=>imageDimensions(Buffer.from('<html>Error</html>'),'image/png'));
  assert.throws(()=>imageDimensions(png(),'text/html'));
});
test('full audit follows site variants and checks every sitemap page with one deduplicated image fetch',async()=>{
  let images=0;const fetcher=transport({[image]:()=>{images++;return new Response(png(),{headers:{'content-type':'image/png'}});}});
  const result=await runAudit({fetcher,expectedMinUrls:2});
  assert.equal(result.passed,true,JSON.stringify(result.issues));assert.equal(result.complete,true);assert.equal(result.coverage.checked,2);assert.equal(images,1);assert.equal(result.redirects.length,4);
});
test('sample is explicitly incomplete; shrinking sitemap, HTTP 500 and absent noindex fail',async()=>{
  const sample=await runAudit({fetcher:transport(),maxPages:1,expectedMinUrls:2});assert.equal(sample.mode,'sample');assert.equal(sample.complete,false);assert.equal(sample.passed,true);
  const fetcher=transport({[origin+'/']:()=>new Response('Unavailable',{status:500}),[origin+'/wandered-posts?search=travel']:()=>new Response('<h1>Search</h1>')});
  const failed=await runAudit({fetcher,expectedMinUrls:3});assert.equal(failed.passed,false);
  for(const word of ['shrank','500','noindex'])assert.ok(failed.issues.some(i=>i.error.includes(word)));
});
test('redirect loops, bad assets and network failures are reported without a false pass',async()=>{
  const result=await runAudit({expectedMinUrls:2,fetcher:transport({
    [origin+'/']:()=>{throw Error('Network unavailable');},[image]:()=>new Response('HTML',{headers:{'content-type':'text/html'}}),
    ['http://www.thewandered.com/']:()=>new Response(null,{status:301,headers:{location:'http://www.thewandered.com/'}}),
  })});
  assert.equal(result.passed,false);assert.equal(result.complete,false);assert.ok(result.issues.some(i=>i.error.includes('loop')));assert.ok(result.issues.some(i=>i.error.includes('image header')));
});
test('off-allowlist social image is flagged without fetching it',async()=>{
  let touched=false;const base=transport();const result=await runAudit({expectedMinUrls:2,checkVariants:false,fetcher:async url=>{
    if(String(url).includes('other.example')){touched=true;throw Error('Should not fetch');}
    if(String(url)===origin+'/')return new Response(html().replaceAll(image,'https://other.example/file.png'),{headers:{'content-type':'text/html'}});
    return base(url);
  }});assert.equal(touched,false);assert.equal(result.passed,false);assert.ok(result.issues.some(i=>i.error.includes('allowlist')));
});

test('sitemap indexes are traversed, cycles fail, and Google sitewide blocks are detected',async()=>{
  const index=loc=>`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${loc}</loc></sitemap></sitemapindex>`;
  const child=origin+'/sitemaps/1.xml';
  const result=await runAudit({expectedMinUrls:2,checkVariants:false,fetcher:transport({
    [origin+'/sitemap.xml']:()=>new Response(index(child),{headers:{'content-type':'application/xml'}}),
    [child]:()=>new Response(sitemap([origin+'/',origin+'/travel-resources']),{headers:{'content-type':'application/xml'}}),
  })});assert.equal(result.passed,true);
  const failed=await runAudit({expectedMinUrls:2,checkVariants:false,fetcher:transport({
    [origin+'/sitemap.xml']:()=>new Response(index(origin+'/sitemap.xml'),{headers:{'content-type':'application/xml'}}),
    [origin+'/robots.txt']:()=>new Response(`User-agent: Googlebot\nDisallow: /\nSitemap: ${origin}/sitemap.xml`),
  })});assert.equal(failed.passed,false);assert.ok(failed.issues.some(i=>i.error.includes('cycle')));assert.ok(failed.issues.some(i=>i.error.includes('sitewide')));
});
