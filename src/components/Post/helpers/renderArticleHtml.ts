import { JSDOM } from 'jsdom';
import DOMPurify from 'isomorphic-dompurify';
import { normalizeImageUrl, type ImageUrlInput } from '@/utils/normalizeImageUrl';

const sanitizeOptions = { ADD_ATTR: ['target', 'allowfullscreen', 'frameborder'], ADD_TAGS: ['iframe'] };

export function renderArticleHtml(markup: string, imageUrls: ImageUrlInput[]): string {
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
    document.querySelectorAll('h1,h2,h3,h4,h5,h6,img,iframe,blockquote').forEach((element) => {
      // Do not insert a block paragraph inside an editor paragraph around an image.
      const target = element.closest('p') || element;
      const previous = target.previousElementSibling;
      if (!previous || previous.tagName !== 'P' || previous.innerHTML !== '<br>') {
        const space = document.createElement('p');
        space.innerHTML = '<br>';
        target.before(space);
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
