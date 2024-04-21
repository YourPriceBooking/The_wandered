'use client';
import { PagesEnum } from '@/types/enums/pagesEnums';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import SearchBtnIcon from './SearchBtnIcon/SearchBtnIcon';
import s from './SearchField.module.scss';
interface SearchFieldProps {
	inputClass?: string;
	initialValue?: string;
	isPage?: boolean;
}
const SearchField: React.FC<SearchFieldProps> = ({ inputClass = s.searchBlock }) => {
	const searchParams = useSearchParams().get('search');
	const [searchFieldData, setSearchFieldData] = useState<string>(searchParams || '');
	const router = useRouter();

	useEffect(() => {
		setSearchFieldData(searchParams || '');
	}, [searchParams]);

	const searchHandle = async () => {
		if (searchFieldData.length !== 0) {
			router.push(`${PagesEnum.SEARCH_DATA_PAGE}?search=${searchFieldData}`);
		}
	};
	return (
		<div className={inputClass}>
			<input
				type="text"
				name=""
				placeholder="Search article"
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
