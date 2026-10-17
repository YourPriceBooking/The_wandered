const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.join(__dirname, '../..');

module.exports = function loadTs(filename, globals = {}) {
  const fullPath = path.resolve(root, filename);
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(fullPath, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const localRequire = (id) => {
    if (id.startsWith('@/')) return loadTs(`src/${id.slice(2)}.ts`, globals);
    return require(id);
  };
  vm.runInNewContext(source, { exports, require: localRequire, URL, Response, AbortSignal, fetch, console, ...globals }, { filename: fullPath });
  return exports;
};
