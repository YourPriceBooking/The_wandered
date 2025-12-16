import { postData } from "@/types/postTypes";

export const getSuggestedArticles = (post: postData, allPosts: postData[]) => {
    if (!post || allPosts.length === 0) return [];

    const articleIndex = allPosts.findIndex((item) => item._id === post._id);
    if (articleIndex === -1) return [];

    const suggestions = new Set<postData>();
    [-7, 7, -8, 8, -12, 12, -13, 13].forEach(offset => {
      const index = articleIndex + offset;
      if (index >= 0 && index < allPosts.length) suggestions.add(allPosts[index]);
    });

    return Array.from(suggestions).slice(0, 4);
 };