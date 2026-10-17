// Loaded only by the production HTTP tests via node --require. No production switch.
const fs = require('node:fs');
const realFetch = global.fetch;
global.fetch = async (input, options = {}) => {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (url.origin !== 'https://www.thewandered.com' || url.pathname !== '/blog/api/post/get-by-url') return realFetch(input, options);
  const articleUrl = url.searchParams.get('articleUrl');
  if (process.env.ARTICLE_FIXTURE_LOG) fs.appendFileSync(process.env.ARTICLE_FIXTURE_LOG, `${articleUrl}\n`);
  const path = new URL(articleUrl).pathname;
  const slug = decodeURIComponent(path.split('/').pop());
  const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
  const missing = () => json({ code: 409, message: `posts with url ${articleUrl} don't found in DB` }, 409);
  if (slug === 'fixture-missing') return missing();
  if (slug === 'fixture-delayed-missing') { await new Promise((resolve) => setTimeout(resolve, 150)); return missing(); }
  if (slug === 'fixture-unavailable') return json({ message: 'Unavailable' }, 503);
  if (slug === 'fixture-conflict') return json({ code: 409, message: 'Unknown conflict' }, 409);
  if (slug === 'fixture-invalid') return json({ result: { heading: 'Incomplete' } });
  if (slug === 'fixture-timeout') return new Promise((resolve, reject) => {
    const signal = options.signal || input.signal;
    if (signal.aborted) reject(signal.reason);
    else signal.addEventListener('abort', () => {
      reject(signal.reason);
    }, { once: true });
  });
  const heading = path.startsWith('/ukraine/') ? 'Серверна стаття' : path.startsWith('/poland/') ? 'Artykuł serwerowy' : 'Server article';
  return json({ result: {
    _id: '123456789012345678901234', heading, title: heading, description: 'Fixture description', author: slug === 'fixture-known' ? 'Viacheslav Nikitenko' : 'Fixture Author',
    articleUrl, publicationDate: '2026-10-17T07:00:00.000Z', changeDate: slug === 'fixture-known' ? '2026-10-17T08:00:00.000Z' : '', country: path.split('/')[1],
    imageUrl: slug === 'fixture-empty' ? [] : [{ url: '/no-photo.webp', context: { alt: 'Hero photo', caption: 'Hero caption' } }, { url: '/no-photo.webp', context: { alt: 'Body photo', caption: 'Body caption' } }],
    markup: '<p id="fixture-body">Server rendered body with a <a href="/authors">real link</a>.</p><h2>Section</h2><table><tr><td>Table content</td></tr></table><img src="imgUrlByIdx"><blockquote>Quote — Author</blockquote><iframe src="https://www.youtube.com/embed/test" allowfullscreen></iframe><script>evil()</script>',
  } });
};
