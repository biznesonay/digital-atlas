// frontend/src/store/slices/filtersSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FiltersState {
  search: string;
  infrastructureTypeId: number | null;
  regionId: number | null;
  priorityDirections: number[];
}

const initialState: FiltersState = {
  search: '',
  infrastructureTypeId: null,
  regionId: null,
  priorityDirections: [],
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setInfrastructureType: (state, action: PayloadAction<number | null>) => {
      state.infrastructureTypeId = action.payload;
    },
    setRegion: (state, action: PayloadAction<number | null>) => {
      state.regionId = action.payload;
    },
    setPriorityDirections: (state, action: PayloadAction<number[]>) => {
      state.priorityDirections = action.payload;
    },
    togglePriorityDirection: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const index = state.priorityDirections.indexOf(id);
      if (index === -1) {
        state.priorityDirections.push(id);
      } else {
        state.priorityDirections.splice(index, 1);
      }
    },
    clearFilters: (state) => {
      return initialState;
    },
  },
});

export const {
  setSearch,
  setInfrastructureType,
  setRegion,
  setPriorityDirections,
  togglePriorityDirection,
  clearFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;