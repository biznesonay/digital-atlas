import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterState } from '@/types';

const initialState: FilterState = {
  search: '',
  infrastructureTypes: [],
  regions: [],
  priorityDirections: [],
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    toggleInfrastructureType: (state, action: PayloadAction<number>) => {
      const index = state.infrastructureTypes.indexOf(action.payload);
      if (index >= 0) {
        state.infrastructureTypes.splice(index, 1);
      } else {
        state.infrastructureTypes.push(action.payload);
      }
    },
    toggleRegion: (state, action: PayloadAction<number>) => {
      const index = state.regions.indexOf(action.payload);
      if (index >= 0) {
        state.regions.splice(index, 1);
      } else {
        state.regions.push(action.payload);
      }
    },
    togglePriorityDirection: (state, action: PayloadAction<number>) => {
      const index = state.priorityDirections.indexOf(action.payload);
      if (index >= 0) {
        state.priorityDirections.splice(index, 1);
      } else {
        state.priorityDirections.push(action.payload);
      }
    },
    resetFilters: () => initialState,
  },
});

export const {
  setSearch,
  toggleInfrastructureType,
  toggleRegion,
  togglePriorityDirection,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;