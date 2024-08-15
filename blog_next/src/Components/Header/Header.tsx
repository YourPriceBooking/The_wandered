'use client';
import s from './Header.module.scss';

import Logo from './Logo/Logo';
import BackArrow from '../TopSection/BackArrow/BackArrow';
import Loading from '@/app/loading';
import TopSection from '../TopSection/TopSection';
import SearchField from './SearchField/SearchField';

import { Suspense } from 'react';
import { useParams, usePathname } from 'next/navigation';

import { PagesEnum } from '@/types/enums/pagesEnums';

export default function Header() {
	const pathname = usePathname();

	const isPostPage = Object.keys(useParams())[0] === 'postPageLink';
	if (pathname.split('/')[1] === PagesEnum.SEARCH_DATA_PAGE)
		return <TopSection isLink={true} isSearchField={true} isWhite={true} />;

	return (
		<header className={s.header}>
			{isPostPage && <BackArrow />}
			<div
				style={{
					justifyContent: isPostPage ? 'center' : 'space-between',
				}}
				className={s.headerContent}
			>
				<Logo />
				{!isPostPage && (
					<Suspense fallback={<Loading />}>
						<SearchField />
					</Suspense>
				)}
			</div>
		</header>
	);
}
