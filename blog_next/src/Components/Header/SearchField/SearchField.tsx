'use client';
import s from './SearchField.module.scss';
import React, { useEffect, useState } from 'react';
import SearchBtnIcon from './SearchBtnIcon/SearchBtnIcon';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PagesEnum } from '@/types/enums/pagesEnums';
import { routes } from '@/app/routes';
interface SearchFieldProps {
	inputClass?: string;
	initialValue?: string;
	isPage?: boolean;
}
const SearchField: React.FC<SearchFieldProps> = ({ inputClass = s.searchBlock }) => {
	const searchParams = useSearchParams().get('search');
	const [searchFieldData, setSearchFieldData] = useState<string>(searchParams || '');
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		setSearchFieldData(searchParams || '');
	}, [searchParams]);

	const searchHandle = async () => {
		if (searchFieldData.length !== 0) {
			router.push(`${PagesEnum.SEARCH_DATA_PAGE}?search=${searchFieldData}`);
		}
	};

	const searchPlaceholder = routes.find((item) => item.path === pathname.split('/')[1]);

	return (
		<div className={inputClass}>
			<input
				type="text"
				name=""
				placeholder={searchPlaceholder?.search ? searchPlaceholder?.search : 'Search article'}
				className={s.input}
				value={searchFieldData}
				onChange={(e) => {
					setSearchFieldData(e.target.value);
				}}
				onKeyDown={(e) => e.key === 'Enter' && searchHandle()}
			/>
			<div className={s.searchBtn} onClick={searchHandle}>
				<SearchBtnIcon />
			</div>
		</div>
	);
};

export default SearchField;
