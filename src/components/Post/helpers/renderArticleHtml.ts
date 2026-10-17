import { JSDOM } from 'jsdom';
import DOMPurify from 'isomorphic-dompurify';
import { normalizeImageUrl, type ImageUrlInput } from '@/utils/normalizeImageUrl';

const sanitizeOptions = { ADD_ATTR: ['target', 'allowfullscreen', 'frameborder'], ADD_TAGS: ['iframe'] };

export function renderArticleHtml(markup: string, imageUrls: ImageUrlInput[]): string {
  const dom = new JSDOM(DOMPurify.sanitize(markup, sanitizeOptions));
  try {
    const document: Document = dom.window.document;
    const images = normalizeImageUrl(imageUrls);
    document.querySelectorAll('[style]').forEach((element) => element.removeAttribute('style'));
    document.querySelectorAll('h1,h2,h3,h4,h5,h6,img,iframe,blockquote').forEach((element) => {
      const previous = element.previousElementSibling;
      if (!previous || previous.tagName !== 'P' || previous.innerHTML !== '<br>') {
        const space = document.createElement('p');
        space.innerHTML = '<br>';
        element.before(space);
      }
    });
    document.querySelectorAll('blockquote').forEach((element) => {
      const text = element.innerHTML;
      const dash = text.lastIndexOf('—');
      if (dash !== -1) element.innerHTML = `${text.slice(0, dash).trim()} — <span class="author">${text.slice(dash + 1).trim()}</span>`;
    });
    document.querySelectorAll('img').forEach((image, index) => {
      const replacement = images[index + 1];
      if (replacement?.url) {
        image.setAttribute('src', replacement.url);
        if (replacement.context.alt) image.setAttribute('alt', replacement.context.alt);
        if (replacement.context.caption) {
          const caption = document.createElement('p');
          caption.className = 'image-caption';
          caption.textContent = replacement.context.caption;
          image.after(caption);
        }
      } else if (image.getAttribute('src')?.includes('imgUrlByIdx')) image.removeAttribute('src');
    });
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const rel = new Set<string>((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      rel.add('noreferrer');
      link.setAttribute('rel', Array.from(rel).join(' '));
    });
    return DOMPurify.sanitize(document.body.innerHTML, sanitizeOptions);
  } finally {
    dom.window.close();
  }
}
