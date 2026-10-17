import s from './SuggestedArticles.module.scss';
import Article from '../Article/Article';
import type { postData } from '@/types/postTypes';
import { getRecommendedArticles } from '@/services/getRecommendedArticles';
import { normalizeImageUrl, getImageUrl } from '@/utils/normalizeImageUrl';

export default async function SuggestedArticles({ data, country }: { data: Pick<postData, '_id'>; country: string }) {
  const articles = await getRecommendedArticles(data._id, country);
  if (!articles.length) return null;
  return <aside className={s.suggestedArticlesWrapper} aria-label={country === 'ukraine' ? 'Інші статті' : country === 'poland' ? 'Inne artykuły' : 'More stories'}>
    {articles.map((article) => <Article
      key={article._id} articleUrl={article.articleUrl} slug={undefined}
      title={article.title} imageSrc={getImageUrl(normalizeImageUrl(article.imageUrl), 0) || ''}
      country={article.country} author={article.author} date={article.publicationDate}
      updated="" description={article.description} id={article._id} heading={article.heading} isSuggested
    />)}
  </aside>;
}
