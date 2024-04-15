// import { configureStore } from '@reduxjs/toolkit';
// import searchDataSlice from './features/search/searchDataSlice';

// export const makeStore = () => {
// 	return configureStore({
// 		reducer: {
// 			searchData: searchDataSlice,
// 		},
// 	});
// };

// export type AppStore = ReturnType<typeof makeStore>;
// export type RootState = ReturnType<AppStore['getState']>;
// export type AppDispatch = AppStore['dispatch'];

'use client';

import { configureStore } from '@reduxjs/toolkit';
import searchDataSlice from './features/search/searchDataSlice';

export const store = configureStore({
	reducer: {
		searchData: searchDataSlice,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
