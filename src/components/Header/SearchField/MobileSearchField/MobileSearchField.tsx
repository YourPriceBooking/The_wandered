'use client';
import React, { useEffect, useState } from 'react';
import SearchBtnIcon from '../SearchBtnIcon/SearchBtnIcon';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PagesEnum } from '@/types/enums/pagesEnums';
import { routes } from '@/app/routes';
import s from "./MobileSearchField.module.scss";

interface MobileSearchFieldProps {
	initialValue?: string;
	isPage?: boolean;
	onClose? : () => void;
}


const SearchField: React.FC<MobileSearchFieldProps> = ({ onClose }) => {
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
		<div className={`${s.mobileSearchOverlay}`} onClick={onClose}>
            <div className={s.mobileSearchBox} onClick={(e) => e.stopPropagation()}>
		    	<input
		    		type="text"
		    		name="searchField"
		    		placeholder={searchPlaceholder?.search ? searchPlaceholder?.search : 'Search article'}
		    		className={`${s.mobileSearchField}`}
		    		value={searchFieldData}
		    		onChange={(e) => setSearchFieldData(e.target.value)}
		    		onKeyDown={(e) => e.key === 'Enter' && searchHandle()}
		    	/>
		    	<div className={s.searchBtn} onClick={searchHandle}>
		    		<SearchBtnIcon fill="var(--icon-color)" width={20} height={20} stroke="var(--icon-stroke)"/>
		    	</div>
            </div>
		</div>
	);
};

export default SearchField;
