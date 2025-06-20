'use client';

import { Suspense, ReactNode } from 'react';

interface UiSuspenseProps {
	fallback?: ReactNode;
	children: ReactNode;
}

const UiSuspense = ({ fallback = null, children }: UiSuspenseProps) => {
	return <Suspense fallback={fallback}>{children}</Suspense>;
};

export default UiSuspense;
