import s from './ArticlePage.module.scss';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import Banner from '../banner/Banner';
import PostBlock from '../Post/PostBlock';
//import { GetServerSideProps } from 'next';



export default function ArticlePage({ country = 'home' }: { country?: string }) {
  return (
    <article className={s.postBlock}>
      <PostBlock country={country} />
      <Banner />
      <ScrollToTop />
    </article>
  )};
