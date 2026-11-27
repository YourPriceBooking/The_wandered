import Article from '@/components/Article/Article';
import type { postData } from '@/types/postTypes';
import { getImageUrl, normalizeImageUrl } from '@/utils/normalizeImageUrl';

export default function ArchiveCard({ post, section, featured = false, priority = false }: {
  post: postData; section: string; featured?: boolean; priority?: boolean;
}) {
  const country = section === 'home' ? post.country : section;
  const slug = post.articleUrl.split('/').pop();
  return (
    <Article
      id={post._id}
      country={country}
      articleUrl={post.articleUrl}
      slug={section === 'home' ? slug : `${section}/${slug}`}
      title={post.title}
      heading={post.heading}
      author={post.author}
      date={post.publicationDate}
      updated=""
      description={post.description}
      imageSrc={getImageUrl(normalizeImageUrl(post.imageUrl)) || ''}
      featured={featured}
      priority={priority}
    />
  );
}
