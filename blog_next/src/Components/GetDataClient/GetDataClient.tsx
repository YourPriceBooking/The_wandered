'use client';
import React, { useEffect } from 'react';

import { useAppDispatch } from '@/lib/hooks';
import { fetchPageviews } from '@/lib/features/gadataSlice';
import { fetchAllAuthors } from '@/lib/features/allAuthorsSlice';
import { fetchAllPosts } from '@/lib/features/allPosts';

export default function GetDataClient() {
	const dispatch = useAppDispatch();

	useEffect(() => {
		// request GA4 data collection once
		dispatch(fetchPageviews());
		// request all authors data collection once
		dispatch(fetchAllAuthors());
		// request all posts data collection
		dispatch(fetchAllPosts());
	}, [dispatch]);

	return <></>;
}
