// frontend/src/store/slices/objectsSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { objectsAPI } from '@/services/api';
import type { MapObject, ObjectFilter } from '@/types';

interface ObjectsState {
  items: MapObject[];
  loading: boolean;
  error: string | null;
}

const initialState: ObjectsState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunk для загрузки объектов
export const fetchObjects = createAsyncThunk(
  'objects/fetchObjects',
  async (filters?: ObjectFilter) => {
    const response = await objectsAPI.getObjects(filters);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch objects');
    }
    return response.data;
  }
);

const objectsSlice = createSlice({
  name: 'objects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchObjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchObjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchObjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch objects';
      });
  },
});

export const { clearError } = objectsSlice.actions;
export default objectsSlice.reducer;