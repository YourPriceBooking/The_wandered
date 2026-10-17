import { postData } from "@/types/postTypes";

export const getSuggestedArticles = (post: Pick<postData, '_id'>, allPosts: postData[]) => {
  if (!post || !Array.isArray(allPosts) || allPosts.length === 0) return [];

  const available = allPosts.filter((p) => p && p._id !== post._id);
  if (available.length <= 4) {
    return available;
  }

  const currentIndex = allPosts.findIndex((p) => p && p._id === post._id);

  if (currentIndex < 0) {
    return available.slice(0, 4);
  }

  const remaining: postData[] = [...available];

  const nextAllIdx = (currentIndex + 1) % allPosts.length;
  const nextPost = allPosts[nextAllIdx];

  let pos = Math.max(0, remaining.findIndex((p) => p && nextPost && p._id === nextPost._id));

  const picked: postData[] = [];
  const offsets = [0, 1, 2, 3];

  for (let i = 0; i < offsets.length && remaining.length > 0; i++) {
    if (i === 0) {
      // next pos
    } else {
      pos = (pos + offsets[i]) % remaining.length;
    }

    const chosen = remaining[pos];
    if (!chosen) break;

    picked.push(chosen);

    remaining.splice(pos, 1);

    if (remaining.length === 0) break;

    if (pos >= remaining.length) {
      pos = pos % remaining.length;
    }
  }

  return picked;
 };
