import { postData } from "@/types/postTypes";

export const getSuggestedArticles = (post: postData, allPosts: postData[]) => {
  if (!post || !Array.isArray(allPosts) || allPosts.length === 0) return [];

  const available = allPosts.filter((p) => p && p._id !== post._id);
  const postCandidates = Math.min(4, available.length);
  if (postCandidates === 0) return [];

  const withTs = available
    .map((p) => {
      const raw =
        (p as any).publicationDate || (p as any).date || (p as any).updated || '';
      const ts = Date.parse(String(raw)) || 0;
      return { p, ts };
    })
    .sort((a, b) => a.ts - b.ts);

  if (postCandidates < 4) {
    return withTs.map((x) => x.p);
  }

  const n = withTs.length;
  const step = (n - 1) / (postCandidates - 1);
  const indices = Array.from({ length: postCandidates }, (_, i) => Math.round(i * step));

  const used = new Set<number>();
  const fixedIndices: number[] = [];
  for (const idx of indices) {
    let j = Math.min(Math.max(idx, 0), n - 1);
    while (used.has(j) && j < n) j++;
    if (j >= n) {
      j = idx;
      while (used.has(j) && j >= 0) j--;
    }
    if (!used.has(j)) {
      used.add(j);
      fixedIndices.push(j);
    }
  }

  return fixedIndices.slice(0, postCandidates).map((i) => withTs[i].p);
 };