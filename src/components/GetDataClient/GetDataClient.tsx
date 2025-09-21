'use client';
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useAppDispatch } from '@/lib/hooks';
import { fetchPageviews } from '@/lib/features/gadataSlice';
import { fetchAllAuthors } from '@/lib/features/allAuthorsSlice';
import { fetchPostsByCountry } from '@/lib/features/allPosts';
import { getCurrentLocation } from '@/utils/location';

export default function GetDataClient() {
	const dispatch = useAppDispatch();
	const pathname = usePathname();

	useEffect(() => {
		// request GA4 data collection once
		dispatch(fetchPageviews());
		// request all authors data collection once
		dispatch(fetchAllAuthors());

		const currentLocation = getCurrentLocation(pathname);
		dispatch(fetchPostsByCountry(currentLocation));
	}, [dispatch, pathname]);

	return <></>;
}
