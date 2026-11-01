import { canonicalArticleUrl, siteUrl } from '@/utils/articleUrl';

import s from './Article.module.scss';
import UiSuspense from '@/components/ui/UiSuspense';
import ArticleSkeleton from './Skeletons/ArticleSkeleton';
import ArticleHeader from './ArticleHeader/ArticleHeader';
import ArticleLinkContent from './ArticleLinkContent/ArticleLinkContent';

interface ArticleProps {
  slug: string | undefined;
  articleUrl?: string;
  title: string;
  imageSrc: string;
  author: string;
  date: string;
  updated: string;
  description: string;
  id: string;
  heading: string;
  isSuggested?: boolean;
  priority?: boolean;
  featured?: boolean;
  country?: string;
}

function Article({
  slug,
  articleUrl,
  title,
  imageSrc,
  author,
  date,
  updated,
  description,
  id,
  heading,
  isSuggested,
  priority = false,
  featured = false,
  country,
}: ArticleProps) {
  const href = canonicalArticleUrl(
    articleUrl || (slug ? `${siteUrl}/${slug}` : ''),
    country || 'home',
  );
  return (
    <UiSuspense fallback={<ArticleSkeleton />}>
      <article
        className={`${s.articleBlock} ${isSuggested ? s.suggested : ''} ${
          featured ? s.featured : ''
        }`}
      >
        <ArticleLinkContent
          href={href}
          priority={priority}
          featured={featured}
          isSuggested={isSuggested}
          title={title}
          heading={heading}
          imageSrc={imageSrc}
          description={description}
          id={id}
          country={country}
        >
          <ArticleHeader
            isCard
            author={author}
            date={date}
            updated={updated}
            viewPath={href ? new URL(href).pathname : undefined}
            country={country}
          />
        </ArticleLinkContent>
      </article>
    </UiSuspense>
  );
}

export default Article;
