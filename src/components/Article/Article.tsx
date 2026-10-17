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
	country,
}: ArticleProps) {
  const href = canonicalArticleUrl(articleUrl || (slug ? `${siteUrl}/${slug}` : ''), country || 'home');
	return (
		<UiSuspense fallback={<ArticleSkeleton />}>
			<article className={`${s.articleBlock} ${isSuggested ? s.suggested : ''}`}>
				<ArticleHeader
					author={author}
					date={date}
					updated={updated}
					slug={slug || ''}
					country={country}
				/>
				<ArticleLinkContent
					href={href}
					title={title}
					heading={heading}
					imageSrc={imageSrc}
					description={description}
					id={id}
					country={country}
				/>
			</article>
		</UiSuspense>
	);
}

export default Article;
