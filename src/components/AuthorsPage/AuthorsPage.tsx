import { editorialCopy } from '@/defaultData/editorialCopy';
import Image from 'next/image';
import { getAuthors } from '@/services/getAuthors';
import { authorSocialLinks, directoryAuthors, safeProfileUrl } from '@/defaultData/authorProfiles';
import { authorsCopy, type AuthorsLanguage } from '@/defaultData/authorsCopy';
import s from './AuthorsPage.module.scss';
import { authorsStructuredData, localizedAuthorBio, serializeStructuredData } from '@/defaultData/authorsSeo';
export { authorsMetadata } from '@/defaultData/authorsSeo';

export default async function AuthorsPage({ language = 'en' }: { language?: AuthorsLanguage }) {
  const copy = authorsCopy[language];
  const editorial = editorialCopy[language];
  const authors = directoryAuthors(await getAuthors());

  return (
    <main className={s.page} lang={language}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(authorsStructuredData(authors, language)) }} />
      <header className={s.hero}>
        <div className={s.shell}>
          <p className={s.eyebrow}>The Wandered</p>
          <h1>{copy.title}</h1>
          <p className={s.intro}>{copy.intro}</p>
        </div>
      </header>
      <div className={s.shell}>
        <section className={s.directory} aria-label={copy.count}>
          <p className={s.count}>{copy.count}: {authors.length}</p>
          <div className={s.feed}>
            {authors.map((author) => {
              const isEditor = author.name === 'Viacheslav Nikitenko';
              const isAndy = author.name === 'Andy Ray';
              const role = isEditor ? copy.editorRole : isAndy ? copy.andyRole : '';
              const bio = localizedAuthorBio(author, language);
              const links = authorSocialLinks(author.links);
              return (
                <article key={author._id} className={s.card} aria-labelledby={`author-${encodeURIComponent(author._id)}`}>
                  <div className={s.person}>
                    <Image className={s.avatar} src={safeProfileUrl(author.image) || '/no-photo.webp'} alt={author.name} width={88} height={88} />
                    <div>
                      <h2 id={`author-${encodeURIComponent(author._id)}`}>{author.name}</h2>
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
        </section>
        <div className={s.notes}>
          <aside aria-labelledby="behind-the-stories">
            <h2 id="behind-the-stories">{copy.about}</h2>
            <p>{copy.aboutText}</p>
          </aside>
          <section className={s.editorial} aria-labelledby="editorial-information">
            <h2 id="editorial-information">{editorial.title}</h2>
            <p>{editorial.publisher} <a href="https://www.yourpricebooking.com/en/about-company" target="_blank" rel="noopener noreferrer">Your Price Booking OÜ <span aria-hidden="true">↗</span></a></p>
            <p>{editorial.dates} {editorial.sources}</p>
            <p>{editorial.contact} <a href="https://www.yourpricebooking.com/support" target="_blank" rel="noopener noreferrer">{editorial.help} <span aria-hidden="true">↗</span></a></p>
          </section>
        </div>
      </div>
    </main>
  );
}
