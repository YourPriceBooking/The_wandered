import type { ReactNode } from 'react';
import Image from 'next/image';
import s from './../Article.module.scss';

interface ArticleLinkContentProps {
  priority?: boolean;
  isSuggested?: boolean;
  featured?: boolean;
  href?: string;
  title: string;
  imageSrc: string;
  description: string;
  id: string;
  heading: string;
  country?: string;
  children?: ReactNode;
}

const sections: Record<string, string> = {
  home: 'Travel stories',
  ukraine: 'Україна',
  poland: 'Polska',
  usa: 'USA',
  canada: 'Canada',
  australia: 'Australia',
  singapore: 'Singapore',
  'uncharted-planet': 'Uncharted planet',
};

export default function ArticleLinkContent({
  href,
  title,
  imageSrc,
  description,
  heading,
  country = 'home',
  priority = false,
  isSuggested = false,
  featured = false,
  children,
}: ArticleLinkContentProps) {
  const copy =
    country === 'ukraine' ? 'ЧИТАТИ ДАЛІ' : country === 'poland' ? 'CZYTAJ WIĘCEJ' : 'READ MORE';
  const Heading = isSuggested ? 'h3' : 'h2';
  const image = imageSrc ? (
    <Image
      src={imageSrc}
      alt={heading || title}
      className={s.image}
      fill
      sizes={
        isSuggested
          ? '(max-width: 700px) calc(100vw - 32px), (max-width: 1088px) calc((100vw - 72px) / 2), 508px'
          : featured
          ? '(max-width: 640px) calc(100vw - 32px), (max-width: 900px) calc(100vw - 48px), 570px'
          : '(max-width: 640px) calc(100vw - 32px), (max-width: 808px) calc(100vw - 48px), 760px'
      }
      priority={priority}
    />
  ) : (
    <div className={s.defaultImage} aria-hidden="true" />
  );
  return (
    <>
      <div className={s.titleBlock}>
        <span className={s.category}>{sections[country] || sections.home}</span>
        <Heading className={s.title}>
          {href ? <a href={href}>{heading || title}</a> : heading || title}
        </Heading>
        {description?.trim() && <p className={s.description}>{description}</p>}
      </div>
      {href ? (
        <a href={href} className={s.imageBlock} aria-label={heading || title}>
          {image}
        </a>
      ) : (
        <div className={s.imageBlock}>{image}</div>
      )}
      {children}
      {href && (
        <a href={href} className={s.readMore} aria-label={`${copy}: ${heading || title}`}>
          <span className={s.link}>{copy}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
            />
          </svg>
        </a>
      )}
    </>
  );
}
