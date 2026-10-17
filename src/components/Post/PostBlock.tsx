import HouseIcon from '../../../public/HouseIcon';
import style from './PostBlock.module.scss';
import SuggestedArticles from '../SuggestedArticles/SuggestedArticles';
import type { postData, PostPageProps } from '@/types/postTypes';
import { getReadableDate } from '@/services/getReadableDate';
import PageViewes from '../PageViewes';
import { normalizeImageUrl } from '@/utils/normalizeImageUrl';
import HeroImage from './HeroImage/HeroImage';
import PostAuthor from './PostAuthor';
import { renderArticleHtml } from './helpers/renderArticleHtml';

export default function PostBlock({ data, country, postPageLink }: PostPageProps & { data: postData }) {
  const hero = normalizeImageUrl(data.imageUrl)[0];
  const validDate = data.publicationDate && !Number.isNaN(Date.parse(data.publicationDate));
  return (
    <>
      <div className={style.imageWrapper}>
        <div className={style.post__img}>
          {hero?.url ? (
            <HeroImage data={{
              image: { src: hero.url, alt: hero.context.alt || data.heading, focus: 'center' },
              caption: { text: hero.context.caption },
            }} />
          ) : <div className={style.post__img_bg}><HouseIcon color="white" /></div>}
        </div>
      </div>
      <div className={style.post__content}>
        <h1 className={style.post__title}>{data.heading}</h1>
        {validDate && <div className={style.post__date_public}>
          <time dateTime={new Date(data.publicationDate).toISOString()}>{getReadableDate(data.publicationDate, country)}</time>
        </div>}
        <div className={style.viewCounter}>
          <PageViewes country={country} postPageLink={postPageLink} />
          <img src="/eye.png" alt="views icon" />
        </div>
        <PostAuthor name={data.author} />
        <div className={`${style.post__markup} ql-editor`} dangerouslySetInnerHTML={{ __html: renderArticleHtml(data.markup, data.imageUrl) }} />
      </div>
      <SuggestedArticles data={{ _id: data._id }} country={country} />
    </>
  );
}
