'use client';
import React, { useState } from 'react';
import s from './SearchField.module.scss';
import SearchBtnIcon from './SearchBtnIcon/SearchBtnIcon';
import { useRouter } from 'next/navigation';

const SearchField = () => {
	const [searchFieldData, setSearchFieldData] = useState('');
	const router = useRouter();

	const searchHandle = async () => {
		if (searchFieldData.length !== 0) {
			router.push(`wandered-posts/${searchFieldData}`);
			setSearchFieldData('');
		}
	};
	return (
		<div className={s.searchBlock}>
			<input
				type="text"
				name=""
				placeholder="Search article"
				className={s.input}
				value={searchFieldData}
				onChange={(e) => {
					setSearchFieldData(e.target.value);
				}}
			/>
			<div className={s.searchBtn} onClick={searchHandle}>
				<SearchBtnIcon />
			</div>
		</div>
	);
};

export default SearchField;
