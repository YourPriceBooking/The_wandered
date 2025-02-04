import s from './ArticlePage.module.scss';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import Banner from '../banner/Banner';
import PostBlock from '../Post/PostBlock';
import { PostPageProps } from '@/types/postTypes';
//import { GetServerSideProps } from 'next';



export default function ArticlePage({ postPageLink, country = 'home' }: PostPageProps) {
  return (
    <article className={s.postBlock}>
      <PostBlock country={country} postPageLink={postPageLink} />
      <Banner />
      <ScrollToTop />
    </article>
  )};
