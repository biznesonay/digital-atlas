import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MAP_CONFIG } from '@/constants/mapConfig';

interface MapState {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  hoveredObjectId: number | null;
  mapType: 'roadmap' | 'satellite';
  isMapLoaded: boolean;
}

const initialState: MapState = {
  center: MAP_CONFIG.defaultCenter,
  zoom: MAP_CONFIG.defaultZoom,
  hoveredObjectId: null,
  mapType: 'roadmap',
  isMapLoaded: false,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setCenter: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
      state.center = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    setHoveredObject: (state, action: PayloadAction<number | null>) => {
      state.hoveredObjectId = action.payload;
    },
    toggleMapType: (state) => {
      state.mapType = state.mapType === 'roadmap' ? 'satellite' : 'roadmap';
    },
    setMapLoaded: (state, action: PayloadAction<boolean>) => {
      state.isMapLoaded = action.payload;
    },
  },
});

export const {
  setCenter,
  setZoom,
  setHoveredObject,
  toggleMapType,
  setMapLoaded,
} = mapSlice.actions;

export default mapSlice.reducer;