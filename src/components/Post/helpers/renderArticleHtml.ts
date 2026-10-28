import { JSDOM } from 'jsdom';
import DOMPurify from 'isomorphic-dompurify';
import { normalizeImageUrl, type ImageUrlInput } from '@/utils/normalizeImageUrl';

const sanitizeOptions = { ADD_ATTR: ['target', 'allowfullscreen', 'frameborder'], ADD_TAGS: ['iframe'] };

export function renderArticleHtml(markup: string, imageUrls: ImageUrlInput[], language: 'en' | 'uk' | 'pl' = 'en'): string {
  const dom = new JSDOM(DOMPurify.sanitize(markup, sanitizeOptions));
  try {
    const document: Document = dom.window.document;
    const images = normalizeImageUrl(imageUrls);
    // The route supplies the single document H1; editor headings are sections.
    document.querySelectorAll('h1').forEach((heading) => {
      const section = document.createElement('h2');
      for (const attribute of Array.from(heading.attributes)) section.setAttribute(attribute.name, attribute.value);
      section.innerHTML = heading.innerHTML; heading.replaceWith(section);
    });
    document.querySelectorAll('[style]').forEach((element) => element.removeAttribute('style'));
    const headings = Array.from(document.querySelectorAll('h2,h3,h4,h5,h6'));
    const baseLevel = Math.min(6, ...headings.map(heading => Number(heading.tagName.slice(1))));
    if (baseLevel > 2) headings.forEach(heading => {
      const section = document.createElement(`h${Number(heading.tagName.slice(1)) - baseLevel + 2}`);
      for (const attribute of Array.from(heading.attributes)) section.setAttribute(attribute.name, attribute.value);
      section.innerHTML = heading.innerHTML;
      heading.replaceWith(section);
    });
    const emptyParagraph = (element: Element | null): element is Element => Boolean(element?.tagName === 'P' &&
      Array.from(element.childNodes).every(node => node.nodeType === 3 ? !node.textContent?.trim() : node.nodeName === 'BR'));
    document.querySelectorAll('h2,h3,h4,h5,h6,img,figure,iframe,blockquote').forEach(element => {
      const target = element.closest('p') || element;
      while (emptyParagraph(target.previousElementSibling)) target.previousElementSibling!.remove();
      while (emptyParagraph(target.nextElementSibling)) target.nextElementSibling!.remove();
    });
    document.querySelectorAll('blockquote').forEach((element) => {
      const text = element.innerHTML;
      const dash = text.lastIndexOf('—');
      if (dash !== -1) element.innerHTML = `${text.slice(0, dash).trim()} — <span class="author">${text.slice(dash + 1).trim()}</span>`;
    });
    document.querySelectorAll('img').forEach((image, index) => {
      image.setAttribute('loading', 'lazy');
      image.setAttribute('decoding', 'async');
      const replacement = images[index + 1];
      if (replacement?.url) {
        image.setAttribute('src', replacement.url);
        if (replacement.context.alt) image.setAttribute('alt', replacement.context.alt);
        if (replacement.context.caption) {
          const standalone = image.parentElement === document.body || (image.parentElement?.tagName === 'P' && image.parentElement.textContent?.trim() === '' && image.parentElement.children.length === 1);
          const caption = document.createElement(standalone ? 'figcaption' : 'span');
          caption.className = 'image-caption';
          caption.textContent = replacement.context.caption;
          if (standalone) {
            const figure = document.createElement('figure');
            if (image.parentElement?.tagName === 'P') image.parentElement.replaceWith(figure);
            else image.replaceWith(figure);
            figure.append(image, caption);
          } else image.after(caption);
        }
      } else if (image.getAttribute('src')?.includes('imgUrlByIdx')) image.removeAttribute('src');
    });
    document.querySelectorAll('img[src]').forEach(image => {
      if (image.closest('a,button')) return;
      const src = image.getAttribute('src')!.replace(/^http:\/\/res\.cloudinary\.com\//, 'https://res.cloudinary.com/');
      image.setAttribute('src', src);
      if (!src.startsWith('https://') && !src.startsWith('/')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'article-image-button';
      button.setAttribute('data-article-image', src);
      button.setAttribute('aria-label', { en: 'View larger image', uk: 'Переглянути зображення у більшому розмірі', pl: 'Powiększ zdjęcie' }[language]);
      image.replaceWith(button);
      button.append(image);
    });
    document.querySelectorAll('iframe').forEach((frame) => {
      frame.setAttribute('loading', 'lazy');
      if (!frame.getAttribute('title')?.trim()) frame.setAttribute('title', { en: 'Embedded media', uk: 'Вбудовані медіа', pl: 'Osadzone multimedia' }[language]);
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
