'use client';
import { usePathname } from 'next/navigation';

import React from 'react';

const Page = () => {
	const pathname = usePathname().split('/')[2];
	console.log(pathname);
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
				{pathname}
			</p>
		</div>
	);
};

export default Page;
