const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const load = require('./helpers/load-ts.cjs');

function setup() {
  const dom = new JSDOM('<body><hotfx-shy-header><a href="/">Home</a></hotfx-shy-header><main></main></body>', { pretendToBeVisual: true });
  const { window } = dom;
  const { document } = window;
  Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2400 });
  Object.defineProperty(document.documentElement, 'clientHeight', { value: 800 });
  let id = 0;
  const frames = new Map();
  load('src/lib/hotfx-shy-header.ts', {
    window, document, customElements: window.customElements, HTMLElement: window.HTMLElement,
    requestAnimationFrame: fn => { frames.set(++id, fn); return id; },
    cancelAnimationFrame: key => frames.delete(key),
  });
  const header = document.querySelector('hotfx-shy-header');
  const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()); };
  const scroll = (y, render = true) => {
    window.scrollY = y;
    window.dispatchEvent(new window.Event('scroll'));
    if (render) flush();
  };
  return { dom, window, document, header, frames, flush, scroll };
}

test('native scroll hides down, reveals up, and returns visible at the top without Lenis', () => {
  const env = setup();
  try {
    const { header, scroll, window } = env;
    assert.equal(window.lenis, undefined);
    scroll(290); assert.equal(header.classList.contains('hidden'), false);
    scroll(340); assert.equal(header.classList.contains('hidden'), true);
    scroll(335); assert.equal(header.classList.contains('hidden'), true);
    scroll(328); assert.equal(header.classList.contains('hidden'), false);
    scroll(345); assert.equal(header.classList.contains('hidden'), true);
    scroll(0); assert.equal(header.classList.contains('hidden'), false);
  } finally { env.dom.window.close(); }
});

test('small direction changes do not flicker; cumulative deliberate scrolling reveals', () => {
  const env = setup();
  try {
    env.scroll(600);
    for (const y of [598, 601, 599, 602]) env.scroll(y);
    assert.equal(env.header.classList.contains('hidden'), true);
    for (const y of [598, 594, 590]) env.scroll(y);
    assert.equal(env.header.classList.contains('hidden'), false);
  } finally { env.dom.window.close(); }
});

test('elastic overscroll at document boundaries does not toggle the header', () => {
  const env = setup();
  try {
    env.scroll(1600); env.scroll(1650); env.scroll(1600);
    assert.equal(env.header.classList.contains('hidden'), true);
    env.scroll(1588); assert.equal(env.header.classList.contains('hidden'), false);
    env.scroll(-40); env.scroll(0);
    assert.equal(env.header.classList.contains('hidden'), false);
  } finally { env.dom.window.close(); }
});

test('keyboard focus and navigation reset reveal a hidden header', () => {
  const env = setup();
  try {
    env.scroll(500);
    const link = env.header.querySelector('a');
    // JSDOM has no keyboard/pointer modality engine; model browser :focus-visible.
    link.matches = selector => selector === ':focus-visible';
    link.focus();
    assert.equal(env.header.classList.contains('hidden'), false);
    env.scroll(700);
    assert.equal(env.header.classList.contains('hidden'), false);
    link.blur(); env.scroll(800);
    assert.equal(env.header.classList.contains('hidden'), true);
    env.header.dispatchEvent(new env.window.Event('shy-header-reset'));
    assert.equal(env.header.classList.contains('hidden'), false);
  } finally { env.dom.window.close(); }
});

test('scroll events coalesce into one frame; disconnect cancels work and reconnects cleanly', () => {
  const env = setup();
  try {
    env.scroll(400, false); env.scroll(500, false);
    assert.equal(env.frames.size, 1);
    env.header.remove();
    assert.equal(env.frames.size, 0);
    env.scroll(600, false);
    assert.equal(env.frames.size, 0);
    env.document.body.prepend(env.header);
    env.scroll(800);
    assert.equal(env.header.classList.contains('hidden'), true);
    assert.equal(env.frames.size, 0);
  } finally { env.dom.window.close(); }
});

test('pointer focus does not keep the header pinned during subsequent scrolling', () => {
  const env = setup();
  try {
    const link = env.header.querySelector('a');
    link.matches = () => false;
    link.focus();
    env.scroll(500);
    assert.equal(env.header.classList.contains('hidden'), true);
  } finally { env.dom.window.close(); }
});
