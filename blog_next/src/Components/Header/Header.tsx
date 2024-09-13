'use client';
import s from './Header.module.scss';

import Logo from './Logo/Logo';
import BackArrow from '../TopSection/BackArrow/BackArrow';
import Loading from '@/app/loading';
import TopSection from '../TopSection/TopSection';
import SearchField from './SearchField/SearchField';

import { Suspense, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';

import { PagesEnum } from '@/types/enums/pagesEnums';
import Link from 'next/link';

const routes = ['home', 'urkaine', 'poland', 'USA', 'canada'];

export default function Header() {
	const pathname = usePathname();
	const [activeLinkIndex, setActiveLinkIndex] = useState(0);

	const isPostPage = Object.keys(useParams())[0] === 'postPageLink';
	if (pathname.split('/')[1] === PagesEnum.SEARCH_DATA_PAGE)
		return <TopSection isLink={true} isSearchField={true} isWhite={true} />;

	return (
		<header className={`${s.header} ${isPostPage ? s.postPage : ''}`}>
			{isPostPage && <BackArrow />}
			<div
				style={{
					justifyContent: isPostPage ? 'center' : 'space-between',
				}}
				className={s.headerContent}
			>
				<Logo />
				{!isPostPage && (
					<nav className={s.navMenu}>
						{routes.map((item: string, index: number) => {
							return (
								<div
									key={index}
									onClick={() => setActiveLinkIndex(index)}
									className={`${s.linkContainer} ${
										activeLinkIndex === index ? s.active : ''
									} `}
								>
									<span className={s.linkDot}>•</span>
									<Link className={s.navLink} href={`/`}>
										{item}
									</Link>
								</div>
							);
						})}
					</nav>
				)}
				{!isPostPage && (
					<Suspense fallback={<Loading />}>
						<SearchField />
					</Suspense>
				)}
			</div>
		</header>
	);
}
