import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { InfrastructureType, Region, PriorityDirection, LanguageCode } from '@/types';
import { ReferencesAPI } from '@/lib/api/references.api';
import { RootState } from '../index';

interface ReferencesState {
  infrastructureTypes: InfrastructureType[];
  regions: Region[];
  priorityDirections: PriorityDirection[];
  loading: boolean;
  error: string | null;
}

const initialState: ReferencesState = {
  infrastructureTypes: [],
  regions: [],
  priorityDirections: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchReferences = createAsyncThunk(
  'references/fetchAll',
  async (lang: LanguageCode = 'ru') => {
    const [types, regions, directions] = await Promise.all([
      ReferencesAPI.getInfrastructureTypes(lang),
      ReferencesAPI.getRegions(lang),
      ReferencesAPI.getPriorityDirections(),
    ]);
    
    return {
      infrastructureTypes: types.data || [],
      regions: regions.data || [],
      priorityDirections: directions.data || [],
    };
  }
);

// Slice
const referencesSlice = createSlice({
  name: 'references',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReferences.fulfilled, (state, action) => {
        state.loading = false;
        state.infrastructureTypes = action.payload.infrastructureTypes;
        state.regions = action.payload.regions;
        state.priorityDirections = action.payload.priorityDirections;
      })
      .addCase(fetchReferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch references';
      });
  },
});

// Selectors
export const selectInfrastructureTypes = (state: RootState) => state.references.infrastructureTypes;
export const selectRegions = (state: RootState) => state.references.regions;
export const selectPriorityDirections = (state: RootState) => state.references.priorityDirections;
export const selectReferencesLoading = (state: RootState) => state.references.loading;

export default referencesSlice.reducer;
