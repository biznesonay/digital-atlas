import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ObjectFilters } from '@/types';
import { RootState } from '../index';

interface FiltersState extends ObjectFilters {
  isActive: boolean;
}

const initialState: FiltersState = {
  search: '',
  infrastructureTypeIds: [],
  priorityDirectionIds: [],
  regionId: undefined,
  isPublished: undefined,
  hasCoordinates: undefined,
  isActive: false,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.isActive = true;
    },
    setInfrastructureTypes: (state, action: PayloadAction<number[]>) => {
      state.infrastructureTypeIds = action.payload;
      state.isActive = true;
    },
    setPriorityDirections: (state, action: PayloadAction<number[]>) => {
      state.priorityDirectionIds = action.payload;
      state.isActive = true;
    },
    setRegion: (state, action: PayloadAction<number | undefined>) => {
      state.regionId = action.payload;
      state.isActive = true;
    },
    setPublished: (state, action: PayloadAction<boolean | undefined>) => {
      state.isPublished = action.payload;
      state.isActive = action.payload !== undefined;
    },
    setHasCoordinates: (state, action: PayloadAction<boolean | undefined>) => {
      state.hasCoordinates = action.payload;
      state.isActive = action.payload !== undefined;
    },
    resetFilters: () => initialState,
  },
});

// Actions
export const {
  setSearch,
  setInfrastructureTypes,
  setPriorityDirections,
  setRegion,
  setPublished,
  setHasCoordinates,
  resetFilters,
} = filtersSlice.actions;

// Selectors
export const selectFilters = (state: RootState): ObjectFilters => ({
  search: state.filters.search,
  infrastructureTypeIds: state.filters.infrastructureTypeIds,
  priorityDirectionIds: state.filters.priorityDirectionIds,
  regionId: state.filters.regionId,
  isPublished: state.filters.isPublished,
  hasCoordinates: state.filters.hasCoordinates,
});

export const selectIsFiltersActive = (state: RootState) => state.filters.isActive;
export const selectActiveFiltersCount = (state: RootState) => {
  let count = 0;
  if (state.filters.search) count++;
  if (state.filters.infrastructureTypeIds?.length) count++;
  if (state.filters.priorityDirectionIds?.length) count++;
  if (state.filters.regionId) count++;
  if (state.filters.isPublished !== undefined) count++;
  if (state.filters.hasCoordinates !== undefined) count++;
  return count;
};

export default filtersSlice.reducer;
