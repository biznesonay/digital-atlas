import { configureStore } from '@reduxjs/toolkit';
import objectsReducer from './slices/objectsSlice';
import filtersReducer from './slices/filtersSlice';
import mapReducer from './slices/mapSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    objects: objectsReducer,
    filters: filtersReducer,
    map: mapReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;