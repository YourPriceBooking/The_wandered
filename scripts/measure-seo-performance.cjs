// Reproducible initial-HTML/resource inventory against a production build.
// Fixtures remove backend/network noise. This is not a browser/CWV benchmark.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const { spawn, execFileSync } = require('node:child_process');
const { gzipSync } = require('node:zlib');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'wandered-performance-'));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function main() {
  const socket = net.createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const base = `http://127.0.0.1:${port}`;
  const log = fs.openSync(path.join(temp, 'server.log'), 'w');
  const child = spawn(process.execPath, ['--require', './tests/fixtures/seo-api.cjs', './node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: root, stdio: ['ignore', log, log],
    env: { ...process.env, SEO_CACHE_DIRECTORY: path.join(temp, 'cache'), SEO_FIXTURE_LOG: path.join(temp, 'upstream.log') },
  });
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try { if ((await fetch(base + '/robots.txt', { signal: AbortSignal.timeout(1000) })).ok) { ready = true; break; } } catch {}
      if (child.exitCode !== null) break;
      await delay(100);
    }
    if (!ready) throw Error('Production server did not start: ' + fs.readFileSync(path.join(temp, 'server.log'), 'utf8'));
    const pages = [];
    for (const route of ['/', '/usa', '/usa/fixture-known', '/travel-resources']) {
      const response = await fetch(base + route, { signal: AbortSignal.timeout(60000) });
      if (response.status !== 200) throw Error(`${route}: HTTP ${response.status}`);
      const html = await response.text();
      const dom = new JSDOM(html); const d = dom.window.document;
      const assets = async urls => {
        const unique = [...new Set(urls)]; let bytes = 0, gzipBytes = 0; const bodies = [];
        for (const url of unique) {
          const result = await fetch(new URL(url, base));
          if (!result.ok) throw Error(`Asset ${url}: HTTP ${result.status}`);
          const body = Buffer.from(await result.arrayBuffer());
          bytes += body.length; gzipBytes += gzipSync(body).length; bodies.push(body.toString());
        }
        return { count: unique.length, bytes, gzipBytes, bodies };
      };
      const css = await assets([...d.querySelectorAll('link[rel="stylesheet"]')].map(n => n.getAttribute('href')));
      const js = await assets([...d.querySelectorAll('script[src]')].map(n => n.getAttribute('src')));
      const cssText = css.bodies.join('\n');
      const fontFiles = [...new Set([...cssText.matchAll(/url\([^)]*?([^/()'"\s]+\.(?:ttf|woff2?))['"]?\)/g)].map(m => m[1]))];
      const fonts = fontFiles.map(name => {
        const file = path.join(root, '.next/static/media', name);
        return { file: name, bytes: fs.statSync(file).size };
      });
      const images = [...d.querySelectorAll('main img[data-nimg]')];
      const preloads = [...d.querySelectorAll('link[rel="preload"][as="image"]')];
      pages.push({ route, htmlBytes: Buffer.byteLength(html),
        css: { count: css.count, bytes: css.bytes, gzipBytes: css.gzipBytes, containsQuillEditor: cssText.includes('.ql-editor') },
        js: { count: js.count, bytes: js.bytes, gzipBytes: js.gzipBytes },
        referencedFonts: fonts, // CSS references, not proof a browser downloads every font.
        imagePreloads: preloads.length, mainImages: images.length,
        lazyMainImages: images.filter(n => n.getAttribute('loading') === 'lazy').length,
        mainImageSizes: [...new Set(images.map(n => n.getAttribute('sizes')))],
      });
      dom.window.close();
    }
    const report = { measuredAt: new Date().toISOString(), baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
      workload: 'Production build + fixed local API fixtures; no browser, hydration, image downloads, provider scripts or field CWV. Gzip sizes are computed, not transferred bytes.', pages };
    const output = process.argv[2];
    if (output) { fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n'); console.log(`Saved ${output}`); }
    else console.log(JSON.stringify(report, null, 2));
  } finally {
    const exited = new Promise(resolve => child.once('exit', resolve));
    if (child.exitCode === null) { child.kill('SIGTERM'); await Promise.race([exited, delay(5000)]); if (child.exitCode === null) child.kill('SIGKILL'); }
    fs.closeSync(log);
    fs.rmSync(temp, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
