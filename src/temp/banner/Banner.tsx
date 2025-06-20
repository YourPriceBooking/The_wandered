import React from 'react';
import style from './Banner.module.scss';
import Link from 'next/link';
import Image from 'next/image';

const Banner: React.FC = () => {
	return (
		<Link href="https://www.yourpricebooking.com" target="blank" className={style.banner}>
			<ul className={`${style.banner__body} ${style.shine}`}>
				<li className={style.banner__content}>
					<div className={style.banner__content_bg}>
						<h3 className={style.banner__title}>Your Price</h3>
						<h3 className={style.banner__sub_title}>Booking</h3>
					</div>
				</li>
				<li className={style.banner__img}>
					<Image
						fill
						objectFit="cover"
						src="/banner-img.png"
						alt="Banner image Your Price Booking"
						style={{ objectFit: 'cover' }}
						sizes="100vw"
						priority
					/>
				</li>
			</ul>
		</Link>
	);
};

export default Banner;
