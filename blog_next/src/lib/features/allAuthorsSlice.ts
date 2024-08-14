import { AuthorType } from '@/types/authorTypes';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
	allAuthorsData: [] as AuthorType[],
};

export const fetchAllAuthors = createAsyncThunk('allAuthors/fetchAllAuthors', async () => {
	const response = await axios.get(
		'https://ypbooking.chost.com.ua/blog/api/author/get-all-authors',
	);

	const allAuthors: AuthorType[] = response.data.result;

	return allAuthors as AuthorType[];
});

const allAuthorsSlice = createSlice({
	name: 'allAuthors',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAllAuthors.fulfilled, (state, action: PayloadAction<AuthorType[]>) => {
				state.allAuthorsData = action.payload;
			})
			.addCase(fetchAllAuthors.rejected, (state) => {
				state.allAuthorsData = [];
			});
	},
});

export const {} = allAuthorsSlice.actions;
export default allAuthorsSlice.reducer;
