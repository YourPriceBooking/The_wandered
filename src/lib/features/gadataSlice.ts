import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { PageviewRow, SectionTotals } from '@/utils/pageviewTotals';

interface IGaDataSlice {
  pageviews: Record<string, number>;
  sectionTotals: SectionTotals;
}
const initialState: IGaDataSlice = { pageviews: {}, sectionTotals: {} };

export const fetchPageviews = createAsyncThunk('pageviews/fetchPageviews', async () => {
  const response = await axios.get<{ pageviewsData: PageviewRow[]; sectionTotals?: SectionTotals; error?: string }>('/api/gadata');
  return response.data;
});

const gaDataSlice = createSlice({
  name: 'gaData',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchPageviews.fulfilled, (state, action) => {
      const { pageviewsData, sectionTotals, error } = action.payload;
      if (error || !Array.isArray(pageviewsData)) return;
      pageviewsData.forEach(({ url, pageviews }) => { state.pageviews[url] = pageviews; });
      state.sectionTotals = sectionTotals || {};
    });
  },
});
export default gaDataSlice.reducer;
