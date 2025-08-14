import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { InfrastructureObject } from '@/types';
import axios from 'axios';

interface ObjectsState {
  items: InfrastructureObject[];
  selectedObject: InfrastructureObject | null;
  loading: boolean;
  error: string | null;
}

const initialState: ObjectsState = {
  items: [],
  selectedObject: null,
  loading: false,
  error: null,
};

// Async thunk для загрузки объектов
export const fetchObjects = createAsyncThunk(
  'objects/fetchAll',
  async (params: { lang: string }) => {
    const response = await axios.get('/api/objects', { params });
    return response.data.data;
  }
);

const objectsSlice = createSlice({
  name: 'objects',
  initialState,
  reducers: {
    selectObject: (state, action: PayloadAction<number>) => {
      state.selectedObject = state.items.find(obj => obj.id === action.payload) || null;
    },
    clearSelectedObject: (state) => {
      state.selectedObject = null;
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

export const { selectObject, clearSelectedObject } = objectsSlice.actions;
export default objectsSlice.reducer;