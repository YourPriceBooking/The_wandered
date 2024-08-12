'use client';

import { configureStore } from '@reduxjs/toolkit';
import testSlice from './features/search/testSlice';
import gaDataSlice from './features/gadataSlice';

export const store = () => {
	return configureStore({
		reducer: {
			test: testSlice,
			gaData: gaDataSlice,
		},
	});
};

export type AppStore = ReturnType<typeof store>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
