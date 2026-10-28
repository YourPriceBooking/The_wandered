export function readingMinutes(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&(?:[a-z]+|#\d+|#x[\da-f]+);/gi, ' ').trim();
  return Math.max(1, Math.ceil((text ? text.split(/\s+/).length : 0) / 220));
}
