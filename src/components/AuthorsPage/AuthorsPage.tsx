import Image from 'next/image';
import type { Metadata } from 'next';
import { getAuthors } from '@/services/getAuthors';
import { authorSocialLinks, directoryAuthors, safeProfileUrl } from '@/defaultData/authorProfiles';
import { authorsCopy, type AuthorsLanguage } from '@/defaultData/authorsCopy';
import s from './AuthorsPage.module.scss';

export function authorsMetadata(language: AuthorsLanguage): Metadata {
  const copy = authorsCopy[language];
  const paths = { en: '/authors', uk: '/ukraine/authors', pl: '/poland/authors' };
  return {
    title: `${copy.title} | The Wandered`,
    description: copy.meta,
    alternates: {
      canonical: `https://www.thewandered.com${paths[language]}`,
      languages: Object.fromEntries(Object.entries(paths).map(([lang, path]) => [lang, `https://www.thewandered.com${path}`])),
    },
  };
}

export default async function AuthorsPage({ language = 'en' }: { language?: AuthorsLanguage }) {
  const copy = authorsCopy[language];
  const authors = directoryAuthors(await getAuthors());

  return (
    <main className={s.page} lang={language}>
      <div className={s.banner} aria-hidden="true" />
      <section className={s.intro}>
        <div className={s.heading}>
          <div className={s.communityIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M21 20v-2a6 6 0 0 0-4-5.65" /></svg>
          </div>
          <h1>{copy.title}</h1>
        </div>
        <p>{copy.intro}</p>
      </section>
      <div className={s.body}>
        <div className={s.grid}>
          <div className={s.feed}>
            {authors.map((author) => {
              const isEditor = author.name === 'Viacheslav Nikitenko';
              const isAndy = author.name === 'Andy Ray';
              const role = isEditor ? copy.editorRole : isAndy ? copy.andyRole : '';
              const bio = language !== 'en' && isEditor ? copy.editorBio : language !== 'en' && isAndy ? copy.andyBio : author.description;
              const links = authorSocialLinks(author.links);
              return (
                <article key={author._id} className={s.card} aria-labelledby={`author-${author._id}`}>
                  <div className={s.person}>
                    <Image className={s.avatar} src={safeProfileUrl(author.image) || '/no-photo.webp'} alt={author.name} width={70} height={70} />
                    <div>
                      <h2 id={`author-${author._id}`}>{author.name}</h2>
                      {role && <p className={s.role}>{role}</p>}
                      {(isEditor || isAndy) && <span className={s.tag}>{isAndy ? 'Uncharted Planet' : 'The Wandered'}</span>}
                    </div>
                  </div>
                  {bio && <p className={s.bio}>{bio}</p>}
                  {links.length > 0 && (
                    <nav className={s.socials} aria-label={`${copy.socials}: ${author.name}`}>
                      {links.map((link) => (
                        <a key={link.url} className={s.social} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`${link.label} — ${author.name} (${copy.newTab})`}>
                          {link.label}<span aria-hidden="true">↗</span>
                        </a>
                      ))}
                    </nav>
                  )}
                </article>
              );
            })}
          </div>
          <aside className={s.sidebar}>
            <h2>{copy.about}</h2>
            <div><p>{copy.aboutText}</p><p className={s.count}><span aria-hidden="true" />{copy.count}: {authors.length}</p></div>
          </aside>
        </div>
      </div>
    </main>
  );
}
