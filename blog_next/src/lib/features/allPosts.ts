import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAllPosts } from '@/services/getPosts';
import { postData } from '@/types/postTypes';

const initialState = {
	allPostsData: [] as postData[],
};

export const fetchAllPosts = createAsyncThunk('allPosts/fetchAllPosts', async () => {
	const posts = await getAllPosts();
	return posts;
});

const allPostsSlice = createSlice({
	name: 'allPosts',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAllPosts.fulfilled, (state, action: PayloadAction<any>) => {
				state.allPostsData = action.payload.result;
			})
			.addCase(fetchAllPosts.rejected, (state) => {
				state.allPostsData = [];
			});
	},
});

export const {} = allPostsSlice.actions;
export default allPostsSlice.reducer;
