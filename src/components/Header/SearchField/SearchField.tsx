'use client';
import s from './SearchField.module.scss';
import React, { useEffect, useState } from 'react';
import SearchBtnIcon from './SearchBtnIcon/SearchBtnIcon';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PagesEnum } from '@/types/enums/pagesEnums';
import { routes } from '@/app/routes';
interface SearchFieldProps {
	className? : string;
	inputClass?: string;
	initialValue?: string;
	isPage?: boolean;
	onClick? : () => void;
}
const SearchField: React.FC<SearchFieldProps> = ({ inputClass = s.searchBlock, className, onClick }) => {
	const searchParams = useSearchParams();
	const searchQuery = searchParams ? searchParams.get('search') : '';

	const [searchFieldData, setSearchFieldData] = useState<string>(searchQuery || '');
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		setSearchFieldData(searchQuery || '');
	}, [searchParams]);

	const searchHandle = async () => {
		if (searchFieldData.length !== 0) {
			router.push(`${PagesEnum.SEARCH_DATA_PAGE}?search=${searchFieldData}`);
		}
	};

	const searchPlaceholder = routes.find((item) => item.path === pathname.split('/')[1]);

	return (
		<div className={`${inputClass} ${className || ''}`} onClick={onClick}>
			<input
				type="text"
				name="searchField"
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
