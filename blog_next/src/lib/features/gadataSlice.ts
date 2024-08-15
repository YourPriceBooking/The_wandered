import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface PageviewsData {
	[key: string]: string;
}

interface IGaDataSlice {
	pageviews: PageviewsData;
}

const initialState: IGaDataSlice = {
	pageviews: {},
};

export const fetchPageviews = createAsyncThunk('pageviews/fetchPageviews', async () => {
	const response = await axios.get('/api/gadata');

	return response.data.pageviewsData;
});

const gaDataSlice = createSlice({
	name: 'gaData',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchPageviews.fulfilled, (state, action) => {
				action.payload.forEach(({ url, pageviews }: { url: string; pageviews: string }) => {
					state.pageviews[url] = pageviews;
				});
			})
			.addCase(fetchPageviews.rejected, (state) => {
				state.pageviews = {};
			});
	},
});

export const {} = gaDataSlice.actions;
export default gaDataSlice.reducer;
