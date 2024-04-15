import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DataResponse {
	id: number;
}
interface SearchData {
	dataResponse: DataResponse[];
	string: string;
}

const initialState: SearchData = {
	dataResponse: [],
	string: '',
};

const menuSlice = createSlice({
	name: 'searchData',
	initialState,
	reducers: {
		setString: (state, action: PayloadAction<string>) => {
			state.string = action.payload;
		},
	},
});

export const { setString } = menuSlice.actions;
export default menuSlice.reducer;
