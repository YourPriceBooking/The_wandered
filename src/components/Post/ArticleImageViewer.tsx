'use client';

import { useEffect, useRef, useState } from 'react';
import { editorialCopy } from '@/defaultData/editorialCopy';
import s from './ArticleImageViewer.module.scss';

export default function ArticleImageViewer({ children, language }: { children: React.ReactNode; language: 'en' | 'uk' | 'pl' }) {
  const [image, setImage] = useState<{ src: string; alt: string; caption: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const copy = editorialCopy[language];
  useEffect(() => {
    if (!image || !dialog.current) return;
    const modal = dialog.current;
    modal.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      modal.close();
      document.body.style.overflow = overflow;
      opener.current?.focus({ preventScroll: true });
    };
  }, [image]);
  return <div className={s.mediaRoot} onClick={event => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button[data-article-image]') : null;
    if (!button) return;
    const source = button.dataset.articleImage;
    if (!source) return;
    let url: URL;
    try { url = new URL(source, window.location.origin); } catch { return; }
    if (url.protocol !== 'https:' && url.origin !== window.location.origin) return;
    const figure = button.closest('figure');
    opener.current = button;
    setImage({ src: url.href, alt: button.querySelector('img')?.alt || '', caption: figure?.querySelector('figcaption')?.textContent?.trim() || '' });
  }}>
    {children}
    <dialog ref={dialog} className={s.viewer} aria-label={copy.imageViewer}
      onCancel={() => setImage(null)} onClose={() => { if (!dialog.current?.open) setImage(null); }}
      onClick={event => { if (event.target === event.currentTarget) setImage(null); }}>
      <button type="button" autoFocus className={s.close} aria-label={copy.closeImage} onClick={() => setImage(null)}>×</button>
      {image && <figure><img src={image.src} alt={image.alt} />{image.caption && <figcaption>{image.caption}</figcaption>}</figure>}
    </dialog>
  </div>;
}
