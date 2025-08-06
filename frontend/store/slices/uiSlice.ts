import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LanguageCode } from '@/types';
import { RootState } from '../index';

interface UIState {
  language: LanguageCode;
  isDarkMode: boolean;
  isObjectsListOpen: boolean;
  isFiltersOpen: boolean;
  mapZoom: number;
  mapCenter: { lat: number; lng: number };
}

const initialState: UIState = {
  language: 'ru',
  isDarkMode: false,
  isObjectsListOpen: false,
  isFiltersOpen: true,
  mapZoom: 6,
  mapCenter: { lat: 48.0196, lng: 66.9237 }, // Центр Казахстана
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.language = action.payload;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setObjectsListOpen: (state, action: PayloadAction<boolean>) => {
      state.isObjectsListOpen = action.payload;
    },
    toggleObjectsList: (state) => {
      state.isObjectsListOpen = !state.isObjectsListOpen;
    },
    setFiltersOpen: (state, action: PayloadAction<boolean>) => {
      state.isFiltersOpen = action.payload;
    },
    toggleFilters: (state) => {
      state.isFiltersOpen = !state.isFiltersOpen;
    },
    setMapView: (state, action: PayloadAction<{ zoom: number; center: { lat: number; lng: number } }>) => {
      state.mapZoom = action.payload.zoom;
      state.mapCenter = action.payload.center;
    },
  },
});

// Actions
export const {
  setLanguage,
  toggleDarkMode,
  setObjectsListOpen,
  toggleObjectsList,
  setFiltersOpen,
  toggleFilters,
  setMapView,
} = uiSlice.actions;

// Selectors
export const selectLanguage = (state: RootState) => state.ui.language;
export const selectIsDarkMode = (state: RootState) => state.ui.isDarkMode;
export const selectIsObjectsListOpen = (state: RootState) => state.ui.isObjectsListOpen;
export const selectIsFiltersOpen = (state: RootState) => state.ui.isFiltersOpen;
export const selectMapView = (state: RootState) => ({
  zoom: state.ui.mapZoom,
  center: state.ui.mapCenter,
});

export default uiSlice.reducer;
