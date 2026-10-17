import React from 'react';
import Image from 'next/image';
import styles from './HeroImage.module.scss';

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
}

const HeroImage: React.FC<HeroImageProps> = ({ data }) => {
  const { image, caption } = data;

  return (
    <figure className={styles.heroContainer}>
      <div className={styles.imageWrapper}>
        <div className={styles.imageInner}>
          <Image
            src={image.src}
            alt={image.alt}
            width={2400}
            height={1350}
            priority
            sizes="(max-width: 320px) calc(100vw - 30px), (max-width: 768px) calc(100vw - 50px), (max-width: 1080px) 66vw, 714px"
            className={styles.heroImage}
            style={{
              objectFit: 'cover',
              objectPosition: image.focus,
            }}
          />
          <div className={styles.overlay} />
        </div>
      </div>

      <figcaption className={styles.captionWrapper}>
        <div className={styles.caption}>
          <p className={styles.title}>{caption.text}</p>
          <p className={styles.subtitle}>{caption.subtitle}</p>
          {caption.credit && <span className={styles.credit}>{caption.credit}</span>}
        </div>
      </figcaption>
    </figure>
  );
};

export default HeroImage;
