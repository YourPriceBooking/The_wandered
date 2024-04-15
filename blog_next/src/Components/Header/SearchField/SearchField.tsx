'use client';
import React, { useState } from 'react';
import s from './SearchField.module.scss';
import SearchBtnIcon from './SearchBtnIcon/SearchBtnIcon';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { setString } from '@/lib/features/search/searchDataSlice';

const SearchField = () => {
	const [searchFieldData, setSearchFieldData] = useState('');
	const router = useRouter();
	const dispatch = useAppDispatch();

	const searchHandle = async () => {
		if (searchFieldData.length !== 0) {
			try {
				const res = await fetch('https://catfact.ninja/fact');
				const data: {
					fact: string;
				} = await res.json();
				if (res.ok) {
					dispatch(setString(data.fact));
					router.push('/wandered-posts');
					setSearchFieldData('');
				}
			} catch (error) {
				console.log(error);
			}
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
