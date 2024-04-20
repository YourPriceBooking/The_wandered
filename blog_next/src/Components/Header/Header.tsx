'use client';
import { PagesEnum } from '@/types/enums/pagesEnums';
import s from './Header.module.scss';
import Logo from './Logo/Logo';
import SearchField from './SearchField/SearchField';
import { useParams, usePathname } from 'next/navigation';
import TopSection from '../TopSection/TopSection';
import Loading from '@/app/loading';
import { Suspense } from 'react';
export default function Header() {
	const pathname = usePathname();
	if (pathname.split('/')[1] === PagesEnum.SEARCH_DATA_PAGE)
		return <TopSection isLink={true} isSearchField={true} isWhite={true} />;

	return (
		<header className={s.header}>
			<div className={s.headerContent}>
				<Logo />
				<Suspense fallback={<Loading />}>
					<SearchField />
				</Suspense>
			</div>
		</header>
	);
}
