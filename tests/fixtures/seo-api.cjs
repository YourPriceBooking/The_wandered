// Transport fixtures only for tests. No production feature flag or external network dependency.
require('./article-api.cjs');
const http = require('node:http');
const https = require('node:https');
const originalRequest = http.request;
const backend = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ result: [], total: 21 }));
});
backend.listen(0, '127.0.0.1'); backend.unref();
for (const transport of [http, https]) {
  const original = transport.request;
  transport.request = function(options, ...args) {
    const value = typeof options === 'object' ? `${options.hostname || options.host || ''}${options.path || options.pathname || ''}` : String(options);
    if (/\/blog\/api\/(post\/(get-all|search-query)|author\/get-all-authors)/.test(value)) {
      return originalRequest.call(http, { ...options, protocol: 'http:', hostname: '127.0.0.1', host: '127.0.0.1', port: backend.address().port, path: '/', agent: undefined }, ...args);
    }
    return original.call(this, options, ...args);
  };
}
const originalFetch = global.fetch;
global.fetch = (input, options) => {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (url.hostname === 'www.yourpricebooking.com' && url.pathname === '/api/acsess-to-admin/get-titles-and-description') {
    return Promise.resolve(new Response(JSON.stringify({ result: [], total: 21 }), { headers: { 'content-type': 'application/json' } }));
  }
  return originalFetch(input, options);
};
