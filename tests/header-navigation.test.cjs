const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { JSDOM } = require('jsdom');
const load = require('./helpers/load-ts.cjs');
const { getHeaderCopy, travelTools } = load('src/defaultData/headerNavigation.ts');

function component(file, mocks, globals = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, { exports, ...globals, require: (id) => {
    if (id.endsWith('.scss')) return new Proxy({}, { get: (_, key) => key === '__esModule' ? false : String(key) });
    if (id in mocks) return mocks[id];
    return require(id);
  } });
  return exports.default;
}
for (const section of ['home', 'ukraine', 'poland', 'usa', 'canada', 'australia', 'singapore', 'uncharted-planet', 'wandered-posts']) {
  test(`header retains destinations, localized tools and one fixed masthead: ${section}`, () => {
    const Header = component('src/components/Header/Header.tsx', {
      'next/navigation': { usePathname: () => section === 'home' ? '/' : `/${section}`, useParams: () => ({}) },
      'next/link': ({ children, ...props }) => React.createElement('a', props, children),
      '../../../public/HouseIcon': () => null,
      '../TopSection/BackArrow/BackArrow': () => null,
      './SearchField/SearchField': () => null,
      '@/defaultData/headerNavigation': { getHeaderCopy, travelTools },
    });
    const dom = new JSDOM(renderToStaticMarkup(React.createElement(Header)));
    const d = dom.window.document;
    const copy = getHeaderCopy(section);
    assert.equal(d.querySelector('[lang]').lang, copy.lang);
    assert.equal(d.querySelectorAll('hotfx-shy-header').length, 1);
    assert.equal(d.querySelector('hotfx-shy-header').dataset.pinned, 'true');
    assert.equal(d.querySelectorAll('h1').length, 0);
    assert.ok(d.querySelector('.navigation'));
    assert.equal(d.querySelector('hotfx-shy-header .navigation'), null);
    const tools = [...d.querySelectorAll('.toolLinks a')];
    assert.equal(tools.length, 4);
    travelTools.forEach((id, i) => {
      assert.equal(tools[i].getAttribute('href'), `/travel-resources#${id}`);
      assert.ok(tools[i].textContent.includes(copy.toolNames[i]));
    });
    const destinations = [...d.querySelectorAll('.countryPanel a')];
    assert.equal(destinations.length, 6);
    assert.deepEqual(destinations.map(a => a.getAttribute('href')), ['/ukraine', '/poland', '/usa', '/canada', '/australia', '/singapore']);
    const ids = [...d.querySelectorAll('[id]')].map(x => x.id);
    assert.equal(new Set(ids).size, ids.length);
    dom.window.close();
  });
}

test('header search keeps an accessible submit name and a native GET fallback', () => {
  const Search = component('src/components/Header/SearchField/SearchField.tsx', {
    'next/navigation': { useSearchParams: () => new URLSearchParams(), usePathname: () => '/ukraine', useRouter: () => ({ push() {} }) },
    '@/types/enums/pagesEnums': { PagesEnum: { SEARCH_DATA_PAGE: 'wandered-posts' } },
    '@/defaultData/searchCopy': load('src/defaultData/searchCopy.ts'),
    './SearchBtnIcon/SearchBtnIcon': () => null,
  });
  const d = new JSDOM(renderToStaticMarkup(React.createElement(Search, { variant: 'header' }))).window.document;
  assert.equal(d.querySelector('form').getAttribute('action'), '/wandered-posts');
  assert.equal(d.querySelector('form').method, 'get');
  assert.equal(d.querySelector('input').name, 'search');
  assert.equal(d.querySelector('button').getAttribute('aria-label'), 'Знайти');
  assert.ok(d.querySelector('label[for]'));
});


test('menus and search close on Escape, outside press and route changes, restoring keyboard focus', async () => {
  const dom = new JSDOM('<div id="root"></div><button id="outside">Outside</button>', { url: 'https://www.thewandered.com/ukraine', pretendToBeVisual: true });
  const saved = { window: global.window, document: global.document, navigator: global.navigator, act: global.IS_REACT_ACT_ENVIRONMENT };
  global.window = dom.window; global.document = dom.window.document;
  Object.defineProperty(global, 'navigator', { configurable: true, value: dom.window.navigator });
  global.IS_REACT_ACT_ENVIRONMENT = true;
  // React's input-event feature detection is conservative in JSDOM.
  dom.window.HTMLElement.prototype.attachEvent = () => {};
  dom.window.HTMLElement.prototype.detachEvent = () => {};
  let pathname = '/ukraine';
  const Header = component('src/components/Header/Header.tsx', {
    'next/navigation': { usePathname: () => pathname, useParams: () => ({}) },
    'next/link': ({ children, ...props }) => React.createElement('a', props, children),
    '../../../public/HouseIcon': () => null,
    '../TopSection/BackArrow/BackArrow': () => null,
    './SearchField/SearchField': () => React.createElement('form', null, React.createElement('input', { type: 'search' })),
    '@/defaultData/headerNavigation': { getHeaderCopy, travelTools },
  }, { document: dom.window.document });
  const { createRoot } = require('react-dom/client');
  const root = createRoot(dom.window.document.getElementById('root'));
  const d = dom.window.document;
  try {
    await React.act(async () => root.render(React.createElement(Header)));
    const menu = d.querySelector('.mobileMenu');
    const summary = menu.querySelector('summary');
    await React.act(async () => { summary.click(); });
    assert.equal(menu.open, true);
    const link = menu.querySelector('a');
    await React.act(async () => { link.focus(); link.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
    assert.equal(menu.open, false);
    assert.equal(d.activeElement, summary);
    await React.act(async () => { summary.click(); });
    await React.act(async () => d.querySelector('#outside').dispatchEvent(new dom.window.MouseEvent('pointerdown', { bubbles: true })));
    assert.equal(menu.open, false);
    const toggle = d.querySelector('button[aria-controls="header-search-panel"]');
    await React.act(async () => toggle.click());
    const panel = d.getElementById('header-search-panel');
    assert.equal(panel.hidden, false);
    assert.equal(d.activeElement, panel.querySelector('input'));
    await React.act(async () => panel.querySelector('input').dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    assert.equal(panel.hidden, true);
    assert.equal(d.activeElement, toggle);
    await React.act(async () => summary.click());
    pathname = '/poland';
    await React.act(async () => root.render(React.createElement(Header)));
    assert.equal(menu.open, false);
    assert.equal(d.querySelector('[lang]').lang, 'pl');
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();global.window = saved.window;global.document = saved.document;global.IS_REACT_ACT_ENVIRONMENT = saved.act;
    if (saved.navigator) Object.defineProperty(global, 'navigator', { configurable: true, value: saved.navigator });
    else delete global.navigator;
  }
});
