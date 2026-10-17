import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';
import { randomUUID } from 'node:crypto';

export type Snapshot<T> = { version: 1; generatedAt: string; data: T };
// Outside .next: a rebuild must not discard the last complete archive. Configure a
// shared/persistent directory on deployments that replace the whole checkout.
export const cacheDirectory = () => process.env.SEO_CACHE_DIRECTORY || path.join(process.cwd(), '.cache/the-wandered-seo');
export async function readSnapshot<T>(name: string, validate: (value: unknown) => value is T): Promise<Snapshot<T> | undefined> {
  try {
    const value = JSON.parse(gunzipSync(await fs.readFile(path.join(cacheDirectory(), `${name}.json.gz`))).toString('utf8'));
    if (value.version === 1 && typeof value.generatedAt === 'string' && Number.isFinite(Date.parse(value.generatedAt)) && validate(value.data)) return value;
  } catch { /* No valid disk snapshot yet; an upstream failure must remain a 5xx. */ }
}
export async function writeSnapshot<T>(name: string, snapshot: Snapshot<T>): Promise<void> {
  await fs.mkdir(cacheDirectory(), { recursive: true });
  const temporary = path.join(cacheDirectory(), `${name}-${randomUUID()}.tmp`);
  try {
    await fs.writeFile(temporary, gzipSync(JSON.stringify(snapshot)), { flag: 'wx' });
    await fs.rename(temporary, path.join(cacheDirectory(), `${name}.json.gz`));
  } finally { await fs.unlink(temporary).catch(() => undefined); }
}
