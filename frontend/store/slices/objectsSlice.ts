import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DigitalObject, ObjectFilters, LanguageCode, PaginationMeta } from '@/types';
import { ObjectsAPI } from '@/lib/api/objects.api';
import { RootState } from '../index';

interface ObjectsState {
  items: DigitalObject[];
  selectedObject: DigitalObject | null;
  loading: boolean;
  error: string | null;
  meta: PaginationMeta | null;
}

const initialState: ObjectsState = {
  items: [],
  selectedObject: null,
  loading: false,
  error: null,
  meta: null,
};

// Async thunks
export const fetchObjects = createAsyncThunk(
  'objects/fetchAll',
  async (params: {
    filters?: ObjectFilters;
    lang?: LanguageCode;
    page?: number;
    limit?: number;
  }) => {
    const response = await ObjectsAPI.getObjects(
      params.filters,
      params.lang,
      params.page,
      params.limit
    );
    return response;
  }
);

export const fetchObjectById = createAsyncThunk(
  'objects/fetchById',
  async (params: { id: number; lang?: LanguageCode }) => {
    const response = await ObjectsAPI.getObjectById(params.id, params.lang);
    return response.data;
  }
);

// Slice
const objectsSlice = createSlice({
  name: 'objects',
  initialState,
  reducers: {
    selectObject: (state, action: PayloadAction<DigitalObject | null>) => {
      state.selectedObject = action.payload;
    },
    clearSelectedObject: (state) => {
      state.selectedObject = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all objects
      .addCase(fetchObjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchObjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.meta = action.payload.meta || null;
      })
      .addCase(fetchObjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch objects';
      })
      // Fetch single object
      .addCase(fetchObjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchObjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedObject = action.payload;
      })
      .addCase(fetchObjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch object';
      });
  },
});

// Actions
export const { selectObject, clearSelectedObject, clearError } = objectsSlice.actions;

// Selectors
export const selectAllObjects = (state: RootState) => state.objects.items;
export const selectObjectsLoading = (state: RootState) => state.objects.loading;
export const selectObjectsError = (state: RootState) => state.objects.error;
export const selectSelectedObject = (state: RootState) => state.objects.selectedObject;
export const selectObjectsMeta = (state: RootState) => state.objects.meta;

export default objectsSlice.reducer;
