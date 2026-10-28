import 'react-quill/dist/quill.snow.css';
import { articleDate, contentImageUrl } from '@/utils/structuredData';
import { editorialCopy } from '@/defaultData/editorialCopy';
import { languageForCountry } from '@/utils/seoMetadata';
import HouseIcon from '../../../public/HouseIcon';
import style from './PostBlock.module.scss';
import type { postData, PostPageProps } from '@/types/postTypes';
import { getReadableDate } from '@/services/getReadableDate';
import PageViewes from '../PageViewes';
import { normalizeImageUrl } from '@/utils/normalizeImageUrl';
import HeroImage from './HeroImage/HeroImage';
import PostAuthor from './PostAuthor';
import ArticleImageViewer from './ArticleImageViewer';
import { renderArticleHtml } from './helpers/renderArticleHtml';
import { readingMinutes } from './helpers/readingMinutes';

export default function PostBlock({ data, country, postPageLink }: PostPageProps & { data: postData }) {
  const language = languageForCountry(country);
  const hero = normalizeImageUrl(data.imageUrl)[0];
  const published = articleDate(data.publicationDate);
  const modified = articleDate(data.changeDate);
  const publishedText = published ? getReadableDate(data.publicationDate, country) : '';
  const modifiedText = modified ? getReadableDate(data.changeDate, country) : '';
  const showUpdated = modified && (!published || (modified > published && modifiedText !== publishedText));
  const copy = editorialCopy[language];
  const html = renderArticleHtml(data.markup, data.imageUrl, language);
  return (
    <ArticleImageViewer language={language}>
      <header className={style.articleHeader}>
        <h1 className={style.post__title}>{data.heading}</h1>
        <div className={style.metadata}>
          <PostAuthor name={data.author} country={country} />
          <div className={style.metadataDetails}>
            {published && <time dateTime={published}>{publishedText}</time>}
            <span>~{readingMinutes(html)} {copy.reading}</span>
            <div className={style.viewCounter} title={copy.views}>
              <img src="/eye.png" alt="" />
              <PageViewes country={country} postPageLink={postPageLink} />
            </div>
          </div>
        </div>
        {showUpdated && <p className={style.updated}>{copy.updated}: <time dateTime={modified}>{modifiedText}</time></p>}
      </header>
      {hero?.url ? <div className={style.imageWrapper}>
        <HeroImage language={language} data={{
          image: { src: contentImageUrl(hero.url) || hero.url, alt: hero.context.alt || data.heading, focus: 'center' },
          caption: { text: hero.context.caption },
        }} />
      </div> : <div className={style.missingImage} aria-hidden="true"><HouseIcon color="#ff6b19" /></div>}
      <div className={`${style.post__markup} ql-editor`} dangerouslySetInnerHTML={{ __html: html }} />
    </ArticleImageViewer>
  );
}
