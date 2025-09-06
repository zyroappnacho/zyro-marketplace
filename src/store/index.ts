import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import reducers with platform-specific fallbacks
import { Platform } from 'react-native';

const authReducer = Platform.OS === 'web' 
  ? require('./slices/authSlice.web').default
  : require('./slices/authSlice').default;

import userManagementReducer from './slices/userManagementSlice';
import dashboardReducer from './slices/dashboardSlice';
import campaignReducer from './slices/campaignSlice';
import collaborationReducer from './slices/collaborationSlice';
import companyDashboardReducer from './slices/companyDashboardSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  userManagement: userManagementReducer,
  dashboard: dashboardReducer,
  campaigns: campaignReducer,
  collaboration: collaborationReducer,
  companyDashboard: companyDashboardReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;