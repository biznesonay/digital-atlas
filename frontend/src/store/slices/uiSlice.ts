// frontend/src/store/slices/uiSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  selectedObjectId: number | null;
  mapCenter: {
    lat: number;
    lng: number;
  };
  mapZoom: number;
  sidebarOpen: boolean;
  modalOpen: boolean;
}

const initialState: UIState = {
  selectedObjectId: null,
  mapCenter: {
    lat: 48.0196, // Центр Казахстана
    lng: 66.9237,
  },
  mapZoom: 6,
  sidebarOpen: true,
  modalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedObject: (state, action: PayloadAction<number | null>) => {
      state.selectedObjectId = action.payload;
    },
    setMapCenter: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
      state.mapCenter = action.payload;
    },
    setMapZoom: (state, action: PayloadAction<number>) => {
      state.mapZoom = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modalOpen = action.payload;
    },
  },
});

export const {
  setSelectedObject,
  setMapCenter,
  setMapZoom,
  toggleSidebar,
  setSidebarOpen,
  setModalOpen,
} = uiSlice.actions;

export default uiSlice.reducer;