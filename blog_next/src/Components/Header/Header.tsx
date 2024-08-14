'use client';
import { PagesEnum } from '@/types/enums/pagesEnums';
import s from './Header.module.scss';
import Logo from './Logo/Logo';
import SearchField from './SearchField/SearchField';
import { useParams, usePathname } from 'next/navigation';
import TopSection from '../TopSection/TopSection';
import Loading from '@/app/loading';
import { Suspense, useEffect } from 'react';
import BackArrow from '../TopSection/BackArrow/BackArrow';
import { useAppDispatch } from '@/lib/hooks';
import { fetchPageviews } from '@/lib/features/gadataSlice';
import { fetchAllAuthors } from '@/lib/features/allAuthorsSlice';

export default function Header() {
	const pathname = usePathname();
	const isPostPage = Object.keys(useParams())[0] === 'postPageLink';
	if (pathname.split('/')[1] === PagesEnum.SEARCH_DATA_PAGE)
		return <TopSection isLink={true} isSearchField={true} isWhite={true} />;

	const dispatch = useAppDispatch();

	useEffect(() => {
		// request GA4 data collection once
		dispatch(fetchPageviews());
		// request all authors array data collection once
		dispatch(fetchAllAuthors());
	}, [dispatch]);

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
