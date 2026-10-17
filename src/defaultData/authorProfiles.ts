// Public profiles from the existing author API; fallback if that API is unavailable.
export interface DirectoryAuthor {
  _id: string;
  name: string;
  image: string;
  description: string;
  links: unknown;
}

export const fallbackAuthors: DirectoryAuthor[] = [
  {
    "_id": "66aa1ed114cefdb240cf70ca",
    "name": "Viacheslav Nikitenko",
    "image": "http://res.cloudinary.com/your-price-booking/image/upload/v1722425041/Blog-YPB-Author/oinlirg6ien8fljusnio.png",
    "description": "Traveler, editor-in-chief of the blog The Wandered,  entrepreneur, co-founder and CEO of the Your Price Booking.",
    "links": [
      "[{\"tiktok\":\"\"},{\"instagram\":\"\"},{\"youtube\":\"\"},{\"xsolid\":\"https://x.com/mnogobitka\"},{\"linkedin\":\"https://www.linkedin.com/in/viacheslav-nikitenko-1161aa193/\"},{\"pinterest\":\"\"},{\"facebook\":\"\"}]"
    ]
  },
  {
    "_id": "693f2b9a6afb2c045cce5f48",
    "name": "Andy Ray",
    "image": "https://res.cloudinary.com/your-price-booking/image/upload/v1765745379/Blog-YPB-Author/jvoc59e0qmkrwgv26lfz.jpg",
    "description": "The author of the Uncharted Planet section is an architect and artist, a traveler and researcher, and a proponent of alternative history. Combining professional architectural insight with visual thinking and field observations, he explores ancient civilizations, enigmatic structures, and traces of knowledge that do not fit into widely accepted historical narratives.",
    "links": [
      {
        "xsolid": "https://x.com/X44JOJkiloVtSHV"
      }
    ]
  }
];

export function directoryAuthors(value: unknown): DirectoryAuthor[] {
  if (!Array.isArray(value)) return fallbackAuthors;
  const valid = value.filter((author) => author && typeof author.name === 'string' && author.name.trim());
  if (!valid.length) return fallbackAuthors;
  return valid.map((author) => {
    const fallback = fallbackAuthors.find((item) => item._id === author._id || item.name === author.name);
    return {
      _id: String(author._id || author.name),
      name: author.name,
      image: typeof author.image === 'string' && author.image ? author.image : fallback?.image || '',
      description: typeof author.description === 'string' && author.description ? author.description : fallback?.description || '',
      links: author.links ?? fallback?.links ?? [],
    };
  });
}

export function safeProfileUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;
    url.protocol = 'https:';
    return url.href;
  } catch { return undefined; }
}

const platforms: Record<string, string> = {
  xsolid: 'X', twitter: 'X', x: 'X', linkedin: 'LinkedIn', instagram: 'Instagram',
  facebook: 'Facebook', youtube: 'YouTube', tiktok: 'TikTok', pinterest: 'Pinterest',
};

export function authorSocialLinks(raw: unknown): { label: string; url: string }[] {
  const links: { label: string; url: string }[] = [];
  const visit = (value: unknown, depth: number) => {
    if (depth > 6) return;
    if (typeof value === 'string') {
      try { visit(JSON.parse(value), depth + 1); } catch { /* Invalid legacy JSON has no links. */ }
    } else if (Array.isArray(value)) {
      value.forEach((entry) => visit(entry, depth + 1));
    } else if (value && typeof value === 'object') {
      Object.entries(value).forEach(([platform, target]) => {
        const url = safeProfileUrl(target);
        const label = platforms[platform.toLowerCase()];
        if (url && label && !links.some((link) => link.url === url)) links.push({ label, url });
      });
    }
  };
  visit(raw, 0);
  return links;
}
