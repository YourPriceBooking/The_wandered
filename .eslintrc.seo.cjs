module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parserOptions: { ecmaVersion: 2022, sourceType: 'script' },
  extends: ['eslint:recommended'],
  globals: { fetch: 'readonly', Headers: 'readonly', Response: 'readonly', AbortSignal: 'readonly' },
};
