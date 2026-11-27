const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./helpers/load-ts.cjs');

const origin = 'https://www.thewandered.com';
function card(country, slug, day, more = {}) {
  return {
    _id: country + '-' + slug, country, heading: slug, description: 'A story',
    articleUrl: origin + '/' + (country === 'home' ? '' : country + '/') + slug,
    publicationDate: `2024-01-${day}`, ...more,
  };
}

function feed(archives) {
  const requests = [];
  const { getOtherSectionStories } = load('src/services/getOtherSectionStories.ts', {
    fetch: async (url, options) => {
      const section = url.searchParams.get('typeOfPage');
      const page = Number(url.searchParams.get('page'));
      const size = Number(url.searchParams.get('limit'));
      requests.push({ section, page, size, cache: options.cache });
      const records = archives[section];
      if (records === null) return new Response(null, { status: 503 });
      const rows = records || [];
      return Response.json({ total: rows.length, result: rows.slice((page - 1) * size, page * size) });
    },
  });
  return { getOtherSectionStories, requests };
}

test('takes two per other section, grouping and ordering by publication date, including a single story', async () => {
  const { getOtherSectionStories, requests } = feed({
    home: [card('home', 'new', '24'), card('home', 'previous', '20'), card('home', 'edited', '01', { changeDate: '2030-01-01' })],
    canada: [card('canada', 'first', '25'), card('canada', 'second', '09')],
    poland: [card('poland', 'single', '24')],
    'uncharted-planet': [card('uncharted-planet', 'planet', '10')],
    usa: null,
  });
  const stories = await getOtherSectionStories('ukraine', 'open-id');
  assert.deepEqual(Array.from(stories, story => story.heading), ['first', 'second', 'new', 'previous', 'single', 'planet']);
  assert.deepEqual(requests.map(r => r.section).sort(), ['australia', 'canada', 'home', 'poland', 'singapore', 'uncharted-planet', 'usa']);
  assert.ok(requests.every(r => r.page === 1 && r.size === 2 && r.cache === 'no-store'));
});

test('fills rejected or duplicate slots with the next public records and keeps canonical article links and thumbnails', async () => {
  const legacy = 'http://res.cloudinary.com/your-price-booking/image/upload/nyc.jpg';
  const oldNyc = card('usa', 'public-transport-in-new-york-city-a-2023-travelq-guide', '17', {
    _id: '6b01affee75e067d28578ed4', imageUrl: [legacy],
  });
  const { getOtherSectionStories, requests } = feed({
    usa: [
      card('usa', 'scheduled', '22', { publicationDate: '2099-01-01' }),
      card('usa', 'open', '21', { _id: 'current-id' }),
      card('usa', 'wrong-section', '20', { articleUrl: origin + '/canada/other' }),
      card('usa', 'invalid-date', '19', { publicationDate: '2024-02-31' }),
      oldNyc,
      { ...oldNyc, _id: 'alias', articleUrl: origin + '/usa/public-transport-in-new-york-city-2027?ref=old' },
      card('usa', 'second', '12', { imageUrl: [{ url: 'https://unknown.example/photo.jpg' }] }),
    ],
    canada: [card('canada', 'local', '25', { imageUrl: [{ url: '/local-cover.jpg' }] })],
  });
  const stories = await getOtherSectionStories('home', 'current-id');
  assert.deepEqual(Array.from(stories, s => [s.href, s.image]), [
    [origin + '/canada/local', '/local-cover.jpg'],
    [origin + '/usa/public-transport-in-new-york-city-2027', legacy.replace('http:', 'https:')],
    [origin + '/usa/second', '/no-photo.webp'],
  ]);
  assert.deepEqual(requests.filter(r => r.section === 'usa').map(r => r.page), [1, 2, 3, 4]);
  assert.equal(requests.filter(r => r.section === 'canada').length, 1);
});

test('an empty feed stays empty and a previously failing source can recover independently', async () => {
  const archives = { usa: null };
  const { getOtherSectionStories, requests } = feed(archives);
  assert.equal((await getOtherSectionStories('home', 'open')).length, 0);
  archives.usa = [card('usa', 'recovered', '03')];
  const stories = await getOtherSectionStories('home', 'open');
  assert.deepEqual(Array.from(stories, s => s.heading), ['recovered']);
  assert.equal(requests.filter(r => r.section === 'usa').length, 2);
  assert.equal(requests.filter(r => r.section === 'canada').length, 1);
});

test('a malformed CMS entry does not suppress its healthy sibling or the next available story', async () => {
  const { getOtherSectionStories } = feed({
    canada: [null, card('canada', 'first', '10'), card('canada', 'second', '09')],
    poland: [card('poland', 'bad', '06', { heading: ' ' }), card('poland', 'only', '05')],
  });
  const stories = await getOtherSectionStories('home', 'open');
  assert.deepEqual(Array.from(stories, s => s.heading), ['first', 'second', 'only']);
});
