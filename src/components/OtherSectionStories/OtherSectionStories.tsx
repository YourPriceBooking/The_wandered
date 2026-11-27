import Image from 'next/image';
import { editorialCopy } from '@/defaultData/editorialCopy';
import { getHeaderCopy } from '@/defaultData/headerNavigation';
import { getOtherSectionStories } from '@/services/getOtherSectionStories';
import { languageForCountry } from '@/utils/seoMetadata';
import s from './OtherSectionStories.module.scss';

export default async function OtherSectionStories({ country, articleId }: { country: string; articleId: string }) {
  const stories = await getOtherSectionStories(country, articleId);
  if (!stories.length) return null;

  const labels = getHeaderCopy(country);
  const sectionHeading = editorialCopy[languageForCountry(country)].otherSections;
  return (
    <section className={s.section} aria-labelledby="other-sections-heading">
      <div className={s.inner}>
        <h2 className={s.heading} id="other-sections-heading">{sectionHeading}</h2>
        <ul className={s.list}>
          {stories.map(({ section, href, heading, description, image }, index) => {
            const name = section === 'home' ? labels.home : section === 'uncharted-planet' ? labels.planet : labels.countryNames[section];
            const language = languageForCountry(section);
            const titleId = `other-story-${index}-title`;
            return (
              <li key={href}>
                <a className={s.row} href={href} hrefLang={language} aria-labelledby={`${titleId} ${titleId}-section`}>
                  <div className={s.text}>
                    <span className={s.meta} id={`${titleId}-section`}>
                      {name}<span className={s.language}><span aria-hidden="true"> · </span>{language.toUpperCase()}</span>
                    </span>
                    <h3 className={s.title} id={titleId} lang={language}>{heading}</h3>
                    {description && <p className={s.description} lang={language}>{description}</p>}
                  </div>
                  <Image className={s.photo} src={image} alt="" width={152} height={95}
                    sizes="(max-width: 600px) 80px, 152px" loading="lazy" />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
