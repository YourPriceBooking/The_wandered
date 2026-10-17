const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const load = require('./helpers/load-ts.cjs');
const seo = load('src/utils/seoMetadata.ts');

for (const country of Object.keys(seo.listingCopy)) {
  test(`complete and localized listing metadata: ${country}`, () => {
    const m = seo.listingMetadata(country, '2');
    assert.equal(m.openGraph.type, 'website');
    assert.equal(m.openGraph.url, m.alternates.canonical);
    assert.ok(m.alternates.canonical.endsWith('?page=2'));
    assert.equal(m.twitter.card, 'summary_large_image');
    assert.equal(m.twitter.title, m.title);
    assert.equal(m.twitter.description, m.description);
    assert.equal(m.openGraph.locale, country === 'ukraine' ? 'uk_UA' : country === 'poland' ? 'pl_PL' : 'en_US');
    assert.ok(!m.alternates.languages, 'Different country archives are not translations');
    assert.ok(m.openGraph.images[0].alt);
    for (const invalid of ['1', '0', '-2', '1.5', '02', 'NaN', ['2', '3']]) {
      assert.ok(!seo.listingMetadata(country, invalid).alternates.canonical.includes('?'));
    }
  });
}
const record = { heading: 'Travel & discovery', description: '', author: 'Viacheslav Nikitenko', imageUrl: [], publicationDate: '2026-10-17T07:00:00Z', changeDate: 'bad-date' };
test('article metadata uses its route, real dates/author, and a localized fallback', () => {
  for (const [country, language] of [['home', 'en'], ['ukraine', 'uk'], ['poland', 'pl']]) {
    const m = seo.articleMetadata(record, country, 'trip-%26-%D0%BC%D1%96%D1%81%D1%82%D0%BE');
    assert.equal(m.openGraph.type, 'article');
    assert.equal(m.openGraph.publishedTime, '2026-10-17T07:00:00.000Z');
    assert.equal(m.openGraph.modifiedTime, undefined);
    assert.equal(m.openGraph.url, m.alternates.canonical);
    assert.ok(m.alternates.canonical.includes('trip-%26-%D0%BC%D1%96%D1%81%D1%82%D0%BE'));
    assert.ok(m.openGraph.images[0].url.endsWith(`/article-${language}.png`));
    assert.ok(m.openGraph.authors[0].includes('/authors#author-') || m.openGraph.authors[0].includes('authors#author-'));
    assert.ok(m.description.length > 30);
    assert.equal(m.authors[0].name, record.author);
    assert.equal(m.twitter.images[0].url, m.openGraph.images[0].url);
  }
  assert.ok(seo.articleCanonical('usa', '100% fun?#').endsWith('100%25%20fun%3F%23'));
  assert.ok(seo.articleCanonical('usa', '%2526').endsWith('%2526'));
});
test('only the known image CDN gets an HTTPS crop; other image values use a public fallback', () => {
  const image = seo.articleSocialImage({ ...record, imageUrl: ['http://res.cloudinary.com/your-price-booking/image/upload/v123/photo.jpg'] }, 'en');
  assert.equal(image.url, 'https://res.cloudinary.com/your-price-booking/image/upload/c_fill,w_1200,h_630,f_jpg,q_auto/v123/photo.jpg');
  assert.equal(image.type, 'image/jpeg');
  for (const value of ['javascript:evil()', 'http://unknown.example/photo.jpg', 'https://res.cloudinary.com.evil.example/photo.jpg', 'https://user@res.cloudinary.com/your-price-booking/image/upload/photo.jpg', '/missing.jpg', 'https://res.cloudinary.com/another-account/image/upload/photo.jpg']) {
    assert.ok(seo.articleSocialImage({ ...record, imageUrl: [value] }, 'pl').url.endsWith('/article-pl.png'));
  }
});
test('every checked-in social image is a decodable PNG with truthful dimensions', () => {
  const root = path.join(__dirname, '../public');
  const files = [...fs.readdirSync(path.join(root, 'social')).map((file) => path.join(root, 'social', file)), ...['en','uk','pl'].map((lang) => path.join(root, `authors-og-${lang}.png`))];
  assert.equal(files.length, 19);
  for (const file of files) {
    const png = fs.readFileSync(file);
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', file);
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20), depth = png[24], color = png[25];
    assert.equal(width, 1200, file); assert.equal(height, 630, file); assert.equal(depth, 8, file);
    assert.ok([0, 2, 3, 6].includes(color), file); assert.equal(png[28], 0, 'non-interlaced PNG');
    let offset = 8; const chunks = [];
    while (offset < png.length) {
      const length = png.readUInt32BE(offset), type = png.subarray(offset + 4, offset + 8).toString();
      if (type === 'IDAT') chunks.push(png.subarray(offset + 8, offset + 8 + length));
      offset += length + 12;
    }
    const pixels = zlib.inflateSync(Buffer.concat(chunks));
    const stride = width * (color === 6 ? 4 : color === 2 ? 3 : 1) + 1;
    assert.equal(pixels.length, stride * height, file);
    for (let row = 0; row < height; row++) assert.ok(pixels[row * stride] <= 4, file);
  }
});
