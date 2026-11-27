const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { JSDOM } = require('jsdom');
const loadTs = require('./helpers/load-ts.cjs');

const compiled = ts.transpileModule(fs.readFileSync('src/components/ArchiveFeed/ArchiveFeed.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const card = n => ({ _id: String(n), heading: 'Story ' + n });
const batch = (page, total) => ({ total, page, result: Array.from(
  { length: Math.min(27, Math.max(0, total - (page - 1) * 27)) }, (_, i) => card((page - 1) * 27 + i + 1),
) });

async function withFeed(fetcher, run) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://www.thewandered.com/ukraine' });
  const { window } = dom;
  const previous = {
    window: global.window, document: global.document, act: global.IS_REACT_ACT_ENVIRONMENT,
    navigator: Object.getOwnPropertyDescriptor(global, 'navigator'),
  };
  global.window = window;
  global.document = window.document;
  Object.defineProperty(global, 'navigator', { value: window.navigator, configurable: true });
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const exports = {};
  vm.runInNewContext(compiled, { exports, window, document: window.document, Element: window.Element, HTMLAnchorElement: window.HTMLAnchorElement, AbortController, URLSearchParams, fetch: fetcher, require(id) {
    if (id === './ArchiveCard') return ({ post }) => React.createElement('article', null,
      React.createElement('h2', null, React.createElement('a', { href: '/story-' + post._id }, post.heading)));
    if (id.endsWith('.scss')) return {};
    if (id.startsWith('@/utils/')) return loadTs('src/' + id.slice(2) + '.ts');
    return require(id);
  } });
  const { createRoot } = require('react-dom/client');
  const root = createRoot(window.document.getElementById('root'));
  const render = async (total, key = 'first') => {
    const props = { key, section: 'ukraine', initial: batch(1, total), className: 'feed' };
    await React.act(async () => root.render(React.createElement(exports.default, props)));
  };
  const next = () => window.document.querySelector('a[rel="next"]');
  const titles = () => [...window.document.querySelectorAll('article h2 a')].map(a => a.textContent);
  try {
    await run({ window, render, next, titles });
  } finally {
    React.act(() => root.unmount());
    dom.window.close();
    global.window = previous.window;
    global.document = previous.document;
    if (previous.navigator) Object.defineProperty(global, 'navigator', previous.navigator);
    else delete global.navigator;
    global.IS_REACT_ACT_ENVIRONMENT = previous.act;
  }
}

test('one active request per click, retries the same failed page, focuses appended cards and finishes on the remainder', async () => {
  const requested = [];
  let respond;
  await withFeed((url) => {
    requested.push(Number(new URL(url, 'https://www.thewandered.com').searchParams.get('page')));
    return new Promise(resolve => { respond = resolve; });
  }, async ({ window, render, next, titles }) => {
    await render(59);
    assert.equal(next().textContent, 'Показати ще');
    React.act(() => { next().click(); next().click(); });
    assert.deepEqual(requested, [2]);
    await React.act(async () => respond(new Response(null, { status: 503 })));
    assert.equal(titles().length, 27);
    assert.match(window.document.querySelector('[role="status"]').textContent, /Спробуйте/);
    React.act(() => next().click());
    await React.act(async () => respond(Response.json(batch(2, 59))));
    assert.equal(titles().length, 54);
    assert.equal(window.document.activeElement.textContent, 'Story 28');
    assert.equal(next().getAttribute('href'), '/ukraine?page=3');
    React.act(() => next().click());
    await React.act(async () => respond(Response.json(batch(3, 59))));
    assert.deepEqual(requested, [2, 2, 3]);
    assert.deepEqual(titles(), batch(1, 59).result.concat(batch(2, 59).result, batch(3, 59).result).map(post => post.heading));
    assert.equal(next(), null);
    assert.equal(window.location.pathname + window.location.search, '/ukraine');
  });
});

test('overlapping results after publication do not duplicate a story and a returned history entry restores its position', async () => {
  const requests = [];
  await withFeed(async () => {
    requests.push(2);
    return Response.json({ total: 30, result: [card(27), card(28), card(29)] });
  }, async ({ window, render, next, titles }) => {
    window.history.replaceState({ existing: 'preserved' }, '');
    let restoredY;
    window.scrollTo = (_, y) => { restoredY = y; };
    await render(29);
    await React.act(async () => next().click());
    assert.equal(titles().length, 29);
    assert.equal(new Set(titles()).size, 29);
    assert.equal(next(), null);
    Object.defineProperty(window, 'scrollY', { value: 8765 });
    window.dispatchEvent(new window.Event('pagehide'));
    assert.equal(window.history.state.existing, 'preserved');
    await render(30, 'returned');
    assert.deepEqual(requests, [2, 2]);
    assert.equal(restoredY, 8765);
    assert.equal(titles().at(-1), 'Story 29');
  });
});
