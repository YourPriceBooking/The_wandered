// Rebuild the checked-in fallback from the SAME collector as production.
// Usage: npm run seo:refresh-sitemap. Needs public API access; fails atomically.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.join(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(id, parent, ...args) {
  if (id.startsWith('@/')) id = path.join(root, 'src', id.slice(2));
  return resolve.call(this, id, parent, ...args);
};
require.extensions['.ts'] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } });
  module._compile(output.outputText, filename);
};
(async () => {
  const { collectArticleInventory } = require('../src/services/seo/articleArchive.ts');
  const data = await collectArticleInventory();
  const snapshot = { version: 1, generatedAt: new Date().toISOString(), data };
  const filename = path.join(root, 'src/defaultData/sitemapSnapshot.json');
  fs.writeFileSync(filename + '.tmp', JSON.stringify(snapshot, null, 2) + '\n');
  fs.renameSync(filename + '.tmp', filename);
  console.log(JSON.stringify({ totals: data.totals, included: data.entries.length, excluded: data.excluded, generatedAt: snapshot.generatedAt }, null, 2));
})().catch((error) => { console.error(error); process.exitCode = 1; });
