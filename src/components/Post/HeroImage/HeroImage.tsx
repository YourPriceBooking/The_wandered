import React from 'react';
import Image from 'next/image';
import styles from './HeroImage.module.scss';
import { editorialCopy } from '@/defaultData/editorialCopy';

export interface HeroImageData {
  image: {
    src: string;
    alt: string;
    focus?: 'center' | 'top' | 'bottom';
  };
  caption: {
    text: string | null;
    subtitle?: string;
    credit?: string;
  };
}

interface HeroImageProps {
  data: HeroImageData;
  language?: 'en' | 'uk' | 'pl';
}

const HeroImage: React.FC<HeroImageProps> = ({ data, language = 'en' }) => {
  const { image, caption } = data;

  return (
    <figure className={styles.heroContainer}>
      <button type="button" className={styles.imageWrapper} data-article-image={image.src} aria-label={editorialCopy[language].zoom}>
        <span className={styles.imageInner}>
          <Image
            src={image.src}
            alt={image.alt}
            width={2400}
            height={1350}
            priority
            sizes="(max-width: 600px) calc(100vw - 32px), (max-width: 1088px) calc(100vw - 48px), 1040px"
            className={styles.heroImage}
            style={{
              objectFit: 'cover',
              objectPosition: image.focus,
            }}
          />
        </span>
      </button>

      {(caption.text || caption.subtitle || caption.credit) && <figcaption className={styles.captionWrapper}>
        <div className={styles.caption}>
          <p className={styles.title}>{caption.text}</p>
          <p className={styles.subtitle}>{caption.subtitle}</p>
          {caption.credit && <span className={styles.credit}>{caption.credit}</span>}
        </div>
      </figcaption>}
    </figure>
  );
};

export default HeroImage;
