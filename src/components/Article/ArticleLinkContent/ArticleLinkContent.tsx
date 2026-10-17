import s from './../Article.module.scss';
import Image from 'next/image';

interface ArticleLinkContentProps {
  priority?: boolean; isSuggested?: boolean; href?: string; title: string; imageSrc: string; description: string; id: string; heading: string; country?: string;
}
export default function ArticleLinkContent({ href, title, imageSrc, description, heading, country, priority = false, isSuggested = false }: ArticleLinkContentProps) {
  const copy = country === 'ukraine' ? 'ЧИТАТИ ДАЛІ' : country === 'poland' ? 'CZYTAJ WIĘCEJ' : 'READ MORE';
  const content = <>
    <div className={s.hoverBlock}><p className={s.hoverTitle}>{title}</p><p>{description}</p></div>
    <div className={s.line} />
    {imageSrc ? <Image src={imageSrc} alt={heading || title} className={s.image} fill sizes={isSuggested ? "(max-width: 462px) 330px, (max-width: 768px) 400px, 490px" : "(max-width: 768px) 98vw, (max-width: 940px) 758px, 800px"} priority={priority} /> : <div className={s.defaultImage} />}
  </>;
  return <>
    {href ? <a href={href} className={s.imageBlock} aria-label={heading || title}>{content}</a> : <div className={s.imageBlock}>{content}</div>}
    <div className={s.titleBlock}><h2 className={s.title}>{href ? <a href={href}>{heading || title}</a> : heading || title}</h2></div>
    {href && <a href={href} className={s.readMore} aria-label={`${copy}: ${heading || title}`}>
      <p className={s.link}>{copy}</p>
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 16 16" aria-hidden="true"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" /></svg>
    </a>}
  </>;
}
