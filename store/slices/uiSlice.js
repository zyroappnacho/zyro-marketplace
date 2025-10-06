import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentScreen: 'welcome',
  activeTab: 'home',
  historyTab: 'proximos',
  selectedCity: 'Madrid',
  selectedCategory: 'all',
  modals: {
    citySelector: false,
    categorySelector: false,
    datePickerModal: false,
    filterModal: false,
    profileModal: false
  },
  loading: {
    global: false,
    collaborations: false,
    requests: false,
    profile: false
  },
  theme: {
    isDark: true,
    primaryColor: '#C9A961',
    backgroundColor: '#000000'
  },
  animations: {
    fadeEnabled: true,
    transitionDuration: 200
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentScreen: (state, action) => {
      state.currentScreen = action.payload;
      // Auto-set active tab for main screens
      if (['home', 'map', 'history', 'profile'].includes(action.payload)) {
        state.activeTab = action.payload;
      }
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
      state.currentScreen = action.payload;
    },
    setHistoryTab: (state, action) => {
      state.historyTab = action.payload;
    },
    setSelectedCity: (state, action) => {
      state.selectedCity = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    toggleModal: (state, action) => {
      const { modalName, isOpen } = action.payload;
      state.modals[modalName] = isOpen !== undefined ? isOpen : !state.modals[modalName];
    },
    setLoading: (state, action) => {
      const { type, isLoading } = action.payload;
      state.loading[type] = isLoading;
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    updateTheme: (state, action) => {
      state.theme = { ...state.theme, ...action.payload };
    },
    resetUI: (state) => {
      return {
        ...initialState,
        theme: state.theme // Preserve theme settings
      };
    }
  },
});

export const {
  setCurrentScreen,
  setActiveTab,
  setHistoryTab,
  setSelectedCity,
  setSelectedCategory,
  toggleModal,
  setLoading,
  setGlobalLoading,
  updateTheme,
  resetUI
} = uiSlice.actions;

export default uiSlice.reducer;