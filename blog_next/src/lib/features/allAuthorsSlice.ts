import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAuthors } from '@/services/getAuthors';
import { AuthorType } from '@/types/authorTypes';

const initialState = {
	allAuthorsData: [] as AuthorType[],
};

export const fetchAllAuthors = createAsyncThunk('allAuthors/fetchAllAuthors', async () => {
	const authors = await getAuthors();
	return authors as AuthorType[];
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
