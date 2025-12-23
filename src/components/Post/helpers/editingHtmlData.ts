import { JSDOM } from 'jsdom';

export const editingHTMLData = (htmlStr: string): string => {
    const { document } = new JSDOM(htmlStr).window;

    const elementsWithStyle: NodeListOf<HTMLElement> = document.querySelectorAll('[style]');
    elementsWithStyle.forEach((element: HTMLElement) => {
        element.removeAttribute('style');
    });

    const elements: NodeListOf<HTMLElement> = document.querySelectorAll('h1, h2, h3, h4, h5, h6, img, iframe, blockquote');
    elements.forEach((element: HTMLElement) => {
        const previousSibling = element.previousElementSibling as HTMLElement | null;
        if (!previousSibling || !(previousSibling.tagName === 'P' && previousSibling.innerHTML === '<br>')) {
            const paragraph = document.createElement('p');
            paragraph.innerHTML = '<br/>';
            element.parentNode?.insertBefore(paragraph, element);
        }
    });

    const blockquotes: NodeListOf<HTMLQuoteElement> = document.querySelectorAll('blockquote');
    blockquotes.forEach((blockquote: HTMLQuoteElement) => {
        const blockquoteText: string = blockquote.innerHTML;

        const lastDashIndex: number = blockquoteText.lastIndexOf('—');
        if (lastDashIndex !== -1) {
            const quoteText: string = blockquoteText.substring(0, lastDashIndex);
            const authorText: string = blockquoteText.substring(lastDashIndex + 1).trim();

            blockquote.innerHTML = `${quoteText} — <span class="author">${authorText}</span>`;
        }
    });

    return document.body.innerHTML;
};
