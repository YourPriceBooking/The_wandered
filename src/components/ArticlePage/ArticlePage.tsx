import s from './ArticlePage.module.scss';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import Banner from '../banner/Banner';
import type { PostPageProps, postData } from '@/types/postTypes';
import PostBlock from '../Post/PostBlock';
import GptItiBanner from '../GptItiBanner/GptItiBanner';

export default function ArticlePage({ data, postPageLink, country = 'home' }: PostPageProps & { data: postData }) {
  return (
    <article className={s.postBlock}>
      <PostBlock data={data} country={country} postPageLink={postPageLink} />
      <Banner />
      <GptItiBanner />
      <ScrollToTop />
    </article>
  );
}
