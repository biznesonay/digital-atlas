import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LanguageCode } from '@/types';

interface UIState {
  isListModalOpen: boolean;
  isFilterPanelExpanded: boolean;
  isLegendCollapsed: boolean;
  language: LanguageCode;
  isLoading: boolean;
}

const initialState: UIState = {
  isListModalOpen: false,
  isFilterPanelExpanded: true,
  isLegendCollapsed: false,
  language: 'ru',
  isLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleListModal: (state) => {
      state.isListModalOpen = !state.isListModalOpen;
    },
    toggleFilterPanel: (state) => {
      state.isFilterPanelExpanded = !state.isFilterPanelExpanded;
    },
    toggleLegend: (state) => {
      state.isLegendCollapsed = !state.isLegendCollapsed;
    },
    setLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.language = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', action.payload);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  toggleListModal,
  toggleFilterPanel,
  toggleLegend,
  setLanguage,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;