'use client';
import { PagesEnum } from '@/types/enums/pagesEnums';
import s from './Header.module.scss';
import Logo from './Logo/Logo';
import SearchField from './SearchField/SearchField';
import { useParams, usePathname } from 'next/navigation';
import TopSection from '../TopSection/TopSection';
import Loading from '@/app/loading';
import { Suspense } from 'react';
import BackArrow from '../TopSection/BackArrow/BackArrow';
export default function Header() {
	const pathname = usePathname();
	const isPostPage = Object.keys(useParams())[0] === 'postPageId';
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
