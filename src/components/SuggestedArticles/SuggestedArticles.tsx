'use client';
import s from './SuggestedArticles.module.scss';
import Article from '../Article/Article';
import React, { useState, useEffect } from 'react';
import { postData } from '@/types/postTypes';
import { getSuggestedArticles } from '@/services/getSuggestedArticles';
import { useAppSelector } from '@/lib/hooks';
import { normalizeImageUrl, getImageUrl } from '@/utils/normalizeImageUrl';

function SuggestedArticles({ data, country }: { data: Pick<postData, '_id'>; country: string }) {
    const allPosts = useAppSelector((state: any) =>
        state.allPosts[`allPosts${country.charAt(0).toUpperCase() + country.slice(1)}`] || []
    );
    const suggestedArticles = data ? getSuggestedArticles(data, allPosts) : [];

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 462);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    function truncateString(str: string) {
        const maxLength = isMobile ? 30 : 45;

        if (str.length <= maxLength) {
            return str;
        }

        const words = str.split(' ');
        let truncatedStr = '';

        for (let i = 0; i < words.length; i++) {
            if ((truncatedStr + words[i]).length + 3 > maxLength) {
                break;
            }

            truncatedStr += (truncatedStr ? ' ' : '') + words[i];
        }

        return truncatedStr.length > 15 && truncatedStr.length < maxLength
            ? truncatedStr + '...'
            : str;
    }
    return (
        <aside className={s.suggestedArticlesWrapper}>
            {suggestedArticles.map((article: postData) => {
                const fullSlug =
                    article.country === 'home'
                        ? article.articleUrl.split('/').pop()
                        : `${article.country}/${article.articleUrl.split('/').pop()}`;
                const normalizedImages = normalizeImageUrl(article.imageUrl as any);
                const imageSrc = getImageUrl(normalizedImages, 0) || '';

                return (
                    <Article
                        key={article._id}
                        slug={fullSlug}
                        title={article.title}
                        imageSrc={imageSrc}
                        country={article.country}
                        author={article.author}
                        date={article.publicationDate}
                        updated={''}
                        description={article.description}
                        id={article._id}
                        heading={truncateString(article.heading)}
                        isSuggested={true}
                    ></Article>
                );
            })}
        </aside>
    );
}

export default SuggestedArticles;
