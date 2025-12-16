import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAllPosts, getPostsByCountry } from '@/services/getPosts';
import { postData } from '@/types/postTypes';

const initialState = {
	allPostsData: [] as postData[],
	allPostsHome: [] as postData[],
	allPostsUkraine: [] as postData[],
	allPostsPoland: [] as postData[],
	allPostsUSA: [] as postData[],
	allPostsCanada: [] as postData[],
};

export const fetchAllPosts = createAsyncThunk('allPosts/fetchAllPosts', async () => {
	const posts = await getAllPosts();
	return posts;
});

export const fetchPostsByCountry = createAsyncThunk(
	'allPosts/fetchPostsByCountry',
	async (country: string) => {
		const posts = await getPostsByCountry({ country });
		return { country, posts: posts || [] };
	},
);

const allPostsSlice = createSlice({
	name: 'allPosts',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAllPosts.fulfilled, (state, action: PayloadAction<any>) => {
				state.allPostsData = action.payload;
			})
			.addCase(fetchAllPosts.rejected, (state) => {
				state.allPostsData = [];
			})
			.addCase(
				fetchPostsByCountry.fulfilled,
				(state: any, action: PayloadAction<{ country: string; posts: postData[] }>) => {
					const { country, posts } = action.payload;
					switch (country) {
						case 'home':
							state.allPostsHome = posts;
							break;
						case 'ukraine':
							state.allPostsUkraine = posts;
							break;
						case 'poland':
							state.allPostsPoland = posts;
							break;
						case 'usa':
							state.allPostsUSA = posts;
							break;
						case 'canada':
							state.allPostsCanada = posts;
							break;
						default:
							break;
					}
				},
			)
			.addCase(fetchPostsByCountry.rejected, (state, action: any) => {
				const { country } = action.payload;
				switch (country) {
					case 'home':
						state.allPostsHome = [];
						break;
					case 'ukraine':
						state.allPostsUkraine = [];
						break;
					case 'poland':
						state.allPostsPoland = [];
						break;
					case 'usa':
						state.allPostsUSA = [];
						break;
					case 'canada':
						state.allPostsCanada = [];
						break;
					default:
						break;
				}
			});
	},
});

export const {} = allPostsSlice.actions;
export default allPostsSlice.reducer;
