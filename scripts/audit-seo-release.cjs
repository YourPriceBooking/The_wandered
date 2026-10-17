const fs = require('node:fs');
const path = require('node:path');
const { runAudit } = require('./lib/seo-release-audit.cjs');
const snapshot = require('../src/defaultData/sitemapSnapshot.json');

async function main() {
  const output = process.env.SEO_AUDIT_OUTPUT || 'seo-release-report.json';
  const report = await runAudit({ maxPages: Number(process.env.SEO_AUDIT_MAX_PAGES || 0), expectedMinUrls: snapshot.data.entries.length + 15 });
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(`${report.mode} audit: ${report.coverage.checked}/${report.coverage.discovered} pages, ${report.issues.length} issues; ${output}`);
  process.exitCode = report.passed ? 0 : 1;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
