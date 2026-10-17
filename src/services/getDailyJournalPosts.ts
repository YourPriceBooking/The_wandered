import { readSnapshot, writeSnapshot, type Snapshot } from '@/services/seo/persistentCache';
import type { JournalPostType } from '@/types/historyTypes';
import { JOURNAL_PAGE_SIZE } from '@/utils/pagination';

const TTL = 60 * 60 * 1000;
const SOURCE_LIMIT = 100_000;
let current: Snapshot<JournalPostType[]> | undefined;
let retryAfter = 0;
let pending: Promise<Snapshot<JournalPostType[]>> | undefined;
function isArchive(value: unknown): value is JournalPostType[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => item && typeof item._id === 'string' && typeof item.title === 'string' && typeof item.url === 'string' && typeof item.description === 'string' && typeof item.linkOnPhoto === 'string');
}
export async function getJournalArchive(): Promise<Snapshot<JournalPostType[]>> {
  if (!current) current = await readSnapshot('journal', isArchive);
  if (current && (Date.now() - Date.parse(current.generatedAt) < TTL || Date.now() < retryAfter)) return current;
  if (pending) return pending;
  pending = (async () => {
    try {
      // Legacy API paginates FOUR collections independently, returns all records
      // for out-of-range pages and exposes no total. Fetch all four from page 1 and paginate once
      // on this server. Never use an arbitrary huge page as an "all records" API.
      const response = await fetch(`https://www.yourpricebooking.com/api/acsess-to-admin/get-titles-and-description?page=1&limit=${SOURCE_LIMIT}`, { cache: 'no-store', signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`Journal HTTP ${response.status}`);
      const payload = await response.json();
      if (!isArchive(payload?.result) || payload.result.length >= SOURCE_LIMIT) throw new Error('Incomplete journal archive');
      const ids = new Set<string>();
      const records = payload.result.map((item: JournalPostType) => {
        if (ids.has(item._id) || !/^[a-f\d]{24}$/i.test(item._id)) throw new Error('Invalid/duplicate journal identifier');
        ids.add(item._id);
        return { _id: item._id, title: item.title, description: item.description, url: item.url, linkOnPhoto: item.linkOnPhoto };
      });
      // ObjectIds give a stable creation order across the four source collections.
      records.sort((a: JournalPostType, b: JournalPostType) => b._id.localeCompare(a._id));
      const snapshot: Snapshot<JournalPostType[]> = { version: 1, generatedAt: new Date().toISOString(), data: records };
      await writeSnapshot('journal', snapshot).catch((error) => console.error('[seo-journal] disk cache write failed', error));
      current = snapshot;
    } catch (error) {
      retryAfter = Date.now() + 60_000;
      console.error('[seo-journal] refresh failed; keeping last complete snapshot', error);
      if (!current) throw error;
    }
    return current!;
  })().finally(() => { pending = undefined; });
  return pending;
}
export async function getDailyJournalPosts(page = 1, limit = JOURNAL_PAGE_SIZE) {
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 || limit > JOURNAL_PAGE_SIZE) throw new Error('Invalid journal pagination');
  const snapshot = await getJournalArchive();
  // Both journal routes have English UI/metadata. The legacy response mixes
  // four languages; its published URLs explicitly identify the language.
  const english = snapshot.data.filter((post) => {
    try { const url = new URL(post.url); return /-en$/.test(url.pathname) || url.pathname.startsWith('/en/'); } catch { return false; }
  });
  if (!english.length) throw new Error('Journal archive has no English records');
  const start = (page - 1) * limit;
  return { result: english.slice(start, start + limit), total: english.length, totalPages: Math.ceil(english.length / limit), sourceTotal: snapshot.data.length, generatedAt: snapshot.generatedAt };
}
