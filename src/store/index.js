import { configureStore } from '@reduxjs/toolkit';
import sidebarReducer from './sidebarSlice';
import darkModeReducer from './darkModeSlice';
import languageReducer from './languageSlice';

const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    darkMode: darkModeReducer,
    language: languageReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export default store;
