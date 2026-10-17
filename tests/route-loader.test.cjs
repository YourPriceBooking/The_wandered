const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { JSDOM } = require('jsdom');
const React = require('react');

test('splash covers clicks before route commit and finishes only after the destination commits', () => {
  const dom = new JSDOM('<div id="app"></div><a id="next" href="/canada/story">Article</a><a id="external" href="https://example.com">External</a>', { url: 'https://www.thewandered.com/' });
  const previous = { window: global.window, document: global.document, act: global.IS_REACT_ACT_ENVIRONMENT, navigator: Object.getOwnPropertyDescriptor(global, 'navigator') };
  global.window = dom.window;
  global.document = dom.window.document;
  Object.defineProperty(global, 'navigator', { configurable: true, value: dom.window.navigator });
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = require('react-dom/client');
  const root = createRoot(document.querySelector('#app'));
  const exports = {};
  const timers = new Map();
  let id = 0, pathname = '/';
  const source = ts.transpileModule(fs.readFileSync('src/components/LoadingScreen/RouteLoader/RouteLoader.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, { exports, window: dom.window, document, Element: dom.window.Element, URL,
    setTimeout: (fn, ms) => { timers.set(++id, { fn, ms }); return id; }, clearTimeout: key => timers.delete(key),
    require: name => {
      if (name === 'next/navigation') return { usePathname: () => pathname };
      if (name.includes('LoadingScreen')) return { __esModule: true, default: ({ fadeOut }) => React.createElement('div', { 'data-splash': fadeOut ? 'fading' : 'opaque' }) };
      return require(name);
    },
  });
  const render = () => React.act(() => root.render(React.createElement(exports.default, null, React.createElement('main', null, pathname))));
  const splash = () => document.querySelector('[data-splash]');
  const tick = ms => React.act(() => {
    const item = [...timers].find(([, timer]) => timer.ms === ms);
    assert.ok(item, `Expected ${ms}ms timer`); timers.delete(item[0]); item[1].fn();
  });
  const click = (name, options = {}) => React.act(() => document.querySelector(name).dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true, ...options })));
  // Simulate a router consuming links without JSDOM trying to perform real navigation.
  document.addEventListener('click', event => event.preventDefault());
  try {
    render(); assert.equal(splash().dataset.splash, 'opaque');
    tick(800); assert.equal(splash().dataset.splash, 'fading'); tick(500); assert.equal(splash(), null);
    click('#external'); assert.equal(splash(), null);
    click('#next', { ctrlKey: true }); assert.equal(splash(), null);
    click('#next');
    assert.equal(splash().dataset.splash, 'opaque'); // Already covered BEFORE changing pathname.
    assert.equal(document.querySelector('main').textContent, '/');
    assert.equal(timers.size, 0); // Slow destination cannot outlast the splash timer.
    pathname = '/canada/story'; dom.window.history.pushState({}, '', pathname); render();
    assert.equal(splash().dataset.splash, 'opaque');
    assert.equal(document.querySelector('main').textContent, pathname);
    tick(800);
    const fadingNode = splash();
    document.querySelector('#next').href = '/usa/another';
    click('#next');
    assert.equal(splash().dataset.splash, 'opaque');
    assert.notEqual(splash(), fadingNode); // Fresh opaque element; no reverse opacity transition.
    assert.equal(timers.size, 0);
    pathname = '/usa/another'; dom.window.history.pushState({}, '', pathname); render();
    tick(800); tick(500); assert.equal(splash(), null);
    React.act(() => { dom.window.history.replaceState({}, '', '/canada/story'); dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate')); });
    assert.equal(splash().dataset.splash, 'opaque');
    React.act(() => root.unmount()); assert.equal(timers.size, 0);
  } finally {
    React.act(() => root.unmount()); dom.window.close();
    if (previous.navigator) Object.defineProperty(global, 'navigator', previous.navigator);
    else delete global.navigator;
    global.window = previous.window; global.document = previous.document; global.IS_REACT_ACT_ENVIRONMENT = previous.act;
  }
});
