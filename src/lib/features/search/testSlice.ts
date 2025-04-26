import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface testData {}

const initialState = {};

const testSlice = createSlice({
	name: 'test',
	initialState,
	reducers: {},
});

export const {} = testSlice.actions;
export default testSlice.reducer;
