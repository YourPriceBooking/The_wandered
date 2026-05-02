'use client';
import React, { useEffect, useRef, useState } from 'react';
import HouseIcon from '../../../public/HouseIcon';
import style from './PostBlock.module.scss';
import Image from 'next/image';
import SuggestedArticles from '../SuggestedArticles/SuggestedArticles';
import { getPostData } from '@/services/getPostData';
import { PostPageProps } from '@/types/postTypes';
import { getReadableDate } from '@/services/getReadableDate';
import { notFound } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import PageViewes from '../PageViewes';
import { dataMarkup } from './helpers/dataMarkup';
import { AuthorType } from '@/types/authorTypes';
import { useAppSelector } from '@/lib/hooks';
import Link from 'next/link';
import { normalizeImageUrl, getImageUrl } from '@/utils/normalizeImageUrl';
import HeroImage, { HeroImageData } from './HeroImage/HeroImage';

function replaceImagesInHtml(
  htmlString: string,
  images: Array<{ url: string; context?: { alt?: string; caption?: string } }>,
) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  const imgTags = doc.querySelectorAll('img');

  imgTags.forEach((img, index) => {
    const imageObj = images[index + 1];
    if (imageObj) {
      img.setAttribute('src', imageObj.url);
      if (imageObj.context?.alt) {
        img.setAttribute('alt', imageObj.context.alt);
      }
      if (imageObj.context?.caption) {
        const captionEl = doc.createElement('p');
        captionEl.textContent = imageObj.context.caption;
        captionEl.className = 'image-caption';
        img.insertAdjacentElement('afterend', captionEl);
      }
    }
  });

  return doc.body.innerHTML;
}

const PostBlock: React.FC<PostPageProps> = ({ country, postPageLink }) => {
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [readableDate, setReadableDate] = useState('');
  const authorRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const allAuthors = useAppSelector((state) => state.allAuthors.allAuthorsData || []);
  const currentAuthor = data?.author
    ? allAuthors.find((author: AuthorType) => author.name === data.author)
    : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        authorRef.current &&
        tooltipRef.current &&
        !authorRef.current.contains(event.target as Node) &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setTooltipVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setTooltipVisible]);

  useEffect(() => {
    const fetchData = async () => {
      if (!country || !postPageLink) {
        return notFound();
      }

      try {
        const post = await getPostData({ pageLink: String(postPageLink), country });
        if (!post) {
          return notFound();
        }

        const processedData = await dataMarkup(post);
        if (!processedData) {
          return notFound();
        }

        setData(processedData);

        if (processedData?.publicationDate) {
          setReadableDate(getReadableDate(processedData.publicationDate, country));
        }
      } catch (error) {
        console.error('Error fetching post data:', error);
        return notFound();
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [country, postPageLink]);

  if (isLoading) {
    return <div className={style.loading}>Loading...</div>;
  }

  if (!data) {
    return null;
  }

  const normalizedImages = normalizeImageUrl(data.imageUrl as any);
  const articleImage = getImageUrl(normalizedImages, 0);
  // const rawLinks = currentAuthor?.links;
  // const links = (Array.isArray(rawLinks) ? rawLinks : []) as any[];
  const rawLinks = currentAuthor?.links;

  let links: any[] = [];

  try {
    if (rawLinks) {
      const parsed = JSON.parse(rawLinks);
      if (Array.isArray(parsed)) {
        links = parsed;
      }
    }
  } catch (e) {
    console.error('Invalid JSON in author.links:', rawLinks);
  }

  const {
    context: { alt, caption },
    url,
  } = normalizedImages[0];

  const articleImageData: HeroImageData = {
    image: {
      src: url,
      alt: alt || 'article-image',
      focus: 'center',
    },
    caption: {
      text: caption,
    },
  };

  return (
    <>
      <div className={style.imageWrapper}>
        <div className={style.post__img}>
          {articleImage ? (
            <HeroImage data={articleImageData} />
          ) : (
            <div className={style.post__img_bg}>
              <HouseIcon color="white" />
            </div>
          )}
        </div>
      </div>
      <div className={style.post__content}>
        <h1 className={style.post__title}>{data.heading}</h1>
        <div className={style.post__date_public}>
          <p>{readableDate}</p>
        </div>
        <div className={style.viewCounter}>
          <PageViewes country={country} postPageLink={postPageLink} />
          <img src="/eye.png" alt="views icon" />
        </div>
        <div ref={authorRef} style={{ position: 'relative' }}>
          <p
            className={`${style.post__author} ${tooltipVisible ? style.visible : ''}`}
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
          >
            {data.author}
          </p>

          {currentAuthor && (
            <div
              ref={tooltipRef}
              className={`${style.authorTooltipWrapper} ${tooltipVisible ? style.visible : ''}`}
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
            >
              <div className={style.authorTooltip}>
                <div className={style.tooltipMainInfo}>
                  <img
                    className={style.tooltipMainImg}
                    src={currentAuthor.image}
                    alt="Author Photo"
                    onError={(e) => (e.currentTarget.src = 'no-photo.webp')}
                  />
                  <div>
                    <p className={style.tooltipName}>{currentAuthor.name}</p>
                    <div className={style.tooltipLinks}>
                      {links.map((link: any, index: number): React.ReactNode => {
                        const platform = Object.keys(link)[0] as string;
                        const url = Object.values(link)[0] as string | undefined;

                        if (!url) return null;

                        return (
                          <Link key={index} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={`/social_media_icons/${platform}-logo.svg`} alt={platform} />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <p className={style.tooltipBio}>{currentAuthor.description}</p>
              </div>
            </div>
          )}
        </div>
        <div
          className={`${style.post__markup} ql-editor`}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(replaceImagesInHtml(data.markup, data.imageUrl), {
              ADD_ATTR: ['target', 'allowfullscreen', 'frameborder', 'src'],
              ADD_TAGS: ['iframe'],
            }),
          }}
        />
      </div>
      <SuggestedArticles data={data} country={country} />
    </>
  );
};

export default PostBlock;
