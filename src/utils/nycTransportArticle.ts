// The legacy key is retained by Blog-Api; this one article has a different public URL.
export const nycTransportArticleId = '6b01affee75e067d28578ed4';
export const nycTransportOldSlug = 'public-transport-in-new-york-city-a-2023-travelq-guide';
export const nycTransportNewSlug = 'public-transport-in-new-york-city-2027';
export const nycTransportOldPath = `/usa/${nycTransportOldSlug}`;
export const nycTransportNewPath = `/usa/${nycTransportNewSlug}`;
const origin = 'https://www.thewandered.com';
export const nycTransportOldUrl = origin + nycTransportOldPath;
export const nycTransportNewUrl = origin + nycTransportNewPath;
export const nycTransportHeading = 'Public Transport in New York City: 2027 Guide';

export function isRetiredNycTransportPath(pathname: string) {
  try { return decodeURIComponent(pathname).replace(/\/$/, '') === nycTransportOldPath; }
  catch { return false; }
}

export function presentNycTransportArticle<T extends { _id: string; articleUrl: string; heading?: string }>(post: T): T {
  if (post._id !== nycTransportArticleId || post.articleUrl !== nycTransportOldUrl) return post;
  return { ...post, articleUrl: nycTransportNewUrl, heading: nycTransportHeading };
}
