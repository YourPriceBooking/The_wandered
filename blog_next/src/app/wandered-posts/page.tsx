'use client';
import { RootState } from '@/lib/store';

import React from 'react';
import { useSelector } from 'react-redux';

const Page = () => {
	const stringg = useSelector((state: RootState) => state.searchData.string);
	return (
		<div
			style={{
				height: '100vh',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				marginTop: '100px',
			}}
		>
			<p
				style={{
					width: '75%',
				}}
			>
				{' '}
				{stringg}
			</p>
		</div>
	);
};

export default Page;
