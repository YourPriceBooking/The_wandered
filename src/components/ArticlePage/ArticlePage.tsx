import s from './ArticlePage.module.scss';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import Banner from '../banner/Banner';
import type { PostPageProps, postData } from '@/types/postTypes';
import PostBlock from '../Post/PostBlock';
import GptItiBanner from '../GptItiBanner/GptItiBanner';
import SuggestedArticles from '../SuggestedArticles/SuggestedArticles';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import StructuredData from '@/components/StructuredData/StructuredData';
import { articleBreadcrumbs, articleStructuredData, breadcrumbStructuredData } from '@/utils/structuredData';
import { languageForCountry } from '@/utils/seoMetadata';
import { editorialCopy } from '@/defaultData/editorialCopy';

export default function ArticlePage({ data, postPageLink, country = 'home' }: PostPageProps & { data: postData }) {
  const language = languageForCountry(country);
  const crumbs = articleBreadcrumbs(data.heading, country, postPageLink);
  return (
    <main className={s.postBlock}>
      <article className={s.articleContent}>
        <StructuredData value={articleStructuredData(data, country, postPageLink)} />
        <StructuredData value={breadcrumbStructuredData(crumbs)} />
        <Breadcrumbs items={crumbs} language={language} />
        <PostBlock data={data} country={country} postPageLink={postPageLink} />
      </article>
      <SuggestedArticles data={{ _id: data._id }} country={country} />
      <aside className={s.promotions} aria-label={editorialCopy[language].promotion}>
        <p className={s.disclosure}>{editorialCopy[language].promotion}</p>
        <Banner />
        <GptItiBanner />
      </aside>
      <ScrollToTop />
    </main>
  );
}
